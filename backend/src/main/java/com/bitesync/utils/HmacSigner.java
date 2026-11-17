package com.bitesync.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class HmacSigner {

    private final String qrSecret;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HmacSigner(@Value("${bitesync.qr.secret:bitesync-qr-secret-key-2026}") String qrSecret) {
        this.qrSecret = qrSecret;
    }

    public String generateQRPayload(String orderId, String orderNumber, String pickupToken) {
        try {
            String signature = calculateHmac(orderId + ":" + orderNumber + ":" + pickupToken);
            String sigSub = signature.substring(0, Math.min(12, signature.length()));

            Map<String, String> payload = new HashMap<>();
            payload.put("orderId", orderId);
            payload.put("orderNumber", orderNumber);
            payload.put("pickupToken", pickupToken);
            payload.put("sig", sigSub);

            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR payload", e);
        }
    }

    public static class VerificationResult {
        private final boolean valid;
        private final String message;
        private final String orderId;
        private final String orderNumber;
        private final String pickupToken;

        public VerificationResult(boolean valid, String message, String orderId, String orderNumber, String pickupToken) {
            this.valid = valid;
            this.message = message;
            this.orderId = orderId;
            this.orderNumber = orderNumber;
            this.pickupToken = pickupToken;
        }

        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
        public String getOrderId() { return orderId; }
        public String getOrderNumber() { return orderNumber; }
        public String getPickupToken() { return pickupToken; }
    }

    public VerificationResult verifyQRPayload(String qrString) {
        try {
            JsonNode node = objectMapper.readTree(qrString);
            if (!node.has("orderId") || !node.has("orderNumber") || !node.has("pickupToken") || !node.has("sig")) {
                return new VerificationResult(false, "Malformed QR code payload.", null, null, null);
            }

            String orderId = node.get("orderId").asText();
            String orderNumber = node.get("orderNumber").asText();
            String pickupToken = node.get("pickupToken").asText();
            String sig = node.get("sig").asText();

            String expectedFull = calculateHmac(orderId + ":" + orderNumber + ":" + pickupToken);
            String expectedSig = expectedFull.substring(0, Math.min(12, expectedFull.length()));

            if (!expectedSig.equalsIgnoreCase(sig)) {
                return new VerificationResult(false, "Invalid or tampered QR code signature.", null, null, null);
            }

            return new VerificationResult(true, "QR Verified", orderId, orderNumber, pickupToken);
        } catch (Exception e) {
            return new VerificationResult(false, "Failed to decode QR code data: " + e.getMessage(), null, null, null);
        }
    }

    private String calculateHmac(String data) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(qrSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
