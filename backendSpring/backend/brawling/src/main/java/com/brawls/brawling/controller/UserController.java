package com.brawls.brawling.controller;

import com.brawls.brawling.models.LoginRequest;
import com.brawls.brawling.models.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.brawls.brawling.Service.UserService;
import com.brawls.brawling.models.User;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
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

    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            boolean success = userService.validateLogin(loginRequest.getUsername(), loginRequest.getPassword());

            if (success) {
                // Return a JSON object with a success message
                return ResponseEntity.ok().body(new LoginResponse("Login successful", true));
            } else {
                // Return a JSON object with an error message
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Invalid username or password", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new LoginResponse("An error occurred during login.", false));
        }
    }

    @GetMapping("/users/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findByUsername(username);
        System.out.println("Searching for user: " + username);  // Add logging here
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }




}
