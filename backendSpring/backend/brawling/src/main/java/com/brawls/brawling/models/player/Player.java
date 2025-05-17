package com.brawls.brawling.models.player;

import java.util.List;
import java.util.stream.Collectors;

import com.brawls.brawling.models.User;
import com.brawls.brawling.models.cometics.CosmeticItem;

public class Player {
    private Long userId;
    private List<CosmeticItem> cosmetics;

    public Player(User user) {
        this.userId = user.getId();
        this.cosmetics = user.getOwnedCosmetics().stream().collect(Collectors.toList());

    }

    public List<CosmeticItem> getUserCosmetics() {
        return cosmetics;

    }

    public Long getUserId() {
        return userId;
    }

}
