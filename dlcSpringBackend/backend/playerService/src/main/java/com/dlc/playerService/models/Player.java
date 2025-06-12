package com.dlc.playerService.models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "players", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String name;

    private int ects;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "player_game_objects", joinColumns = @JoinColumn(name = "player_id"))
    @Column(name = "game_object")
    private List<String> gameObjects = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "player_levels", joinColumns = @JoinColumn(name = "player_id"))
    @Column(name = "level")
    private List<String> levels = new ArrayList<>();

    // Constructors, getters, setters
    public Player() {
    }

    public Player(Long userId, String name, int ects) {
        this.userId = userId;
        this.name = name;
        this.ects = ects;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getEcts() {
        return ects;
    }    public void setEcts(int ects) {


        this.ects = ects;
    }

    public List<String> getGameObjects() {
        return gameObjects;
    }

    public void setGameObjects(List<String> gameObjects) {
        this.gameObjects = gameObjects;
    }

    public List<String> getLevels() {
        return levels;
    }

    public void setLevels(List<String> levels) {
        this.levels = levels;
    }
}
