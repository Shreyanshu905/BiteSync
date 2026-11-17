package com.bitesync.model.user;

public class HostelDetails {
    private String hostelName = "Aryabhata Bhavan";
    private String block = "Block-A";
    private String roomNumber = "101";

    public HostelDetails() {}

    public HostelDetails(String hostelName, String block, String roomNumber) {
        this.hostelName = hostelName;
        this.block = block;
        this.roomNumber = roomNumber;
    }

    public String getHostelName() {
        return hostelName;
    }

    public void setHostelName(String hostelName) {
        this.hostelName = hostelName;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    @Override
    public String toString() {
        return hostelName + " (" + block + ", Room " + roomNumber + ")";
    }
}
