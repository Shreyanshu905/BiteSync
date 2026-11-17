package com.bitesync.repository;

import com.bitesync.model.menu.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {

    List<MenuItem> findByCategory(String category);

    List<MenuItem> findByIsAvailable(Boolean isAvailable);

    List<MenuItem> findByIsFeatured(Boolean isFeatured);
}
