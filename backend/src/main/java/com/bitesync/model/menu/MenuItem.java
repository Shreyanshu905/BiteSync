package com.bitesync.model.menu;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Demonstrates OOPS:
 * - ENCAPSULATION: Private fields and domain methods protecting inventory and availability invariants.
 * - AGGREGATION: Contains RecipeIngredients linked to raw kitchen inventory items.
 */
@Document(collection = "menuitems")
public class MenuItem {

    @Id
    private String id;

    private String name;
    private String description = "";
    private Double price;
    private String category; // breakfast, lunch, snacks, dinner, late-night
    private Boolean isVeg = true;
    private Boolean isAvailable = true;
    private Integer stockQuantity = 50;
    private Integer lowStockThreshold = 10;
    private Integer preparationTimeMinutes = 15;
    private String imageUrl = "";
    private Double rating = 4.5;
    private Integer ratingCount = 12;
    private Boolean isFeatured = false;
    private List<String> tags = new ArrayList<>();
    private List<String> availableMealWindows = new ArrayList<>();
    private List<RecipeIngredient> recipeIngredients = new ArrayList<>();

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public MenuItem() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public MenuItem(String name, Double price, String category, Boolean isVeg) {
        this();
        this.name = name;
        this.price = price;
        this.category = category;
        this.isVeg = isVeg;
    }

    // Domain Business Methods (Encapsulation)
    public boolean hasAvailableStock(int requestedQuantity) {
        return Boolean.TRUE.equals(this.isAvailable) && this.stockQuantity != null && this.stockQuantity >= requestedQuantity;
    }

    public void deductStock(int quantity) {
        if (!hasAvailableStock(quantity)) {
            throw new IllegalStateException("Insufficient stock for dish: " + this.name);
        }
        this.stockQuantity -= quantity;
        if (this.stockQuantity <= 0) {
            this.stockQuantity = 0;
            this.isAvailable = false;
        }
    }

    public void replenishStock(int quantity) {
        if (this.stockQuantity == null) this.stockQuantity = 0;
        this.stockQuantity += quantity;
        if (this.stockQuantity > 0) {
            this.isAvailable = true;
        }
    }

    public void toggleAvailability() {
        this.isAvailable = !Boolean.TRUE.equals(this.isAvailable);
    }

    public boolean isLowStock() {
        return this.stockQuantity != null && this.lowStockThreshold != null && this.stockQuantity <= this.lowStockThreshold;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getIsVeg() {
        return isVeg;
    }

    public void setIsVeg(Boolean veg) {
        isVeg = veg;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean available) {
        isAvailable = available;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public Integer getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }

    public void setPreparationTimeMinutes(Integer preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean featured) {
        isFeatured = featured;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getAvailableMealWindows() {
        return availableMealWindows;
    }

    public void setAvailableMealWindows(List<String> availableMealWindows) {
        this.availableMealWindows = availableMealWindows;
    }

    public List<RecipeIngredient> getRecipeIngredients() {
        return recipeIngredients;
    }

    public void setRecipeIngredients(List<RecipeIngredient> recipeIngredients) {
        this.recipeIngredients = recipeIngredients;
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
