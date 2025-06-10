package com.dlc.authentification.model.responses;

public class RegisterResponse {
    private Long id;
    private String error;

    public RegisterResponse() {
    }

    public RegisterResponse(Long id, String error) {
        this.id = id;
        this.error = error;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
