package com.bitesync.repository;

import com.bitesync.model.review.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByMenuItem(String menuItemId);

    List<Review> findByOrder(String orderId);
}
