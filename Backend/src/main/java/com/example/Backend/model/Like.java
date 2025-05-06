package com.example.Backend.model;

import java.util.Date;

public class Like {
    private String userId;
    private Date createdAt;

    // Getters, setters, constructors
    public Like() {
    }

    public Like(String userId, Date createdAt) {
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.util.Date createdAt) {
        this.createdAt = (Date) createdAt;
    }
}