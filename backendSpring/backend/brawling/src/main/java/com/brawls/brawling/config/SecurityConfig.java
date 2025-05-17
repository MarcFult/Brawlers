package com.brawls.brawling.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // disable CSRF if you only serve a REST API
                .csrf(csrf -> csrf.disable())
                // allow everyone to GET "/" but secure any other endpoints
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/").permitAll()
                        .anyRequest().authenticated())
                // keep HTTP Basic for any other endpoints
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
