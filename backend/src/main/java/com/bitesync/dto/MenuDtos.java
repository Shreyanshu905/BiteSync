package com.bitesync.dto;

import com.bitesync.model.menu.RecipeIngredient;

import java.util.List;

public class MenuDtos {

    public static class CreateMenuItemRequest {
        private String name;
        private String description;
        private Double price;
        private String category;
        private Boolean isVeg = true;
        private Integer stockQuantity = 50;
        private Integer preparationTimeMinutes = 15;
        private String imageUrl = "";
        private List<String> tags;
        private List<RecipeIngredient> recipeIngredients;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Boolean getIsVeg() { return isVeg; }
        public void setIsVeg(Boolean veg) { isVeg = veg; }
        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
        public Integer getPreparationTimeMinutes() { return preparationTimeMinutes; }
        public void setPreparationTimeMinutes(Integer preparationTimeMinutes) { this.preparationTimeMinutes = preparationTimeMinutes; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
        public List<RecipeIngredient> getRecipeIngredients() { return recipeIngredients; }
        public void setRecipeIngredients(List<RecipeIngredient> recipeIngredients) { this.recipeIngredients = recipeIngredients; }
    }
}
