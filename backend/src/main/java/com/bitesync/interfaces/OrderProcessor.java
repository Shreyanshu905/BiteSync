package com.bitesync.interfaces;

import com.bitesync.model.order.Order;

public interface OrderProcessor {

    Order processOrder(String studentId, String pickupSlotId, String paymentMethod, String couponCode, Object items);

    void verifyPickup(String qrPayload, String token, String staffId);
}
