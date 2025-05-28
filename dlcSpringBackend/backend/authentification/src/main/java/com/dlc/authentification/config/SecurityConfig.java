package com.dlc.authentification.config;

import com.dlc.authentification.model.User;
import com.dlc.authentification.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1) Load user by email
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            User u = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("No user: " + email));
            return org.springframework.security.core.userdetails.User
                    .withUsername(u.getEmail())
                    .password(u.getPassword())
                    .roles("USER")
                    .build();
        };
    }

    // 2) Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3) Make AuthenticationManager injectable
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // 4) DAO auth provider
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userDetailsService());
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    // 5) CORS for React
    // @Bean
    // CorsConfigurationSource corsConfigurationSource() {
    // CorsConfiguration cfg = new CorsConfiguration();
    // cfg.setAllowedOrigins(List.of("http://localhost:3000", "http://10.0.40.186",
    // "http://localhost:5176"));
    // cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    // cfg.setAllowedHeaders(List.of("*"));
    // cfg.setAllowCredentials(true);
    // UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    // src.registerCorsConfiguration("/auth/**", cfg);
    // src.registerCorsConfiguration("/users/**", cfg);
    // return src;
    // }

    // 6) Main HTTP security
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/register",
                                "/auth/hello",
                                "/auth/login",
                                "/auth/logout")
                        .permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(
                                (req, res, ex2) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                // no form‐login or httpBasic UI
                .formLogin(form -> form.disable())
                .httpBasic(b -> b.disable())

                // enable Spring’s logout machinery on POST /auth/logout
                .logout(logout -> logout
                        .logoutUrl("/auth/logout")
                        // invalidate session & clear SecurityContext
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        // delete the session cookie
                        .deleteCookies("JSESSIONID")
                        // return 200 OK with JSON body
                        .logoutSuccessHandler((req, res, auth) -> {
                            res.setStatus(HttpServletResponse.SC_OK);
                            res.setContentType("application/json");
                            res.getWriter()
                                    .write("{\"message\":\"Logged out\"}");
                        }));

        return http.build();
    }
}
