package com.brawls.brawling.controller;

import com.brawls.brawling.Service.CosmeticService;

import com.brawls.brawling.models.cometics.CosmeticItem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cosmetics")
public class CosmeticController {

    private final CosmeticService cosmeticService;

    public CosmeticController(CosmeticService cosmeticService) {
        this.cosmeticService = cosmeticService;
    }

    @GetMapping
    public List<CosmeticItem> getAllCosmetics() {
        return cosmeticService.getAllCosmetics();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CosmeticItem> getCosmeticById(@PathVariable Long id) {
        return ResponseEntity.ok(cosmeticService.getCosmeticById(id));
    }

    @PostMapping
    public ResponseEntity<CosmeticItem> createCosmetic(@RequestBody CosmeticItem item) {
        return ResponseEntity.ok(cosmeticService.createCosmetic(item));
    }

    @PostMapping("/assign")
    public ResponseEntity<Void> assignCosmeticToUser(@RequestParam Long userId, @RequestParam Long cosmeticId) {
        cosmeticService.assignCosmeticToUser(userId, cosmeticId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CosmeticItem>> getUserCosmetics(@PathVariable Long userId) {
        return ResponseEntity.ok(cosmeticService.getUserCosmetics(userId));
    }
}
