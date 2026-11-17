package com.bitesync.model.order;

/**
 * Demonstrates OOPS:
 * - COMPOSITION PART: Lifecycle is bound intrinsically to Order.
 * - ENCAPSULATION: Subtotal is calculated through quantity * price.
 */
public class OrderItem {

    private String menuItem; // MenuItem ID
    private String name;
    private Double price;
    private Integer quantity;
    private Double subtotal;
    private Boolean isVeg = true;
    private String specialInstructions = "";

    public OrderItem() {}

    public OrderItem(String menuItem, String name, Double price, Integer quantity, Boolean isVeg, String specialInstructions) {
        this.menuItem = menuItem;
        this.name = name;
        this.price = price;
        this.quantity = quantity != null ? quantity : 1;
        this.isVeg = isVeg != null ? isVeg : true;
        this.specialInstructions = specialInstructions != null ? specialInstructions : "";
        this.subtotal = this.price * this.quantity;
    }

    public void recalculateSubtotal() {
        if (this.price != null && this.quantity != null) {
            this.subtotal = this.price * this.quantity;
        }
    }

    // Getters and Setters
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
        recalculateSubtotal();
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        recalculateSubtotal();
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Boolean getIsVeg() {
        return isVeg;
    }

    public void setIsVeg(Boolean veg) {
        isVeg = veg;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}
