package com.orchard.orchard_store_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class OrchardStoreBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrchardStoreBackendApplication.class, args);
	}

}
