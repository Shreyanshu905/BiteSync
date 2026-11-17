package com.bitesync.model.group;

public class GroupMemberItem {
    private String student; // User ID
    private String studentName;
    private String menuItem; // MenuItem ID
    private String name;
    private Double price;
    private Integer quantity = 1;
    private Double subtotal;

    public GroupMemberItem() {}

    public GroupMemberItem(String student, String studentName, String menuItem, String name, Double price, Integer quantity) {
        this.student = student;
        this.studentName = studentName;
        this.menuItem = menuItem;
        this.name = name;
        this.price = price;
        this.quantity = quantity != null ? quantity : 1;
        this.subtotal = this.price != null ? this.price * this.quantity : 0.0;
    }

    public String getStudent() {
        return student;
    }

    public void setStudent(String student) {
        this.student = student;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(String menuItem) {
        this.menuItem = menuItem;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
        if (this.price != null && this.quantity != null) {
            this.subtotal = this.price * this.quantity;
        }
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        if (this.price != null && this.quantity != null) {
            this.subtotal = this.price * this.quantity;
        }
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}
