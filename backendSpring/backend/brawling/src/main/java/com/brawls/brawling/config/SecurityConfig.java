package com.brawls.brawling.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // no CSRF, no sessions, pure REST-style
                .csrf(AbstractHttpConfigurer::disable)
                // allow every request, no authentication
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        // don’t add httpBasic() or formLogin()
        return http.build();
    }
}
