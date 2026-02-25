# Deployment

## AWS Amplify Hosting

joshh.io is deployed as a static site via AWS Amplify Hosting with Git-based CI/CD.

### Setup

1. Connect the GitHub repository to AWS Amplify Console
2. Select the `main` branch for auto-deployment
3. Amplify detects the `amplify.yml` build specification automatically

### Build Configuration

The `amplify.yml` at the project root defines the build pipeline:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### SPA Routing

Since this is a single-page application with client-side routing, Amplify needs a rewrite rule to serve `index.html` for all non-asset routes.

Add this custom rewrite rule in the Amplify Console (Rewrites and redirects):

- **Source:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
- **Target:** `/index.html`
- **Type:** 200 (Rewrite)

### Custom Domain

- Domain: `joshh.io`
- DNS provider: AWS Route 53
- SSL: Automatically provisioned by Amplify

In Route 53, Amplify creates the necessary CNAME/ALIAS records when you add the custom domain through the Amplify Console.

### Environment Variables

No environment variables are required for the static build. The site has no backend dependencies.

### Deployment Workflow

1. Open a PR from a feature branch
2. Run `npm run check` before merge
3. Merge PR to `main` branch
4. Amplify detects the merge and starts a build
5. Build runs: `npm ci` → `npm run build`
6. Output from `dist/` is deployed to the CDN
7. Site is live at `joshh.io`

## Branch Protection Policy

- Never push directly to `main`
- Require pull requests for all changes
- Use branch protection in GitHub for review and status checks
