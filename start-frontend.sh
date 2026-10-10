#!/bin/bash
cd "$(dirname "$0")/code/frontend"
VITE_API_PROXY=http://localhost:8080 npm run dev
