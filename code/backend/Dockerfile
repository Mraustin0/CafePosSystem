# Multi-stage build: compile with Maven then ship on a slim JRE.
# Build:  docker build -t cafe-pos-backend code/backend
# Run:    docker run -p 8080:8080 -e DB_URL=jdbc:postgresql://host.docker.internal:5433/cafepos cafe-pos-backend

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies — only re-download when pom.xml changes, not on every source edit.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

# Run as unprivileged user — standard Docker security practice.
RUN useradd --system --home /app --shell /sbin/nologin app && chown -R app:app /app
USER app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
# Container-aware JVM flags: respect the memory cgroup limit instead of guessing from the host.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport"
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
