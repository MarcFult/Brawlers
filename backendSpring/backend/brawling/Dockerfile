# ┌───────────────────────────────────────────┐
# │   Stage 1: compile + package with Maven │
# └───────────────────────────────────────────┘
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# 1) Copy just the pom and download dependencies (cached)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2) Copy your code and build the fat JAR
COPY src ./src
RUN mvn package -DskipTests -B

# ┌───────────────────────────────────────────┐
# │ Stage 2: tiny “distroless” Java 17 image │
# └───────────────────────────────────────────┘
FROM gcr.io/distroless/java17-debian11

# Copy in your executable JAR
COPY --from=build /app/target/brawling-0.0.1-SNAPSHOT.jar /app.jar

# Expose and run
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app.jar"]
