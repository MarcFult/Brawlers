package com.brawls.brawling.models.cometics;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

import com.brawls.brawling.models.User;

@Entity
@Getter
@Setter
public class CosmeticItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String assetPath;

    @ManyToMany(mappedBy = "ownedCosmetics")
    private Set<User> owners = new HashSet<>();
}
