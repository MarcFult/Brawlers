package com.brawls.brawling.models;

import java.util.ArrayList;
import java.util.List;

public class Lobby {
    private Long id;
    private List<User> userList;

    public Lobby() {
        this.userList = new ArrayList<>();

    }

    public void addPlayer(User player) {
        this.userList.add(player);

    }

    public List<User> getPlayerList() {
        return userList;
    }

    public Long getId() {
        return id;
    }

}
