# Cloudflare Workers Deployment Guide

This guide covers deploying the mock-api application to Cloudflare Workers.

## Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI installed (`npm install -g wrangler` or via `npm install`)
- D1 database created in Cloudflare dashboard

## Initial Setup

### 1. Create D1 Database

If you haven't already created the D1 database:

```bash
wrangler d1 create mock_api
```

This will output a `database_id`. Update the `database_id` in `wrangler.toml` with the value from the command output.

### 2. Initialize Database Schema

Run the migration to create the required tables:

**For local development:**
```bash
npm run migrate:local
```

**For production/remote:**
```bash
npm run migrate:remote
```

Or manually:
```bash
wrangler d1 execute mock_api --local --file=backend/sql/d1_schema.sql
wrangler d1 execute mock_api --remote --file=backend/sql/d1_schema.sql
```

## Build Process

The build process generates all required files:

1. **Generate worker assets** (`worker.mjs`, `runtime.mjs`) using `workers-assets-gen`
2. **Compile Go to WASM** (`app.wasm`)

To build:
```bash
npm run build
```

This will create/update files in `backend/build/`:
- `app.wasm` - Compiled Go WASM binary
- `worker.mjs` - Worker entry point
- `runtime.mjs` - Runtime context
- `wasm_exec.js` - Go WASM execution runtime

## Configuration

### Environment Variables

The following environment variables are configured in `wrangler.toml`:

- `MANAGEMENT_DOMAIN` - Domain for management API (default: "anonymock.tuanla.vn")

You can override these in the Cloudflare Dashboard under Workers > Settings > Variables and Secrets.

### D1 Database Binding

The D1 database is bound as `DB` in the worker (as defined in `wrangler.toml`). The code uses this binding name to access the database.

## Local Development

To test locally with Wrangler:

```bash
npm run dev
# or
wrangler dev
```

This will:
- Start a local development server
- Use local D1 database (if configured)
- Hot-reload on code changes

## Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
# or
wrangler deploy
```

### Verify Deployment

After deployment, you can:

1. **Check logs:**
   ```bash
   wrangler tail
   ```

2. **Test the API:**
   - Management API: `https://<your-worker>.<your-subdomain>.workers.dev`
   - Serving API: Same URL, but different routing based on Host header

## Troubleshooting

### D1 Database Connection Issues

- Verify the `database_id` in `wrangler.toml` matches your D1 database
- Ensure the binding name is `DB` (as configured in code)
- Run migrations if tables don't exist

### Build Issues

- Ensure Go 1.25+ is installed
- Check that `workers-assets-gen` can generate files
- Verify WASM compilation succeeds

### Runtime Errors

- Check worker logs: `wrangler tail`
- Verify environment variables are set correctly
- Ensure D1 database schema is initialized

## Architecture Notes

- The worker uses Go compiled to WASM via `syumai/workers`
- D1 database is accessed via the `DB` binding
- Routing is handled by Host header (management vs serving)
- Anonymous user authentication via cookies

