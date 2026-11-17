package com.bitesync.repository;

import com.bitesync.model.slot.PickupSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PickupSlotRepository extends MongoRepository<PickupSlot, String> {

    List<PickupSlot> findByDate(String date);

    List<PickupSlot> findByDateAndMealPeriod(String date, String mealPeriod);

    Optional<PickupSlot> findByDateAndMealPeriodAndStartTime(String date, String mealPeriod, String startTime);
}
