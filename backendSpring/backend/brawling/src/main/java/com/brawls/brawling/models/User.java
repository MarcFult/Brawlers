package com.brawls.brawling.models;

import java.util.HashSet;
import java.util.Set;

import com.brawls.brawling.models.cometics.CosmeticItem;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users") // "user" is a reserved keyword in PostgreSQL, so better name it "users"
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToMany
    @JoinTable(name = "user_cosmetics", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "cosmetic_id"))
    private Set<CosmeticItem> ownedCosmetics = new HashSet<>();

    // kills
    // array of game objects
}