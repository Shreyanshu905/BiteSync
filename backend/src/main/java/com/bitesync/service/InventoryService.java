package com.bitesync.service;

import com.bitesync.dto.InventoryDtos;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.inventory.InventoryItem;
import com.bitesync.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryRepository;

    public InventoryService(InventoryItemRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<InventoryItem> getLowStockAlerts() {
        return inventoryRepository.findAll().stream()
                .filter(InventoryItem::isLowStock)
                .collect(Collectors.toList());
    }

    public InventoryItem addInventoryItem(InventoryDtos.CreateInventoryRequest request) {
        InventoryItem item = new InventoryItem(
                request.getName(),
                request.getCategory(),
                request.getCurrentStock(),
                request.getUnit(),
                request.getMinThreshold()
        );
        if (request.getCostPerUnit() != null) item.setCostPerUnit(request.getCostPerUnit());
        if (request.getSupplier() != null) item.setSupplier(request.getSupplier());
        return inventoryRepository.save(item);
    }

    public InventoryItem updateInventoryItem(String id, InventoryDtos.CreateInventoryRequest request) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        if (request.getName() != null) item.setName(request.getName());
        if (request.getCategory() != null) item.setCategory(request.getCategory());
        if (request.getCurrentStock() != null) item.setCurrentStock(request.getCurrentStock());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getMinThreshold() != null) item.setMinThreshold(request.getMinThreshold());
        if (request.getCostPerUnit() != null) item.setCostPerUnit(request.getCostPerUnit());
        if (request.getSupplier() != null) item.setSupplier(request.getSupplier());

        return inventoryRepository.save(item);
    }

    public InventoryItem restockItem(String id, InventoryDtos.RestockRequest request) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        double qty = request.getQuantity() != null ? request.getQuantity() : 0.0;
        double cost = request.getCost() != null ? request.getCost() : 0.0;
        item.replenish(qty, cost, request.getNote());

        return inventoryRepository.save(item);
    }
}
