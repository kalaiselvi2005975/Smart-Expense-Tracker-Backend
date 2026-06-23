package com.expensetracker.service;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.dto.MonthlySummaryResponse;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Transactional
    public ExpenseResponse addExpense(User user, ExpenseRequest request) {
        Expense expense = Expense.builder()
                .category(request.getCategory())
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .user(user)
                .build();

        return toResponse(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> getAllExpenses(User user) {
        return expenseRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> searchByCategory(User user, String category) {
        return expenseRepository.findByUserIdAndCategoryIgnoreCaseOrderByDateDesc(user.getId(), category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> searchByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), startDate, endDate)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse updateExpense(User user, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(User user, Long expenseId) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    public MonthlySummaryResponse getMonthlySummary(User user, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        BigDecimal total = expenseRepository.sumForMonth(user.getId(), startDate, endDate);
        List<Object[]> categorySums = expenseRepository.sumByCategoryForMonth(user.getId(), startDate, endDate);

        List<MonthlySummaryResponse.CategorySummary> breakdown = categorySums.stream()
                .map(row -> MonthlySummaryResponse.CategorySummary.builder()
                        .category((String) row[0])
                        .amount((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());

        return MonthlySummaryResponse.builder()
                .year(year)
                .month(month)
                .totalAmount(total)
                .categoryBreakdown(breakdown)
                .build();
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .description(expense.getDescription())
                .build();
    }
}
