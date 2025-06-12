package com.dlc.playerService.controller;

import com.dlc.playerService.models.Player;
import com.dlc.playerService.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/players")
public class PlayerController {
    private final PlayerService svc;

    public PlayerController(PlayerService svc) {
        this.svc = svc;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Player> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(svc.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable Long id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @PostMapping("/user/{userId}/purchase")
    public ResponseEntity<Player> purchase(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        String objectName = (String) body.get("objectName");
        int cost = (int) body.get("cost");
        return ResponseEntity.ok(svc.purchaseGameObject(userId, objectName, cost));
    }

    @GetMapping("/user/{userId}/gameObjects")
    public ResponseEntity<List<String>> getGameObjects(@PathVariable Long userId) {
        return ResponseEntity.ok(svc.getGameObjects(userId));
    }

    @GetMapping("/user/{userId}/levels")
    public ResponseEntity<List<String>> getLevels(@PathVariable Long userId) {
        return ResponseEntity.ok(svc.getLevels(userId));
    }

    @PostMapping("/user/{userId}/levels/unlock")
    public ResponseEntity<Player> unlockLevel(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String level = body.get("levelName");
        return ResponseEntity.ok(svc.unlockLevel(userId, level));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Player> createPlayer(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        Player newPlayer = svc.createPlayer(userId, name);
        return ResponseEntity.ok(newPlayer);
    }

    @PostMapping("/user/{userId}/buyEcts")
    public ResponseEntity<Player> buyEcts(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {

        int amount = (int) body.get("amount");
        return ResponseEntity.ok(svc.buyEcts(userId, amount));
    }
}
