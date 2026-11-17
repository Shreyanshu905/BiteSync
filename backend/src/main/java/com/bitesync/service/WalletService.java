package com.bitesync.service;

import com.bitesync.exception.InsufficientBalanceException;
import com.bitesync.model.wallet.Wallet;
import com.bitesync.model.wallet.WalletTransaction;
import com.bitesync.repository.WalletRepository;
import com.bitesync.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Demonstrates OOPS:
 * - METHOD OVERLOADING: Multiple credit() and debit() methods with distinct parameter signatures.
 * - ENCAPSULATION: Delegates balance checks and updates to Wallet domain methods.
 */
@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository, WalletTransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    public Wallet getOrCreateWallet(String studentId) {
        return walletRepository.findByStudent(studentId)
                .orElseGet(() -> walletRepository.save(new Wallet(studentId, 500.0)));
    }

    public List<WalletTransaction> getTransactions(String studentId) {
        return transactionRepository.findByStudentOrderByCreatedAtDesc(studentId);
    }

    // Overloaded Method 1: Quick credit with default description
    public WalletTransaction credit(String studentId, double amount) {
        return credit(studentId, amount, "Wallet Top-up", "TOP-" + System.currentTimeMillis());
    }

    // Overloaded Method 2: Detailed credit with custom description and reference
    public WalletTransaction credit(String studentId, double amount, String description, String referenceId) {
        Wallet wallet = getOrCreateWallet(studentId);
        wallet.credit(amount);
        walletRepository.save(wallet);

        WalletTransaction txn = new WalletTransaction(
                wallet.getId(),
                studentId,
                amount,
                "topup",
                referenceId != null ? referenceId : "TOP-" + System.currentTimeMillis(),
                description != null ? description : "Wallet Credit",
                wallet.getBalance()
        );
        return transactionRepository.save(txn);
    }

    // Overloaded Method 3: Debit with audit logging
    public WalletTransaction debit(String studentId, double amount, String description, String referenceId) {
        Wallet wallet = getOrCreateWallet(studentId);
        if (!wallet.hasSufficientBalance(amount)) {
            throw new InsufficientBalanceException("Insufficient wallet balance. Available: ₹" + wallet.getBalance()
                    + ", Required: ₹" + amount);
        }
        wallet.deduct(amount);
        walletRepository.save(wallet);

        WalletTransaction txn = new WalletTransaction(
                wallet.getId(),
                studentId,
                amount,
                "order_payment",
                referenceId != null ? referenceId : "TXN-" + System.currentTimeMillis(),
                description,
                wallet.getBalance()
        );
        return transactionRepository.save(txn);
    }
}
