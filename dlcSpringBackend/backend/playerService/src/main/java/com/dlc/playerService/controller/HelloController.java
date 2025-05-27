package com.dlc.playerService.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/players") // matches your gateway’s Path=/players/**
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from Player Service!";
    }
}
