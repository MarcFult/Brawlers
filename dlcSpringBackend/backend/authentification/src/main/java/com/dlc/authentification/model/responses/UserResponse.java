package com.dlc.authentification.model.responses;

public class UserResponse {
    private Long id;
    private String email;

    public UserResponse(Long id, String email) {
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
