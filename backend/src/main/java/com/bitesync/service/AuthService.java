package com.bitesync.service;

import com.bitesync.dto.AuthDtos;
import com.bitesync.exception.BiteSyncException;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.user.Admin;
import com.bitesync.model.user.KitchenStaff;
import com.bitesync.model.user.Student;
import com.bitesync.model.user.User;
import com.bitesync.model.wallet.Wallet;
import com.bitesync.repository.UserRepository;
import com.bitesync.security.JwtTokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final Random random = new Random();

    public AuthService(UserRepository userRepository,
                       WalletService walletService,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthDtos.UserProfileDto registerStudent(AuthDtos.RegisterRequest request, StringBuilder tokenHolder) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BiteSyncException("An account with this email already exists");
        }

        String studentId = request.getStudentId();
        if (studentId == null || studentId.trim().isEmpty()) {
            studentId = "STU-" + (1000 + random.nextInt(9000));
        } else {
            studentId = studentId.toUpperCase().trim();
        }

        Student student = new Student(
                request.getName(),
                email,
                passwordEncoder.encode(request.getPassword()),
                studentId,
                request.getHostel()
        );
        if (request.getPhone() != null) student.setPhone(request.getPhone());
        if (request.getDietaryPreference() != null) student.setDietaryPreference(request.getDietaryPreference());

        User savedUser = userRepository.save(student);

        // Welcome Sign-up Bonus ₹500
        walletService.credit(savedUser.getId(), 500.0, "Welcome Sign-up Bonus", "WELCOME-500");

        String token = tokenProvider.generateToken(savedUser.getId());
        if (tokenHolder != null) tokenHolder.append(token);

        return buildProfileDto(savedUser, 500.0);
    }

    public AuthDtos.UserProfileDto login(AuthDtos.LoginRequest request, StringBuilder tokenHolder) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials. User not found."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials. Incorrect password.");
        }

        if (!user.isAccountActive()) {
            throw new BiteSyncException("Account is deactivated. Contact canteen administrator.");
        }

        String token = tokenProvider.generateToken(user.getId());
        if (tokenHolder != null) tokenHolder.append(token);

        double balance = 0.0;
        if ("student".equalsIgnoreCase(user.getRole())) {
            Wallet wallet = walletService.getOrCreateWallet(user.getId());
            balance = wallet.getBalance();
        }

        return buildProfileDto(user, balance);
    }

    public AuthDtos.UserProfileDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        double balance = 0.0;
        if ("student".equalsIgnoreCase(user.getRole())) {
            Wallet wallet = walletService.getOrCreateWallet(user.getId());
            balance = wallet.getBalance();
        }

        return buildProfileDto(user, balance);
    }

    public AuthDtos.UserProfileDto updateProfile(String userId, AuthDtos.ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        if (user instanceof Student student) {
            if (request.getHostel() != null) {
                student.updateHostelMapping(
                        request.getHostel().getHostelName(),
                        request.getHostel().getBlock(),
                        request.getHostel().getRoomNumber()
                );
            }
            if (request.getDietaryPreference() != null) {
                student.setDietaryPreference(request.getDietaryPreference());
            }
        }

        User updated = userRepository.save(user);

        double balance = 0.0;
        if (user instanceof Student) {
            balance = walletService.getOrCreateWallet(userId).getBalance();
        }

        return buildProfileDto(updated, balance);
    }

    private AuthDtos.UserProfileDto buildProfileDto(User user, double balance) {
        AuthDtos.UserProfileDto dto = new AuthDtos.UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setWalletBalance(balance);

        if (user instanceof Student s) {
            dto.setStudentId(s.getStudentId());
            dto.setHostel(s.getHostel());
            dto.setDietaryPreference(s.getDietaryPreference());
        }

        return dto;
    }
}
