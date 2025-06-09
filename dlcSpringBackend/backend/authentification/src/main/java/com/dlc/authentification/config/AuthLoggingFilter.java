package com.dlc.authentification.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthLoggingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(AuthLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain)
            throws ServletException, IOException {

        HttpSession session = req.getSession(false);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("→ {} {} | sessionId={} | auth={}",
                req.getMethod(),
                req.getRequestURI(),
                session != null ? session.getId() : "<none>",
                auth != null ? auth.isAuthenticated() + "/" + auth.getName() : "<none>");

        chain.doFilter(req, res);
    }
}
