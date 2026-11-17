package com.bitesync.repository;

import com.bitesync.model.mealplan.MealCredit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealCreditRepository extends MongoRepository<MealCredit, String> {

    List<MealCredit> findByStudentAndIsActive(String studentId, Boolean isActive);

    Optional<MealCredit> findFirstByStudentAndIsActiveAndRemainingCreditsGreaterThan(String studentId, Boolean isActive, Integer minCredits);
}
