package com.beastmovieflix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    // ✅ Root URL
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Beast MovieFlix Backend");
        response.put("timestamp", LocalDateTime.now());
        response.put("developer", "Satheesh Kumar");

        return ResponseEntity.ok(response);
    }

    // ✅ Health endpoint
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend Running Successfully 🔥");

        return ResponseEntity.ok(response);
    }
}
