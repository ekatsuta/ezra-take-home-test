#!/bin/bash

# Run tests in Docker container

docker run --rm \
  -v "$(pwd):/src" \
  -w /src \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet test --verbosity normal
