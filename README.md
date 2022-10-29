# ssync
SDF sync (ssync) tool


# Build and run

## Build

Docker:

`docker build -t ssync -f Dockerfile .`

Docker with lambda: 

`docker build -t ssync-lambda -f Dockerfile.lambda .`

## Run

Docker:

`docker run --env-file .env -p 9000:8080 ssync`

Docker with lambda:

`docker run --env-file .env -p 9000:8080 ssync-lambda`

