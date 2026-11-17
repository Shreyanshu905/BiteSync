package com.bitesync.utils;

import java.security.SecureRandom;

public class TokenGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String TOKEN_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0, 1, I, O

    public static String generateOrderNumber() {
        int num = 10000 + RANDOM.nextInt(90000);
        return "BS-" + num;
    }

    public static String generatePickupToken() {
        StringBuilder sb = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            sb.append(TOKEN_CHARS.charAt(RANDOM.nextInt(TOKEN_CHARS.length())));
        }
        return "TK-" + sb.toString();
    }
}
