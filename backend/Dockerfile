# ---------- BUILD STAGE ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory to backend (where pom.xml exists)
WORKDIR /app/backend

# Copy entire repository
COPY . /app

# Build Spring Boot application
RUN mvn clean package -DskipTests


# ---------- RUN STAGE ----------
FROM eclipse-temurin:17

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
