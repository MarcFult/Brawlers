package com.dlc.authentification.controller;

import com.dlc.authentification.model.User;
import com.dlc.authentification.model.requests.LoginRequest;
import com.dlc.authentification.model.requests.RegisterRequest;
import com.dlc.authentification.model.responses.LoginResponse;
import com.dlc.authentification.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService svc;

    @Autowired
    public AuthController(AuthenticationManager authManager,
            UserService svc) {
        this.authManager = authManager;
        this.svc = svc;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            User created = svc.register(req.getEmail(), req.getPassword());
            return ResponseEntity.ok("User registered with ID " + created.getId());
        } catch (IllegalArgumentException e) {
            // e.g. email already in use
            return ResponseEntity
                    .badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Long>> getUserId(@RequestParam("email") String email) {
        Long id = svc.getUserIdByEmail(email);
        return ResponseEntity.ok(Collections.singletonMap("id", id));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest body,
            HttpServletRequest servletRequest) {

        try {
            // 1) Authenticate
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            body.getEmail(),
                            body.getPassword()));

            // 2) Store into security context
            SecurityContextHolder.getContext().setAuthentication(auth);

            // 3) Create session _and_ explicitly save the context
            HttpSession session = servletRequest.getSession(true);
            session.setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    SecurityContextHolder.getContext());

            // 4) Return a LoginResponse
            Long userId = svc.getUserIdByEmail(body.getEmail());
            return ResponseEntity.ok(new LoginResponse(userId, body.getEmail()));

        } catch (BadCredentialsException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest servletRequest) {
        servletRequest.getSession(false).invalidate();
        return ResponseEntity.ok(Collections.singletonMap("message", "Logged out"));
    }
}
