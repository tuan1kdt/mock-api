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

The following environment variables are required:

- `MANAGEMENT_DOMAIN` - Domain for management API
- `SCHEME` - URL scheme (http or https, defaults to "https")

#### Local Development

For local development, create a `.dev.vars` file in the project root:

```bash
cp .dev.vars.example .dev.vars
```

Then edit `.dev.vars` with your local values:
```
MANAGEMENT_DOMAIN=localhost:8787
SCHEME=http
```

The `.dev.vars` file is gitignored and will override `wrangler.toml` [vars] when running `wrangler dev`.

#### Production

For production, set environment variables in one of these ways:

1. **Cloudflare Dashboard** (Recommended):
   - Go to Workers > Your Worker > Settings > Variables and Secrets
   - Add variables under "Environment Variables"

2. **Wrangler CLI**:
   ```bash
   wrangler secret put MANAGEMENT_DOMAIN
   wrangler secret put SCHEME
   ```

3. **wrangler.toml [vars]** (for non-sensitive values only):
   - Only use this for values safe to commit
   - Production values should be set via Dashboard or secrets

**Important**: Never commit production secrets or sensitive values to `wrangler.toml`. Use `.dev.vars` for local development and Cloudflare Dashboard/secrets for production.

### D1 Database Binding

The D1 database is bound as `DB` in the worker (as defined in `wrangler.toml`). The code uses this binding name to access the database.

## Local Development

### Setup

1. **Create `.dev.vars` file** for local environment variables:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Edit `.dev.vars` with your local values.

2. **Start local development server**:
   ```bash
   npm run dev
   # or
   wrangler dev
   ```

This will:
- Start a local development server
- Use local D1 database (if configured)
- Load environment variables from `.dev.vars` (overrides `wrangler.toml`)
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

---

# Front-end (Next.js) Deployment Guide

This guide covers deploying the Next.js front-end to Cloudflare Pages.

## Prerequisites

- Cloudflare account with Pages enabled
- Wrangler CLI installed (`npm install -g wrangler` or via `npm install`)
- Backend API deployed and accessible (for `BACKEND_URL` environment variable)

## Initial Setup

### 1. Environment Variables

The front-end requires the `BACKEND_URL` environment variable to connect to the backend API.

#### Local Development

For local development, create a `.dev.vars` file in the `front-end` directory:

```bash
cd front-end
cp .dev.vars.example .dev.vars
```

Then edit `front-end/.dev.vars` with your local backend URL:
```
BACKEND_URL=http://localhost:8080
```

The `.dev.vars` file is gitignored and will override `wrangler.toml` [vars] when running `wrangler pages dev`.

#### Production

For production, set the `BACKEND_URL` environment variable in one of these ways:

1. **Cloudflare Dashboard** (Recommended):
   - Go to Workers & Pages > Your Pages Project > Settings > Environment Variables
   - Add `BACKEND_URL` under "Production" environment
   - Value should be your backend Worker URL (e.g., `https://mock-api-backend.your-subdomain.workers.dev`)

2. **Wrangler CLI** (for Pages deployments):
   ```bash
   cd front-end
   wrangler pages secret put BACKEND_URL
   ```

**Important**: Never commit production URLs to `wrangler.toml`. Use `.dev.vars` for local development and Cloudflare Dashboard/secrets for production.

## Build Process

The build process uses `@cloudflare/next-on-pages` to transform the Next.js build output for Cloudflare Pages:

1. **Standard Next.js build** (`next build`)
2. **Transform for Cloudflare Pages** (`@cloudflare/next-on-pages`)

To build:
```bash
cd front-end
npm run pages:build
```

This will:
- Run `next build` to create the standard Next.js build
- Transform the output using `@cloudflare/next-on-pages`
- Create output in `.vercel/output/static` directory

## Local Development

### Setup

1. **Create `.dev.vars` file** for local environment variables:
   ```bash
   cd front-end
   cp .dev.vars.example .dev.vars
   ```
   Edit `.dev.vars` with your local backend URL.

2. **Start local development server**:
   ```bash
   cd front-end
   npm run dev
   ```

   Or use Wrangler Pages for local preview:
   ```bash
   cd front-end
   npm run pages:preview
   ```

## Deployment

### Method 1: Deploy via Wrangler CLI

This method gives you direct control over deployments and is useful for CI/CD pipelines.

1. **Build and deploy**:
   ```bash
   cd front-end
   npm run pages:deploy
   ```

   This will:
   - Build the Next.js app for Cloudflare Pages
   - Deploy to Cloudflare Pages using Wrangler

2. **First-time setup**:
   - You may be prompted to authenticate with Cloudflare
   - The Pages project will be created automatically if it doesn't exist

3. **Verify deployment**:
   - Check the output URL from the deploy command
   - Visit the URL in your browser to verify the deployment

### Method 2: Deploy via Cloudflare Dashboard (Git Integration)

