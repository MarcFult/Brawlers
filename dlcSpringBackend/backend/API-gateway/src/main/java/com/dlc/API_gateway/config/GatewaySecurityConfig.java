package com.dlc.API_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                // no cookies or sessions for an API gateway
                .csrf(csrf -> csrf.disable())

                // route‐based authorization
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/auth/**", "/players/**", "/users", "/users/**").permitAll()
                        .anyExchange().authenticated())

                // disable the login page and basic-auth at the gateway
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
