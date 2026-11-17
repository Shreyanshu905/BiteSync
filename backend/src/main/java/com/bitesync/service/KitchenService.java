package com.bitesync.service;

import com.bitesync.model.order.Order;
import com.bitesync.model.order.OrderItem;
import com.bitesync.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KitchenService {

    private final OrderRepository orderRepository;
    private final NotificationServiceImpl notificationService;

    public KitchenService(OrderRepository orderRepository, NotificationServiceImpl notificationService) {
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    public List<Order> getKitchenQueue() {
        return orderRepository.findByStatusInOrderByCreatedAtDesc(List.of("placed", "accepted", "preparing"));
    }

    public List<Order> getReadyOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc("ready");
    }

    public Map<String, Object> getPreparationSummary() {
        List<Order> activeOrders = getKitchenQueue();
        Map<String, Integer> dishQuantities = new HashMap<>();

        for (Order order : activeOrders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    String name = item.getName() != null ? item.getName() : "Unknown Item";
                    int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                    dishQuantities.put(name, dishQuantities.getOrDefault(name, 0) + qty);
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("activeOrdersCount", activeOrders.size());
        result.put("dishRequirements", dishQuantities);
        return result;
    }

    public void reportDelay(int delayMinutes, String reason) {
        String msg = "Kitchen Notice: Food preparation is experiencing an estimated delay of "
                + delayMinutes + " minutes due to peak counter rush. Reason: " + (reason != null ? reason : "High volume");
        notificationService.notifyRole("all", "⚠️ Kitchen Preparation Delay", msg, "system", Map.of("delayMinutes", delayMinutes));
    }
}
