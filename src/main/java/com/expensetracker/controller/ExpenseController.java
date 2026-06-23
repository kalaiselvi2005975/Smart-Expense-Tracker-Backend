package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.dto.MonthlySummaryResponse;
import com.expensetracker.entity.User;
import com.expensetracker.service.ExpenseService;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ExpenseRequest request) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.addExpense(user, request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User user = userService.findByEmail(userDetails.getUsername());

        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(expenseService.searchByCategory(user, category));
        }
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(expenseService.searchByDateRange(user, startDate, endDate));
        }

        return ResponseEntity.ok(expenseService.getAllExpenses(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<ExpenseResponse> expenses = expenseService.getAllExpenses(user);
        return expenses.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(expenseService.updateExpense(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.findByEmail(userDetails.getUsername());
        expenseService.deleteExpense(user, id);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }

    @GetMapping("/summary/monthly")
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(expenseService.getMonthlySummary(user, year, month));
    }
}
