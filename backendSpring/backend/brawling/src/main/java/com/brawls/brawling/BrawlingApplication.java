package com.brawls.brawling;

import com.brawls.brawling.models.User;
import com.brawls.brawling.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;

@SpringBootApplication(
		exclude = { SecurityAutoConfiguration.class }
)
public class BrawlingApplication {
	public static void main(String[] args) {
		SpringApplication.run(BrawlingApplication.class, args);
	}
}

