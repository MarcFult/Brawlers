package com.dlc.authentification.controller;

import com.dlc.authentification.model.User;
import com.dlc.authentification.model.responses.UserResponse;
import com.dlc.authentification.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService svc;

    public UserController(UserService svc) {
        this.svc = svc;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = svc.getAllUsers().stream()
                .map(u -> new UserResponse(u.getId(), u.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User u = svc.getById(id);
        UserResponse resp = new UserResponse(u.getId(), u.getEmail());
        return ResponseEntity.ok(resp);
    }
}
