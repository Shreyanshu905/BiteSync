package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.dto.AuthDtos;
import com.bitesync.security.UserPrincipal;
import com.bitesync.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDtos.UserProfileDto>> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        StringBuilder tokenHolder = new StringBuilder();
        AuthDtos.UserProfileDto profile = authService.registerStudent(request, tokenHolder);

        ApiResponse<AuthDtos.UserProfileDto> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setToken(tokenHolder.toString());
        response.setUser(profile);
        response.setMessage("Student registered successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDtos.UserProfileDto>> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        StringBuilder tokenHolder = new StringBuilder();
        AuthDtos.UserProfileDto profile = authService.login(request, tokenHolder);

        ApiResponse<AuthDtos.UserProfileDto> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setToken(tokenHolder.toString());
        response.setUser(profile);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDtos.UserProfileDto>> getMe(@AuthenticationPrincipal UserPrincipal currentUser) {
        AuthDtos.UserProfileDto profile = authService.getCurrentUser(currentUser.getId());

        ApiResponse<AuthDtos.UserProfileDto> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setUser(profile);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthDtos.UserProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody AuthDtos.ProfileUpdateRequest request) {

        AuthDtos.UserProfileDto updated = authService.updateProfile(currentUser.getId(), request);

        ApiResponse<AuthDtos.UserProfileDto> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Profile updated successfully");
        response.setUser(updated);

        return ResponseEntity.ok(response);
    }
}
