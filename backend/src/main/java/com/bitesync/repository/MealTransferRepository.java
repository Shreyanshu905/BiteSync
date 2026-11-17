package com.bitesync.repository;

import com.bitesync.model.mealplan.MealTransfer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealTransferRepository extends MongoRepository<MealTransfer, String> {

    List<MealTransfer> findBySenderOrderByCreatedAtDesc(String senderId);

    List<MealTransfer> findByRecipientOrderByCreatedAtDesc(String recipientId);
}
