package com.bitesync.repository;

import com.bitesync.model.mealplan.MealPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealPlanRepository extends MongoRepository<MealPlan, String> {

    List<MealPlan> findByIsActive(Boolean isActive);
}
