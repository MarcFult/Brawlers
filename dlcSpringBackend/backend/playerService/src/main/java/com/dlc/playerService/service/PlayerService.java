package com.dlc.playerService.service;

import com.dlc.playerService.models.Player;
import com.dlc.playerService.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlayerService {
    private final PlayerRepository repo;

    public PlayerService(PlayerRepository repo) {
        this.repo = repo;
    }

    public Player getByUserId(Long userId) {
        return repo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Player not found for userId: " + userId));
    }

    public Player getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Player not found for id: " + id));
    }

    @Transactional
    public Player purchaseGameObject(Long userId, String objectName, int cost) {
        Player player = getByUserId(userId);
        if (player.getEcts() < cost) {
            throw new IllegalArgumentException("Not enough ECTS");
        }
        player.setEcts(player.getEcts() - cost);
        player.getGameObjects().add(objectName);
        return repo.save(player);
    }

    public List<String> getGameObjects(Long userId) {
        return getByUserId(userId).getGameObjects();
    }

    public List<String> getLevels(Long userId) {
        return getByUserId(userId).getLevels();
    }

    @Transactional
    public Player unlockLevel(Long userId, String levelName) {
        Player player = getByUserId(userId);
        if (!player.getLevels().contains(levelName)) {
            player.getLevels().add(levelName);
        }
        return repo.save(player);
    }

    /**
     * Create a new Player for a user with default ECTS and game objects
     */
    public Player createPlayer(Long userId, String name) {
        if (repo.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Player already exists for userId: " + userId);
        }
        Player player = new Player();
        player.setUserId(userId);
        player.setName(name);
        player.setEcts(50);
        player.getGameObjects().add("caretaker");
        player.getGameObjects().add("pepe");
        player.getGameObjects().add("alien");
        // levels defaults to empty
        return repo.save(player);
    }
}
