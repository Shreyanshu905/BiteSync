package com.bitesync.service;

import com.bitesync.dto.MenuDtos;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.menu.MenuItem;
import com.bitesync.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems(String category, Boolean isVeg, String search, Boolean availableOnly) {
        List<MenuItem> all = menuItemRepository.findAll();

        return all.stream()
                .filter(item -> {
                    if (category != null && !category.equalsIgnoreCase("all") && !category.trim().isEmpty()) {
                        if (item.getCategory() == null || !item.getCategory().equalsIgnoreCase(category.trim())) {
                            return false;
                        }
                    }
                    if (isVeg != null) {
                        if (item.getIsVeg() == null || !item.getIsVeg().equals(isVeg)) {
                            return false;
                        }
                    }
                    if (Boolean.TRUE.equals(availableOnly)) {
                        if (item.getIsAvailable() == null || !item.getIsAvailable() || item.getStockQuantity() == null || item.getStockQuantity() <= 0) {
                            return false;
                        }
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        boolean matchName = item.getName() != null && item.getName().toLowerCase().contains(s);
                        boolean matchDesc = item.getDescription() != null && item.getDescription().toLowerCase().contains(s);
                        if (!matchName && !matchDesc) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public MenuItem getMenuItemById(String id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found with id: " + id));
    }

    public MenuItem createMenuItem(MenuDtos.CreateMenuItemRequest request) {
        MenuItem item = new MenuItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription() != null ? request.getDescription() : "");
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory());
        item.setIsVeg(request.getIsVeg() != null ? request.getIsVeg() : true);
        item.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 50);
        item.setPreparationTimeMinutes(request.getPreparationTimeMinutes() != null ? request.getPreparationTimeMinutes() : 15);
        item.setImageUrl(request.getImageUrl() != null ? request.getImageUrl() : "");
        if (request.getTags() != null) item.setTags(request.getTags());
        if (request.getRecipeIngredients() != null) item.setRecipeIngredients(request.getRecipeIngredients());

        return menuItemRepository.save(item);
    }

    public MenuItem updateMenuItem(String id, MenuItem updateData) {
        MenuItem existing = getMenuItemById(id);

        if (updateData.getName() != null) existing.setName(updateData.getName());
        if (updateData.getDescription() != null) existing.setDescription(updateData.getDescription());
        if (updateData.getPrice() != null) existing.setPrice(updateData.getPrice());
        if (updateData.getCategory() != null) existing.setCategory(updateData.getCategory());
        if (updateData.getIsVeg() != null) existing.setIsVeg(updateData.getIsVeg());
        if (updateData.getIsAvailable() != null) existing.setIsAvailable(updateData.getIsAvailable());
        if (updateData.getStockQuantity() != null) existing.setStockQuantity(updateData.getStockQuantity());
        if (updateData.getPreparationTimeMinutes() != null) existing.setPreparationTimeMinutes(updateData.getPreparationTimeMinutes());
        if (updateData.getImageUrl() != null) existing.setImageUrl(updateData.getImageUrl());
        if (updateData.getIsFeatured() != null) existing.setIsFeatured(updateData.getIsFeatured());
        if (updateData.getTags() != null) existing.setTags(updateData.getTags());
        if (updateData.getRecipeIngredients() != null) existing.setRecipeIngredients(updateData.getRecipeIngredients());

        return menuItemRepository.save(existing);
    }

    public MenuItem toggleAvailability(String id) {
        MenuItem item = getMenuItemById(id);
        item.toggleAvailability();
        return menuItemRepository.save(item);
    }

    public void deleteMenuItem(String id) {
        menuItemRepository.deleteById(id);
    }
}
