package com.bitesync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "ok");
        status.put("app", "BiteSync Smart Canteen Pre-Ordering System (Java Spring Boot OOPS Backend)");
        status.put("timestamp", new Date());
        status.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime() / 1000.0);
        return ResponseEntity.ok(status);
    }
}
