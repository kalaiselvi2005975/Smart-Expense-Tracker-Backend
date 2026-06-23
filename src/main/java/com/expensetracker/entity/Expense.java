package com.expensetracker.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Expense() {
    }

    public Expense(Long id, String category, BigDecimal amount, LocalDate date, String description, User user) {
        this.id = id;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.description = description;
        this.user = user;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public static class Builder {
        private Long id;
        private String category;
        private BigDecimal amount;
        private LocalDate date;
        private String description;
        private User user;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder date(LocalDate date) { this.date = date; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder user(User user) { this.user = user; return this; }

        public Expense build() {
            return new Expense(id, category, amount, date, description, user);
        }
    }
}
