package com.bitesync.model.order;

import java.util.Date;

public class StatusTimestamps {
    private Date placedAt = new Date();
    private Date acceptedAt;
    private Date preparingAt;
    private Date readyAt;
    private Date collectedAt;
    private Date cancelledAt;

    public StatusTimestamps() {}

    public Date getPlacedAt() {
        return placedAt;
    }

    public void setPlacedAt(Date placedAt) {
        this.placedAt = placedAt;
    }

    public Date getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Date acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Date getPreparingAt() {
        return preparingAt;
    }

    public void setPreparingAt(Date preparingAt) {
        this.preparingAt = preparingAt;
    }

    public Date getReadyAt() {
        return readyAt;
    }

    public void setReadyAt(Date readyAt) {
        this.readyAt = readyAt;
    }

    public Date getCollectedAt() {
        return collectedAt;
    }

    public void setCollectedAt(Date collectedAt) {
        this.collectedAt = collectedAt;
    }

    public Date getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Date cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
}
