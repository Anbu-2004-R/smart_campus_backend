# Multi-stage Dockerfile for Java 21 Spring Boot + JDBC Backend (Render deployment)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy Maven wrapper and POM from backend
COPY backend/pom.xml ./
COPY backend/.mvn ./.mvn
COPY backend/mvnw ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B || true

# Copy source and build
COPY backend/src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080 10000

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
