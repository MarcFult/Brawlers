package com.dlc.authentification.model.responses;

public class LoginResponse {
    private Long id;
    private String email;

    public LoginResponse(Long id, String email) {
        this.id = id;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}