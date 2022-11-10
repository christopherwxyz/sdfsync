# sdfsync
SDF sync (sdfsync) tool


# Build and run

## Build

Docker:

`docker build -t sdfsync -f Dockerfile .`

Docker with lambda: 

`docker build -t sdfsync-lambda -f Dockerfile.lambda .`

## Run

Docker:

`docker run --env-file .env -p 9000:8080 sdfsync`

Docker with lambda:

`docker run --env-file .env -p 9000:8080 sdfsync-lambda`

