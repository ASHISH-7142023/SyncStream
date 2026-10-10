package com.syncstream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;
import org.springframework.data.mongodb.core.index.TextIndexDefinition.TextIndexDefinitionBuilder;

@SpringBootApplication
/**
 * Main entry point for the SyncStream Spring Boot application.
 */
public class SyncStreamApplication {

	public static void main(String[] args) {
		SpringApplication.run(SyncStreamApplication.class, args);
	}
}

