package com.brawls.brawling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brawls.brawling.models.cometics.CosmeticItem;

public interface CosmeticItemRepository extends JpaRepository<CosmeticItem, Long> {
}
