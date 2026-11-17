package com.bitesync.repository;

import com.bitesync.model.mealplan.MealSkip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealSkipRepository extends MongoRepository<MealSkip, String> {

    List<MealSkip> findByStudentOrderByCreatedAtDesc(String studentId);

    Optional<MealSkip> findByStudentAndDateAndMealPeriod(String studentId, String date, String mealPeriod);
}