This method enables automatic deployments on every Git push.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add front-end deployment configuration"
   git push origin main
   ```

2. **Create Pages project in Cloudflare Dashboard**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Workers & Pages
   - Click "Create application" > "Pages" tab
   - Select "Connect to Git"
   - Choose your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

3. **Configure build settings**:
   - **Project name**: `mock-api-frontend` (or your preferred name)
   - **Production branch**: `main` (or your default branch)
   - **Build command**: `cd front-end && npm run pages:build`
   - **Build output directory**: `front-end/.vercel/output/static`
   - **Root directory**: Leave empty (or set to `front-end` if your repo root is different)

4. **Set environment variables**:
   - In the project settings, go to "Environment Variables"
   - Add `BACKEND_URL` for Production environment
   - Set the value to your backend Worker URL

5. **Deploy**:
   - Click "Save and Deploy"
   - Cloudflare will build and deploy your application
   - Future pushes to the configured branch will trigger automatic deployments

6. **Custom domains** (optional):
   - In project settings, go to "Custom domains"
   - Add your custom domain
   - Update DNS records as instructed

## Custom Domain Configuration

Custom domains for Cloudflare Pages are configured through the Cloudflare Dashboard, not in `wrangler.toml`. Here's how to set one up:

### Setting Up a Custom Domain

1. **Access Custom Domains Settings**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Workers & Pages
   - Select your Pages project (`mock-api-frontend`)
   - Click on the **Custom domains** tab

2. **Add Your Domain**:
   - Click **Set up a custom domain**
   - Enter your desired domain (e.g., `www.example.com` or `api.example.com`)
   - Click **Continue**

3. **Configure DNS**:
   
   **If your domain is managed by Cloudflare:**
   - DNS records will be added automatically
   - Cloudflare will handle SSL certificate provisioning
   
   **If your domain is managed by another DNS provider:**
   - Add a CNAME record in your DNS provider's dashboard:
     - **Type:** CNAME
     - **Name:** `www` (or your subdomain)
     - **Target:** `mock-api-frontend.pages.dev` (your Pages subdomain)
     - **TTL:** Auto or 3600
   - Save the DNS record

4. **Verify and Activate**:
   - Return to Cloudflare Pages dashboard
   - Click **Check DNS** to verify the DNS records are correct
   - Once verified, click **Activate domain**
   - Cloudflare will automatically provision an SSL certificate

5. **Wait for Propagation**:
   - DNS changes can take a few minutes to propagate
   - SSL certificate provisioning typically takes a few minutes
   - Your site will be accessible via your custom domain once complete

### Notes

- Custom domains cannot be configured in `wrangler.toml` - they must be set via the Dashboard
- You can add multiple custom domains to the same Pages project
- Cloudflare automatically provides SSL certificates for custom domains
- The default Pages subdomain (e.g., `mock-api-frontend.pages.dev`) will continue to work alongside custom domains

## Configuration Files

### `front-end/wrangler.toml`

Configuration for Wrangler CLI deployments:

```toml
name = "mock-api-frontend"
compatibility_date = "2025-11-22"
pages_build_output_dir = ".vercel/output/static"
```

### `front-end/next.config.ts`

Next.js configuration with Cloudflare Pages compatibility:

```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};
```

## Troubleshooting

### Build Issues

- **Build fails with next-on-pages errors**:
  - Ensure `@cloudflare/next-on-pages` is installed: `npm install --save-dev @cloudflare/next-on-pages`
  - Check that Next.js version is compatible (16.0.3 is used in this project)
  - Verify the build output directory exists after `next build`

- **Environment variables not working**:
  - Verify `BACKEND_URL` is set in Cloudflare Dashboard (for production)
  - Check `.dev.vars` file exists and is correct (for local development)
  - Ensure environment variables are set for the correct environment (Production/Preview)

### Runtime Errors

- **API routes returning 502 errors**:
  - Verify `BACKEND_URL` is correctly set
  - Check that the backend Worker is deployed and accessible
  - Ensure the backend URL includes the protocol (`https://`)

- **Static assets not loading**:
  - Verify build output directory is correct (`.vercel/output/static`)
  - Check that assets are included in the build output
  - Ensure public files are in the `public/` directory

### Deployment Issues

- **Wrangler authentication errors**:
  - Run `wrangler login` to authenticate
  - Verify your Cloudflare account has Pages enabled

- **Git integration not working**:
  - Verify repository permissions in Cloudflare
  - Check that build settings are correct
  - Ensure the repository is accessible

## Notes

- The front-end uses `@cloudflare/next-on-pages` to transform Next.js builds for Cloudflare Pages
- API routes use Edge Runtime and proxy requests to the backend Worker
- Environment variables must be set in Cloudflare Dashboard for production deployments
- The build output directory (`.vercel/output/static`) is gitignored and should not be committed

