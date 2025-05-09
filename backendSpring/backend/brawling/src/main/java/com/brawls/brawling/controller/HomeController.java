package com.brawls.brawling.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Welcome to the game!");
    }
/*
    @GetMapping("/")
    public String home() {
        return "forward:/index.html"; // This will forward to your React index.html
    }

    @GetMapping("/game")
    public String game() {
        return "forward:/index.html"; // All routes should forward to React
    }


 */
}
