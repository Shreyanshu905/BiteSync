package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.dto.WalletDtos;
import com.bitesync.model.wallet.Wallet;
import com.bitesync.model.wallet.WalletTransaction;
import com.bitesync.security.UserPrincipal;
import com.bitesync.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Wallet>> getWallet(@AuthenticationPrincipal UserPrincipal currentUser) {
        Wallet wallet = walletService.getOrCreateWallet(currentUser.getId());
        List<WalletTransaction> transactions = walletService.getTransactions(currentUser.getId());
        ApiResponse<Wallet> response = ApiResponse.success(wallet);
        response.setBalance(wallet.getBalance());
        response.setCurrency(wallet.getCurrency());
        response.setTransactions(transactions);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/topup")
    public ResponseEntity<ApiResponse<WalletTransaction>> topUp(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody WalletDtos.TopUpRequest request) {

        double amount = request.getAmount() != null ? request.getAmount() : 100.0;
        WalletTransaction txn = walletService.credit(
                currentUser.getId(),
                amount,
                "Online Wallet Top-up (" + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI") + ")",
                "TOP-" + System.currentTimeMillis()
        );

        ApiResponse<WalletTransaction> response = ApiResponse.success("Wallet credited with ₹" + amount, txn);
        response.setBalance(txn.getBalanceAfter());
        response.setTransaction(txn);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransaction>>> getTransactions(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<WalletTransaction> list = walletService.getTransactions(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }
}
