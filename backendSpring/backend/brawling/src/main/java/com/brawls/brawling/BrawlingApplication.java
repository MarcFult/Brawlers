package com.brawls.brawling;

import com.brawls.brawling.models.User;
import com.brawls.brawling.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BrawlingApplication {

	public static void main(String[] args) {
		SpringApplication.run(BrawlingApplication.class, args);
	}

	@Bean
	public CommandLineRunner loadData(UserRepository userRepository) {
		return (args) -> {
			if (userRepository.count() == 0) {
				User user = new User();
				user.setUsername("admin");
				user.setEmail("admin@example.com");
				user.setPassword("password");
				userRepository.save(user);
			}
		};
	}
}
