package com.bitesync.repository;

import com.bitesync.model.inventory.InventoryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryItemRepository extends MongoRepository<InventoryItem, String> {

    Optional<InventoryItem> findByName(String name);
}
