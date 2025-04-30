package com.brawls.brawling.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.brawls.brawling.Service.UserService;
import com.brawls.brawling.models.User;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return new ResponseEntity<>("User registered successfully.", HttpStatus.CREATED);  // 201 Created
        } catch (IllegalArgumentException e) {
            // Return the error message and a BAD_REQUEST status
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);  // 400 Bad Request
        }
    }

    // New route to get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);  // 200 OK
    }
}
