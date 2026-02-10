# ---------- BUILD STAGE ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Copy full repo
COPY . /workspace

# Move into backend where pom.xml exists
WORKDIR /workspace/backend

# Build Spring Boot jar
RUN mvn clean package -DskipTests


# ---------- RUN STAGE ----------
FROM eclipse-temurin:17

WORKDIR /app

# Copy jar from build stage
COPY --from=build /workspace/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
