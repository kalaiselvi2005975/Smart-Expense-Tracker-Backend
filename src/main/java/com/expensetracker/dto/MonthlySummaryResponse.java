package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class MonthlySummaryResponse {

    private int year;
    private int month;
    private BigDecimal totalAmount;
    private List<CategorySummary> categoryBreakdown;

    public MonthlySummaryResponse() {
    }

    public MonthlySummaryResponse(int year, int month, BigDecimal totalAmount, List<CategorySummary> categoryBreakdown) {
        this.year = year;
        this.month = month;
        this.totalAmount = totalAmount;
        this.categoryBreakdown = categoryBreakdown;
    }

    public static Builder builder() {
        return new Builder();
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public List<CategorySummary> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategorySummary> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public static class CategorySummary {
        private String category;
        private BigDecimal amount;

        public CategorySummary() {
        }

        public CategorySummary(String category, BigDecimal amount) {
            this.category = category;
            this.amount = amount;
        }

        public static Builder builder() {
            return new Builder();
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public static class Builder {
            private String category;
            private BigDecimal amount;

            public Builder category(String category) { this.category = category; return this; }
            public Builder amount(BigDecimal amount) { this.amount = amount; return this; }

            public CategorySummary build() {
                return new CategorySummary(category, amount);
            }
        }
    }

    public static class Builder {
        private int year;
        private int month;
        private BigDecimal totalAmount;
        private List<CategorySummary> categoryBreakdown;

        public Builder year(int year) { this.year = year; return this; }
        public Builder month(int month) { this.month = month; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder categoryBreakdown(List<CategorySummary> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; return this; }

        public MonthlySummaryResponse build() {
            return new MonthlySummaryResponse(year, month, totalAmount, categoryBreakdown);
        }
    }
}
