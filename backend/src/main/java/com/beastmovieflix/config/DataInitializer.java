package com.beastmovieflix.config;

import com.beastmovieflix.entity.User;
import com.beastmovieflix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data Initializer - Creates admin account on startup
 * 
 * @author Satheesh Kumar
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createAdminAccount();
    }

    private void createAdminAccount() {

        String adminUsername = System.getenv("ADMIN_USERNAME");
        String adminEmail = System.getenv("ADMIN_EMAIL");
        String adminPassword = System.getenv("ADMIN_PASSWORD");

        // ✅ SAFETY CHECK - Prevent crash if env vars missing
        if (adminUsername == null || adminEmail == null || adminPassword == null) {
            log.warn("Admin environment variables not configured properly. Skipping admin creation.");
            return;
        }

        // ✅ Check if admin already exists
        if (userRepository.existsByUsername(adminUsername)) {
            log.info("Admin account already exists: {}", adminUsername);
            return;
        }

        // ✅ Create admin user
        User admin = User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(User.Role.ADMIN)
                .emailVerified(true)
                .bio("System Administrator")
                .build();

        userRepository.save(admin);

        log.info("==========================================");
        log.info("ADMIN ACCOUNT CREATED SUCCESSFULLY");
        log.info("Username: {}", adminUsername);
        log.info("Email: {}", adminEmail);
        log.info("==========================================");
    }
}
