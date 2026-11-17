package com.bitesync.controller;

import com.bitesync.dto.ApiResponse;
import com.bitesync.model.user.User;
import com.bitesync.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<User>>> getStudents() {
        List<User> students = userService.getStudents();
        return ResponseEntity.ok(ApiResponse.success(students, students.size()));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<User>>> getStaff() {
        List<User> staff = userService.getStaff();
        return ResponseEntity.ok(ApiResponse.success(staff, staff.size()));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<User>> createStaff(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.get("role") != null ? body.get("role") : "kitchen";
        String station = body.get("assignedStation");

        User created = userService.createStaff(name, email, password, role, station);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Staff account created", created));
    }

    @PatchMapping("/staff/{id}/toggle-active")
    public ResponseEntity<ApiResponse<User>> toggleActive(@PathVariable String id) {
        User user = userService.toggleStaffActive(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Staff account is now " + (user.isAccountActive() ? "Active" : "Deactivated"),
                user
        ));
    }
}
