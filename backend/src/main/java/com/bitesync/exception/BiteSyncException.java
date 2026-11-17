package com.bitesync.exception;

public class BiteSyncException extends RuntimeException {
    public BiteSyncException(String message) {
        super(message);
    }

    public BiteSyncException(String message, Throwable cause) {
        super(message, cause);
    }
}
