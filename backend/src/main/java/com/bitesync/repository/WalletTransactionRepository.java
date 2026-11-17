package com.bitesync.repository;

import com.bitesync.model.wallet.WalletTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends MongoRepository<WalletTransaction, String> {

    List<WalletTransaction> findByStudentOrderByCreatedAtDesc(String studentId);
}
