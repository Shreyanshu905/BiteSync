package com.bitesync.model.group;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "grouporders")
public class GroupOrder {

    @Id
    private String id;

    @Indexed(unique = true)
    private String groupCode;

    @Indexed
    private String creator; // User ID

    private String title = "Hostel Group Meal";
    private String status = "open"; // open, locked, placed, cancelled
    private String pickupSlot; // PickupSlot ID

    public static class MemberInfo {
        private String student;
        private Date joinedAt = new Date();

        public MemberInfo() {}
        public MemberInfo(String student) { this.student = student; this.joinedAt = new Date(); }

        public String getStudent() { return student; }
        public void setStudent(String student) { this.student = student; }
        public Date getJoinedAt() { return joinedAt; }
        public void setJoinedAt(Date joinedAt) { this.joinedAt = joinedAt; }
    }

    private List<MemberInfo> members = new ArrayList<>();
    private List<GroupMemberItem> items = new ArrayList<>();
    private Double totalAmount = 0.0;
    private String finalOrder; // Order ID

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public GroupOrder() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public void recalculateTotal() {
        double sum = 0.0;
        if (this.items != null) {
            for (GroupMemberItem i : this.items) {
                if (i.getSubtotal() != null) sum += i.getSubtotal();
            }
        }
        this.totalAmount = sum;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getGroupCode() {
        return groupCode;
    }

    public void setGroupCode(String groupCode) {
        this.groupCode = groupCode != null ? groupCode.toUpperCase() : null;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPickupSlot() {
        return pickupSlot;
    }

    public void setPickupSlot(String pickupSlot) {
        this.pickupSlot = pickupSlot;
    }

    public List<MemberInfo> getMembers() {
        return members;
    }

    public void setMembers(List<MemberInfo> members) {
        this.members = members;
    }

    public List<GroupMemberItem> getItems() {
        return items;
    }

    public void setItems(List<GroupMemberItem> items) {
        this.items = items;
        recalculateTotal();
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getFinalOrder() {
        return finalOrder;
    }

    public void setFinalOrder(String finalOrder) {
        this.finalOrder = finalOrder;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
