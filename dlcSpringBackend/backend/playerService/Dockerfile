# ─── Stage 1: Build with OpenJDK 21 + Maven installed ───────────────────────
FROM eclipse-temurin:21-jdk-jammy AS builder

# Install Maven
USER root
RUN apt-get update \
    && apt-get install -y maven \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
# Copy only POM to leverage Docker cache on dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy sources & build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Run on JRE 21 ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the fat JAR from the builder stage
COPY --from=builder /workspace/target/*.jar app.jar

# Expose the port (Auth: 8081, Player: 8080)
EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
