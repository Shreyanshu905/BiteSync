package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.dto.OrderDtos;
import com.bitesync.model.order.Order;
import com.bitesync.security.UserPrincipal;
import com.bitesync.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody OrderDtos.CreateOrderRequest request) {

        Order order = orderService.placeOrder(
                currentUser.getId(),
                request.getItems(),
                request.getPickupSlotId(),
                request.getPaymentMethod(),
                request.getCouponCode(),
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully! Keep your QR code ready at the counter.", order));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Order> orders = orderService.getStudentOrders(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(orders, orders.size()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders, orders.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Order order = orderService.getOrderById(id, currentUser.getId(), currentUser.getRole());
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody(required = false) OrderDtos.CancelOrderRequest request) {

        String reason = request != null ? request.getReason() : null;
        Order order = orderService.cancelOrder(id, currentUser.getId(), currentUser.getRole(), reason);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully. Full refund has been credited to your wallet.", order));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable String id,
            @RequestBody OrderDtos.StatusUpdateRequest request) {

        Order order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order #" + order.getOrderNumber() + " status updated to " + request.getStatus(), order));
    }

    @PostMapping("/verify-pickup")
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")
    public ResponseEntity<ApiResponse<Order>> verifyPickup(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody OrderDtos.VerifyPickupRequest request) {

        Order order = orderService.verifyAndCollectOrder(request.getQrData(), request.getPickupToken(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("✅ ORDER VERIFIED & COLLECTED! Order #" + order.getOrderNumber() + " handed over.", order));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<ApiResponse<Order>> rateOrder(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody OrderDtos.RateOrderRequest request) {

        Order order = orderService.rateOrder(id, currentUser.getId(), request.getRating(), request.getFeedback());
        return ResponseEntity.ok(ApiResponse.success("Thank you for your rating!", order));
    }
}
