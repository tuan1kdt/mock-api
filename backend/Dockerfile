# Build stage
FROM golang:1.25-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies (cached layer)
RUN go mod download

# Copy source code
COPY . .

# Build the application
# CGO_ENABLED=0 creates a static binary
# -ldflags="-w -s" strips debug information to reduce binary size
# -trimpath removes file system paths from the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -extldflags '-static'" \
    -trimpath \
    -o server \
    ./cmd/server/main.go

# Final stage - minimal runtime image
FROM scratch

# Copy CA certificates for HTTPS/TLS connections
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy timezone data (optional, remove if not needed)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy the binary
COPY --from=builder /build/server /server

# Expose ports (documentation only, actual ports come from env vars)
EXPOSE 8000 8080

# Run the server
ENTRYPOINT ["/server"]

