package com.brawls.brawling.Service;

import com.brawls.brawling.models.User;
import com.brawls.brawling.models.cometics.CosmeticItem;
import com.brawls.brawling.repository.CosmeticItemRepository;
import com.brawls.brawling.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CosmeticService {

    private final CosmeticItemRepository cosmeticItemRepository;
    private final UserRepository userRepository;

    public CosmeticService(CosmeticItemRepository cosmeticItemRepository, UserRepository userRepository) {
        this.cosmeticItemRepository = cosmeticItemRepository;
        this.userRepository = userRepository;
    }

    public List<CosmeticItem> getAllCosmetics() {
        return cosmeticItemRepository.findAll();
    }

    public CosmeticItem getCosmeticById(Long id) {
        return cosmeticItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cosmetic item not found"));
    }

    public CosmeticItem createCosmetic(CosmeticItem item) {
        return cosmeticItemRepository.save(item);
    }

    @Transactional
    public void assignCosmeticToUser(Long userId, Long cosmeticId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        CosmeticItem item = cosmeticItemRepository.findById(cosmeticId)
                .orElseThrow(() -> new IllegalArgumentException("Cosmetic item not found"));

        user.getOwnedCosmetics().add(item);
        // No need to explicitly save user due to transactional context and owning side
    }

    public List<CosmeticItem> getUserCosmetics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return List.copyOf(user.getOwnedCosmetics());
    }
}
