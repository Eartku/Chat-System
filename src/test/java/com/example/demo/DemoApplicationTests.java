package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.chatapp.ChatApplication;

@SpringBootTest(
		classes = ChatApplication.class,
		properties = {
				"spring.datasource.url=jdbc:h2:mem:chat-system;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
				"spring.datasource.driver-class-name=org.h2.Driver",
				"spring.datasource.username=sa",
				"spring.datasource.password=",
				"spring.jpa.hibernate.ddl-auto=create-drop",
				"spring.jpa.open-in-view=false"
		})
@ActiveProfiles("test")
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
