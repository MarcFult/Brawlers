# ─── Stage 1: Build on JDK 21 + Maven ────────────────────────────────────────
FROM eclipse-temurin:21-jdk-jammy AS builder

# Install Maven
USER root
RUN apt-get update \
    && apt-get install -y maven \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Cache POM dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Run on JRE 21 ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
