.PHONY: build-worker dev-worker run-server build

build-worker:
	mkdir -p backend/build
	cd backend && go run github.com/syumai/workers/cmd/workers-assets-gen -mode=go && GOOS=js GOARCH=wasm go build -ldflags='-s -w' -trimpath -o ./build/app.wasm ./cmd/worker

build: build-worker

dev-worker: build-worker
	wrangler dev

run-server:
	cd backend && go run ./cmd/server

