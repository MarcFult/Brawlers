package com.dlc.authentification.config;

import com.dlc.authentification.model.requests.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

public class JsonUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonUsernamePasswordAuthenticationFilter(String loginUrl) {
        // tell filter to trigger on POST /auth/login
        setFilterProcessesUrl(loginUrl);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
            HttpServletResponse response) {
        if (!request.getContentType().startsWith("application/json")) {
            // fallback to default form behavior if someone still posts form-data
            return super.attemptAuthentication(request, response);
        }
        try {
            // parse { "email": "...", "password": "..." }
            LoginRequest creds = objectMapper.readValue(request.getInputStream(), LoginRequest.class);
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    creds.getEmail(),
                    creds.getPassword());
            // let AuthenticationManager handle it
            return this.getAuthenticationManager().authenticate(authToken);
        } catch (IOException e) {
            throw new AuthenticationServiceException("Invalid JSON", e);
        }
    }
}
