package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseResponse {

    private Long id;
    private String category;
    private BigDecimal amount;
    private LocalDate date;
    private String description;

    public ExpenseResponse() {
    }

    public ExpenseResponse(Long id, String category, BigDecimal amount, LocalDate date, String description) {
        this.id = id;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.description = description;
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

    public static class Builder {
        private Long id;
        private String category;
        private BigDecimal amount;
        private LocalDate date;
        private String description;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder date(LocalDate date) { this.date = date; return this; }
        public Builder description(String description) { this.description = description; return this; }

        public ExpenseResponse build() {
            return new ExpenseResponse(id, category, amount, date, description);
        }
    }
}
