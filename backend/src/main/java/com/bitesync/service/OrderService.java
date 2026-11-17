package com.bitesync.service;

import com.bitesync.discount.DiscountFactory;
import com.bitesync.dto.OrderDtos;
import com.bitesync.exception.*;
import com.bitesync.interfaces.PaymentMethod;
import com.bitesync.model.inventory.InventoryItem;
import com.bitesync.model.menu.MenuItem;
import com.bitesync.model.menu.RecipeIngredient;
import com.bitesync.model.order.Order;
import com.bitesync.model.order.OrderItem;
import com.bitesync.model.order.SlotDisplay;
import com.bitesync.model.review.Review;
import com.bitesync.model.slot.PickupSlot;
import com.bitesync.model.user.Student;
import com.bitesync.model.user.User;
import com.bitesync.payment.PaymentFactory;
import com.bitesync.payment.PaymentRequest;
import com.bitesync.payment.PaymentResult;
import com.bitesync.repository.*;
import com.bitesync.utils.HmacSigner;
import com.bitesync.utils.TokenGenerator;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;

/**
 * Demonstrates OOPS:
 * - METHOD OVERLOADING: placeOrder() overloads for varied ordering workflows.
 * - RUNTIME POLYMORPHISM: Dispatches to PaymentMethod implementations via PaymentFactory.
 * - STRATEGY PATTERN: Dispatches to DiscountStrategy implementations via DiscountFactory.
 * - ENCAPSULATION: Enforces slot capacity and prevents duplicate meal counter collections.
 * - AGGREGATION & COMPOSITION: Composes Order with OrderItems and links with Student and PickupSlot.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final PickupSlotRepository slotRepository;
    private final InventoryItemRepository inventoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final PaymentFactory paymentFactory;
    private final DiscountFactory discountFactory;
    private final HmacSigner hmacSigner;
    private final NotificationServiceImpl notificationService;

    public OrderService(OrderRepository orderRepository,
                        MenuItemRepository menuItemRepository,
                        PickupSlotRepository slotRepository,
                        InventoryItemRepository inventoryRepository,
                        UserRepository userRepository,
                        ReviewRepository reviewRepository,
                        PaymentFactory paymentFactory,
                        DiscountFactory discountFactory,
                        HmacSigner hmacSigner,
                        NotificationServiceImpl notificationService) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.slotRepository = slotRepository;
        this.inventoryRepository = inventoryRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.paymentFactory = paymentFactory;
        this.discountFactory = discountFactory;
        this.hmacSigner = hmacSigner;
        this.notificationService = notificationService;
    }

    // ==========================================
    // METHOD OVERLOADING (Compile-Time Polymorphism)
    // ==========================================

    // Overload 1: Quick express order
    public Order placeOrder(String studentId, List<OrderDtos.CartItemDto> items) {
        return placeOrder(studentId, items, null, "wallet", null, "Express Order");
    }

    // Overload 2: Standard pre-order with slot
    public Order placeOrder(String studentId, List<OrderDtos.CartItemDto> items, String pickupSlotId) {
        return placeOrder(studentId, items, pickupSlotId, "wallet", null, null);
    }

    // Overload 3: Full checkout with custom payment method and coupon code
    public Order placeOrder(String studentId,
                            List<OrderDtos.CartItemDto> items,
                            String pickupSlotId,
                            String paymentMethod,
                            String couponCode,
                            String notes) {

        if (items == null || items.isEmpty()) {
            throw new BiteSyncException("Cart cannot be empty.");
        }

        // 1. Validate & Reserve Pickup Slot
        PickupSlot slot = null;
        if (pickupSlotId != null && !pickupSlotId.trim().isEmpty()) {
            slot = slotRepository.findById(pickupSlotId)
                    .orElseThrow(() -> new ResourceNotFoundException("Selected pickup slot not found."));

            if (!slot.hasAvailableCapacity()) {
                throw new SlotFullException("The selected pickup slot is either full or closed. Please select another slot.");
            }
            slot.bookSlot();
            slot = slotRepository.save(slot);
        }

        try {
            // 2. Validate Items & Build OrderItems (Composition)
            List<OrderItem> processedItems = new ArrayList<>();
            double subtotal = 0.0;
            int maxPrepTime = 10;

            for (OrderDtos.CartItemDto cartItem : items) {
                String dishId = cartItem.getResolvedId();
                if (dishId == null) {
                    throw new ResourceNotFoundException("Invalid dish item reference.");
                }

                MenuItem dish = menuItemRepository.findById(dishId)
                        .orElseThrow(() -> new FoodUnavailableException("Dish not found in canteen menu: " + dishId));

                int requestedQty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 1;
                if (!dish.hasAvailableStock(requestedQty)) {
                    throw new FoodUnavailableException("\"" + dish.getName() + "\" is sold out or has insufficient stock. Please adjust your cart.");
                }

                OrderItem orderItem = new OrderItem(
                        dish.getId(),
                        dish.getName(),
                        dish.getPrice(),
                        requestedQty,
                        dish.getIsVeg(),
                        cartItem.getSpecialInstructions()
                );
                subtotal += orderItem.getSubtotal();
                if (dish.getPreparationTimeMinutes() != null && dish.getPreparationTimeMinutes() > maxPrepTime) {
                    maxPrepTime = dish.getPreparationTimeMinutes();
                }
                processedItems.add(orderItem);
            }

            // 3. Polymorphic Discount Calculation (Strategy Pattern)
            double discountAmount = discountFactory.resolveAndApplyDiscount(subtotal, couponCode);
            double finalAmount = Math.max(0.0, subtotal - discountAmount);

            // 4. Generate Identifiers & HMAC QR Payload
            String orderNumber = TokenGenerator.generateOrderNumber();
            String pickupToken = TokenGenerator.generatePickupToken();
            String tempId = new org.bson.types.ObjectId().toHexString();
            String qrPayload = hmacSigner.generateQRPayload(tempId, orderNumber, pickupToken);

            // 5. Polymorphic Payment Processing (Runtime Polymorphism)
            PaymentMethod method = paymentFactory.getPaymentMethod(paymentMethod);
            PaymentRequest payReq = new PaymentRequest(
                    studentId,
                    finalAmount,
                    orderNumber,
                    "Meal Order #" + orderNumber,
                    paymentMethod
            );
            PaymentResult payResult = method.processPayment(payReq);
            if (!payResult.isSuccessful()) {
                throw new PaymentFailedException(payResult.getMessage());
            }

            // 6. Deduct Menu Stock & Kitchen Inventory
            for (OrderItem item : processedItems) {
                menuItemRepository.findById(item.getMenuItem()).ifPresent(dish -> {
                    dish.deductStock(item.getQuantity());
                    menuItemRepository.save(dish);

                    // Automatic recipe ingredient deduction
                    if (dish.getRecipeIngredients() != null) {
                        for (RecipeIngredient recipe : dish.getRecipeIngredients()) {
                            if (recipe.getIngredient() != null && recipe.getQuantity() != null) {
                                inventoryRepository.findById(recipe.getIngredient()).ifPresent(inv -> {
                                    inv.consume(recipe.getQuantity() * item.getQuantity());
                                    inventoryRepository.save(inv);
                                });
                            }
                        }
                    }
                });
            }

            // 7. Calculate Cancellation Deadline
            Date cancellationDeadline = new Date(System.currentTimeMillis() + 15 * 60 * 1000);
            if (slot != null && slot.getStartTime() != null) {
                try {
                    String[] parts = slot.getStartTime().split(":");
                    int hour = Integer.parseInt(parts[0]);
                    int min = Integer.parseInt(parts[1]);
                    LocalDate slotDate = LocalDate.parse(slot.getDate());
                    Date slotStart = Date.from(slotDate.atTime(LocalTime.of(hour, min))
                            .atZone(ZoneId.systemDefault()).toInstant());
                    Date cutoff = new Date(slotStart.getTime() - 15 * 60 * 1000);
                    if (cutoff.after(new Date())) {
                        cancellationDeadline = cutoff;
                    }
                } catch (Exception ignored) {}
            }

            // 8. Create and Persist Order
            Order order = new Order();
            order.setId(tempId);
            order.setOrderNumber(orderNumber);
            order.setStudent(studentId);
            order.setItems(processedItems);
            order.setTotalAmount(subtotal);
            order.setDiscountAmount(discountAmount);
            order.setFinalAmount(finalAmount);
            order.setStatus("placed");
            order.setPickupToken(pickupToken);
            order.setQrCodeData(qrPayload);
            order.setPaymentMethod(method.getMethodName());
            order.setPaymentStatus("completed");
            order.getPaymentDetails().setTransactionId(payResult.getTransactionId());
            order.getPaymentDetails().setPaidAt(new Date());
            order.setCancellationDeadline(cancellationDeadline);
            order.setEstimatedWaitTimeMinutes(maxPrepTime);

            if (slot != null) {
                order.setPickupSlot(slot.getId());
                order.setSlotDisplay(new SlotDisplay(slot.getStartTime(), slot.getEndTime(), slot.getDate(), slot.getMealPeriod()));
            }

            userRepository.findById(studentId).ifPresent(u -> {
                if (u instanceof Student s && s.getHostel() != null) {
                    order.setHostelDetails(s.getHostel());
                }
            });

            Order savedOrder = orderRepository.save(order);

            // 9. Send Notification to Student
            Map<String, Object> notifData = new HashMap<>();
            notifData.put("orderId", savedOrder.getId());
            notifData.put("orderNumber", savedOrder.getOrderNumber());
            notificationService.notifyStudent(
                    studentId,
                    "Order Confirmed! 🎉",
                    "Your meal order #" + orderNumber + " is confirmed. Pickup Token: " + pickupToken,
                    "order_status",
                    notifData
            );

            return savedOrder;

        } catch (Exception ex) {
            // Rollback slot capacity booking on any processing failure
            if (slot != null) {
                slot.releaseSlot();
                slotRepository.save(slot);
            }
            if (ex instanceof BiteSyncException) throw (BiteSyncException) ex;
            throw new BiteSyncException("Order creation failed: " + ex.getMessage(), ex);
        }
    }

    public List<Order> getStudentOrders(String studentId) {
        return orderRepository.findByStudentOrderByCreatedAtDesc(studentId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order getOrderById(String orderId, String requesterId, String requesterRole) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if ("student".equalsIgnoreCase(requesterRole) && !order.getStudent().equals(requesterId)) {
            throw new UnauthorizedActionException("Not authorized to view this order.");
        }
        return order;
    }

    public Order cancelOrder(String orderId, String requesterId, String requesterRole, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if ("student".equalsIgnoreCase(requesterRole) && !order.getStudent().equals(requesterId)) {
            throw new UnauthorizedActionException("Not authorized to cancel this order.");
        }

        if (order.isCollected() || order.isCancelled()) {
            throw new BiteSyncException("Order cannot be cancelled because it is already marked as " + order.getStatus());
        }

        if ("student".equalsIgnoreCase(requesterRole) && !order.canBeCancelled()) {
            throw new CancellationExpiredException("Cancellation cutoff time has passed. Kitchen is already preparing your meal.");
        }

        order.markCancelled(reason != null ? reason : ("Cancelled by " + requesterRole));

        // Release pickup slot
        if (order.getPickupSlot() != null) {
            slotRepository.findById(order.getPickupSlot()).ifPresent(slot -> {
                slot.releaseSlot();
                slotRepository.save(slot);
            });
        }

        // Restore dish stock
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                menuItemRepository.findById(item.getMenuItem()).ifPresent(dish -> {
                    dish.replenishStock(item.getQuantity());
                    menuItemRepository.save(dish);
                });
            }
        }

        // Polymorphic refund
        PaymentMethod method = paymentFactory.getPaymentMethod(order.getPaymentMethod());
        method.refundPayment(order.getStudent(), order.getPaymentDetails().getTransactionId(), order.getFinalAmount(), order.getOrderNumber());
        order.setPaymentStatus("refunded");
        order.getPaymentDetails().setRefundedAt(new Date());

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(String orderId, String status) {
        List<String> valid = List.of("placed", "accepted", "preparing", "ready");
        if (!valid.contains(status.toLowerCase())) {
            throw new BiteSyncException("Invalid status transition: \"" + status + "\". Valid: " + valid);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if (order.isCollected()) {
            throw new BiteSyncException("Order has already been collected and closed.");
        }
        if (order.isCancelled()) {
            throw new BiteSyncException("Cannot update status of a cancelled order.");
        }

        if ("accepted".equalsIgnoreCase(status)) order.markAccepted();
        if ("preparing".equalsIgnoreCase(status)) order.markPreparing();
        if ("ready".equalsIgnoreCase(status)) {
            order.markReady();
            // Notify student
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", order.getId());
            data.put("orderNumber", order.getOrderNumber());
            notificationService.notifyStudent(
                    order.getStudent(),
                    "🍱 Food is Ready for Pickup!",
                    "Your order #" + order.getOrderNumber() + " is hot and ready at the counter. Token: " + order.getPickupToken(),
                    "order_status",
                    data
            );
        }

        return orderRepository.save(order);
    }

    public Order verifyAndCollectOrder(String qrData, String pickupToken, String staffId) {
        if ((qrData == null || qrData.trim().isEmpty()) && (pickupToken == null || pickupToken.trim().isEmpty())) {
            throw new BiteSyncException("Please provide either a scanned QR payload or a manual pickup token.");
        }

        Order order = null;

        if (qrData != null && !qrData.trim().isEmpty()) {
            HmacSigner.VerificationResult v = hmacSigner.verifyQRPayload(qrData.trim());
            if (!v.isValid()) {
                throw new BiteSyncException("QR Verification Failed: " + v.getMessage());
            }
            order = orderRepository.findById(v.getOrderId())
                    .orElseGet(() -> orderRepository.findByOrderNumber(v.getOrderNumber()).orElse(null));
        } else {
            String cleanToken = pickupToken.trim().toUpperCase();
            order = orderRepository.findByPickupToken(cleanToken).orElse(null);
        }

        if (order == null) {
            throw new OrderNotFoundException("No matching order found for this token or QR code.");
        }

        // CRITICAL OOPS RULE: Duplicate collection prevention
        if (order.isCollected()) {
            String collectedAt = order.getStatusTimestamps().getCollectedAt() != null
                    ? order.getStatusTimestamps().getCollectedAt().toString()
                    : "earlier";
            throw new DuplicateCollectionException(
                    "⚠️ ALREADY COLLECTED! Order #" + order.getOrderNumber() + " was already collected at "
                            + collectedAt + ". Cannot be handed over again!",
                    order
            );
        }

        if (order.isCancelled()) {
            throw new BiteSyncException("⛔ ORDER CANCELLED! Order #" + order.getOrderNumber() + " was cancelled and cannot be fulfilled.");
        }

        order.markCollected(staffId);
        return orderRepository.save(order);
    }

    public Order rateOrder(String orderId, String studentId, Integer rating, String feedback) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if (!order.getStudent().equals(studentId)) {
            throw new UnauthorizedActionException("Not authorized to rate this order.");
        }

        order.setRating(rating != null ? rating : 5);
        order.setFeedback(feedback != null ? feedback : "");

        Review review = new Review();
        review.setStudent(studentId);
        review.setOrder(orderId);
        review.setRating(rating != null ? rating : 5);
        review.setComment(feedback != null ? feedback : "");
        reviewRepository.save(review);

        return orderRepository.save(order);
    }
}
