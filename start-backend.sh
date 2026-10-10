#!/bin/bash
cd "$(dirname "$0")/code/backend"
source .env.local
./mvnw spring-boot:run
