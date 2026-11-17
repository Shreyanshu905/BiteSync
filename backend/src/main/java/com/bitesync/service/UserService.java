package com.bitesync.service;

import com.bitesync.exception.BiteSyncException;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.user.Admin;
import com.bitesync.model.user.KitchenStaff;
import com.bitesync.model.user.User;
import com.bitesync.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getStudents() {
        return userRepository.findByRole("student");
    }

    public List<User> getStaff() {
        return userRepository.findAll().stream()
                .filter(u -> "kitchen".equalsIgnoreCase(u.getRole()) || "admin".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
    }

    public User createStaff(String name, String email, String password, String role, String assignedStation) {
        String cleanEmail = email.toLowerCase().trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BiteSyncException("Account with email " + cleanEmail + " already exists.");
        }

        String encodedPassword = passwordEncoder.encode(password);
        User user;
        if ("admin".equalsIgnoreCase(role)) {
            Admin admin = new Admin(name, cleanEmail, encodedPassword, "Administration");
            user = admin;
        } else {
            KitchenStaff staff = new KitchenStaff(name, cleanEmail, encodedPassword, assignedStation != null ? assignedStation : "Main Prep Counter");
            user = staff;
        }

        return userRepository.save(user);
    }

    public User toggleStaffActive(String staffId) {
        User user = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + staffId));

        if (user.isAccountActive()) {
            user.deactivate();
        } else {
            user.activate();
        }
        return userRepository.save(user);
    }
}
