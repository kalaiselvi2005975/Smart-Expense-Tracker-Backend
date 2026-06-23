package com.expensetracker.dto;

public class AuthResponse {

    private String token;
    private String type;
    private Long userId;
    private String name;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String token, String type, Long userId, String name, String email) {
        this.token = token;
        this.type = type;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public static class Builder {
        private String token;
        private String type;
        private Long userId;
        private String name;
        private String email;

        public Builder token(String token) { this.token = token; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, type, userId, name, email);
        }
    }
}
