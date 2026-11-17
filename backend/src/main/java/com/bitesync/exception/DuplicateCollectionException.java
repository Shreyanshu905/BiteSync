package com.bitesync.exception;

public class DuplicateCollectionException extends BiteSyncException {
    private final Object order;

    public DuplicateCollectionException(String message, Object order) {
        super(message);
        this.order = order;
    }

    public Object getOrder() {
        return order;
    }
}
