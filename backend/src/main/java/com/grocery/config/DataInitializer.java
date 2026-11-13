package com.grocery.config;

import com.grocery.entity.*;
import com.grocery.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-password:}")
    private String adminPassword;

    @Value("${app.seed.customer-password:}")
    private String customerPassword;

    @Value("${app.seed.vendor1-password:}")
    private String vendor1Password;

    @Value("${app.seed.vendor2-password:}")
    private String vendor2Password;

    public DataInitializer(UserRepository userRepository,
                           VendorRepository vendorRepository,
                           ProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    public void setCustomerPassword(String customerPassword) {
        this.customerPassword = customerPassword;
    }

    public void setVendor1Password(String vendor1Password) {
        this.vendor1Password = vendor1Password;
    }

    public void setVendor2Password(String vendor2Password) {
        this.vendor2Password = vendor2Password;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Seed Admin only if password configured via environment variable and user does not exist
        if (StringUtils.hasText(adminPassword)) {
            if (!userRepository.existsByEmail("admin@grocery.com")) {
                User admin = new User(
                        "System Administrator",
                        "admin@grocery.com",
                        passwordEncoder.encode(adminPassword.trim()),
                        Role.ADMIN,
                        "Platform Headquarters, Suite 100",
                        "555-0100"
                );
                userRepository.save(admin);
                log.info("Provisioned initial Administrator account: admin@grocery.com");
            }
        } else {
            log.info("Demo Admin seeding skipped (SEED_ADMIN_PASSWORD not set).");
        }

        // Seed Customer only if password configured via environment variable and user does not exist
        if (StringUtils.hasText(customerPassword)) {
            if (!userRepository.existsByEmail("customer@grocery.com")) {
                User customer = new User(
                        "Sarah Customer",
                        "customer@grocery.com",
                        passwordEncoder.encode(customerPassword.trim()),
                        Role.CUSTOMER,
                        "742 Evergreen Terrace, Springfield",
                        "555-0199"
                );
                userRepository.save(customer);
                log.info("Provisioned initial Customer account: customer@grocery.com");
            }
        } else {
            log.info("Demo Customer seeding skipped (SEED_CUSTOMER_PASSWORD not set).");
        }

        // Seed Vendor 1: Fresh Farms Organics
        Vendor vendor1 = null;
        if (userRepository.existsByEmail("freshfarms@grocery.com")) {
            Optional<Vendor> opt = vendorRepository.findByUserEmail("freshfarms@grocery.com");
            if (opt.isPresent()) vendor1 = opt.get();
        } else if (StringUtils.hasText(vendor1Password)) {
            User vendorUser1 = new User(
                    "Robert Green",
                    "freshfarms@grocery.com",
                    passwordEncoder.encode(vendor1Password.trim()),
                    Role.VENDOR,
                    "101 Harvest Valley Road",
                    "555-0101"
            );
            vendorUser1 = userRepository.save(vendorUser1);

            vendor1 = new Vendor(
                    vendorUser1,
                    "Fresh Farms Organics",
                    "555-0101",
                    "Farm-fresh organic fruits, vegetables, and artisan dairy products harvested daily."
            );
            vendor1 = vendorRepository.save(vendor1);
            log.info("Provisioned initial Vendor 1 account: freshfarms@grocery.com");
        } else {
            log.info("Demo Vendor 1 seeding skipped (vendor password not set).");
        }

        // Seed Vendor 2: Green Valley Produce
        Vendor vendor2 = null;
        if (userRepository.existsByEmail("greenvalley@grocery.com")) {
            Optional<Vendor> opt = vendorRepository.findByUserEmail("greenvalley@grocery.com");
            if (opt.isPresent()) vendor2 = opt.get();
        } else if (StringUtils.hasText(vendor2Password)) {
            User vendorUser2 = new User(
                    "Elena Rostova",
                    "greenvalley@grocery.com",
                    passwordEncoder.encode(vendor2Password.trim()),
                    Role.VENDOR,
                    "202 Meadow Lane",
                    "555-0102"
                );
            vendorUser2 = userRepository.save(vendorUser2);

            vendor2 = new Vendor(
                    vendorUser2,
                    "Green Valley Produce",
                    "555-0102",
                    "Premium quality groceries, bakery specialties, and everyday pantry essentials."
            );
            vendor2 = vendorRepository.save(vendor2);
            log.info("Provisioned initial Vendor 2 account: greenvalley@grocery.com");
        } else {
            log.info("Demo Vendor 2 seeding skipped (vendor password not set).");
        }

        // Seed Products if catalog is empty and vendors are available
        if (productRepository.count() == 0 && vendor1 != null && vendor2 != null) {
            // Fresh Farms products
            productRepository.save(new Product(
                    "Fresh Gala Apples",
                    "Crisp, sweet, and locally harvested Gala apples, perfect for snacking and baking.",
                    new BigDecimal("3.49"),
                    vendor1,
                    45,
                    "Fruits & Vegetables",
                    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Organic Bananas (Bunch)",
                    "Naturally ripened sweet bananas packed with potassium and essential nutrients.",
                    new BigDecimal("1.99"),
                    vendor1,
                    60,
                    "Fruits & Vegetables",
                    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Hass Avocados (Pack of 4)",
                    "Rich, creamy Hass avocados ready to eat for homemade guacamole or salads.",
                    new BigDecimal("4.99"),
                    vendor1,
                    25,
                    "Fruits & Vegetables",
                    "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Organic Whole Milk (1 Gallon)",
                    "Grade A pasteurized whole milk from pasture-raised, grass-fed cows.",
                    new BigDecimal("4.29"),
                    vendor1,
                    30,
                    "Dairy & Eggs",
                    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Farm Fresh Large Brown Eggs (Dozen)",
                    "Free-range brown eggs with vibrant yolks, rich flavor, and high protein.",
                    new BigDecimal("3.99"),
                    vendor1,
                    40,
                    "Dairy & Eggs",
                    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Organic Baby Spinach (16 oz)",
                    "Tender and pre-washed baby spinach leaves, excellent for salads and smoothies.",
                    new BigDecimal("3.99"),
                    vendor1,
                    5, // low stock test
                    "Fruits & Vegetables",
                    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Fresh Strawberries (1 lb)",
                    "Sweet red strawberries freshly picked. Currently waiting on next harvest.",
                    new BigDecimal("3.99"),
                    vendor1,
                    0, // out of stock test
                    "Fruits & Vegetables",
                    "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80"
            ));

            // Green Valley products
            productRepository.save(new Product(
                    "Artisan Sourdough Bread",
                    "Naturally fermented traditional sourdough loaf with a crispy crust and chewy crumb.",
                    new BigDecimal("4.50"),
                    vendor2,
                    20,
                    "Bakery",
                    "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Whole Wheat Pita Bread (6-Pack)",
                    "Soft stone-ground whole wheat pocket pita bread made without artificial preservatives.",
                    new BigDecimal("2.99"),
                    vendor2,
                    35,
                    "Bakery",
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Cold-Pressed Extra Virgin Olive Oil (750ml)",
                    "First cold-pressed unrefined extra virgin olive oil from Mediterranean olives.",
                    new BigDecimal("11.99"),
                    vendor2,
                    15,
                    "Pantry Staples",
                    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Premium Jasmine Fragrant Rice (5 lb)",
                    "Aromatic long-grain white jasmine rice that cooks fluffy and fragrant.",
                    new BigDecimal("7.49"),
                    vendor2,
                    50,
                    "Pantry Staples",
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "Cold Brew Iced Coffee (32 oz)",
                    "Steeped for 18 hours with 100% Arabica beans for a smooth, low-acid coffee taste.",
                    new BigDecimal("5.49"),
                    vendor2,
                    18,
                    "Beverages",
                    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
            ));

            productRepository.save(new Product(
                    "100% Pure Squeezed Orange Juice (52 oz)",
                    "Freshly squeezed Florida oranges with no added sugars or preservatives.",
                    new BigDecimal("4.79"),
                    vendor2,
                    22,
                    "Beverages",
                    "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80"
            ));
        }
    }
}
