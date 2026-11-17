package com.bitesync.payment;

import com.bitesync.exception.InsufficientBalanceException;
import com.bitesync.interfaces.PaymentMethod;
import com.bitesync.model.wallet.Wallet;
import com.bitesync.model.wallet.WalletTransaction;
import com.bitesync.repository.WalletRepository;
import com.bitesync.repository.WalletTransactionRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Demonstrates OOPS:
 * - POLYMORPHISM & STRATEGY: Implements PaymentMethod for internal student digital wallet.
 */
@Component("walletPayment")
public class WalletPayment implements PaymentMethod {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public WalletPayment(WalletRepository walletRepository, WalletTransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        Wallet wallet = walletRepository.findByStudent(request.getStudentId())
                .orElseThrow(() -> new InsufficientBalanceException("Wallet not found for student."));

        if (!wallet.hasSufficientBalance(request.getAmount())) {
            return PaymentResult.failure("Insufficient wallet balance. You have ₹" + wallet.getBalance()
                    + ", but ₹" + request.getAmount() + " is required.");
        }

        wallet.deduct(request.getAmount());
        walletRepository.save(wallet);

        String txnId = "TXN-WAL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        WalletTransaction txn = new WalletTransaction(
                wallet.getId(),
                request.getStudentId(),
                request.getAmount(),
                "order_payment",
                txnId,
                request.getDescription() != null ? request.getDescription() : "Order Payment #" + request.getOrderNumber(),
                wallet.getBalance()
        );
        transactionRepository.save(txn);

        return PaymentResult.success(txnId, "Wallet payment processed successfully", wallet.getBalance());
    }

    @Override
    public PaymentResult refundPayment(String studentId, String transactionId, double amount, String orderNumber) {
        Wallet wallet = walletRepository.findByStudent(studentId).orElse(null);
        if (wallet != null) {
            wallet.credit(amount);
            walletRepository.save(wallet);

            WalletTransaction refundTxn = new WalletTransaction(
                    wallet.getId(),
                    studentId,
                    amount,
                    "refund",
                    orderNumber != null ? orderNumber : "REF-" + System.currentTimeMillis(),
                    "Refund for cancelled order #" + (orderNumber != null ? orderNumber : ""),
                    wallet.getBalance()
            );
            transactionRepository.save(refundTxn);
            return PaymentResult.success(refundTxn.getReferenceId(), "Wallet refund processed successfully", wallet.getBalance());
        }
        return PaymentResult.failure("Wallet not found for refund.");
    }

    @Override
    public String getMethodName() {
        return "wallet";
    }
}
