package com.bitesync.model.menu;

public class RecipeIngredient {
    private String ingredient; // InventoryItem ID
    private Double quantity;
    private String unit;

    public RecipeIngredient() {}

    public RecipeIngredient(String ingredient, Double quantity, String unit) {
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.unit = unit;
    }

    public String getIngredient() {
        return ingredient;
    }

    public void setIngredient(String ingredient) {
        this.ingredient = ingredient;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
