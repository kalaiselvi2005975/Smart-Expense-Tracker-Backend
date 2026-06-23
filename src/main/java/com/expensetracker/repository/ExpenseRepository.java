package com.expensetracker.repository;

import com.expensetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    List<Expense> findByUserIdAndCategoryIgnoreCaseOrderByDateDesc(Long userId, String category);

    List<Expense> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId " +
           "AND e.date BETWEEN :startDate AND :endDate GROUP BY e.category")
    List<Object[]> sumByCategoryForMonth(@Param("userId") Long userId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId " +
           "AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal sumForMonth(@Param("userId") Long userId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);
}
