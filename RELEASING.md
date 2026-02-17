# Releasing

Releases are automated via GitHub Actions using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) — no tokens, no manual npm login required.

## How to Release

1. **Bump the version** in `package.json`:
   ```bash
   npm version patch   # 0.1.0 → 0.1.1 (bug fixes)
   npm version minor   # 0.1.0 → 0.2.0 (new features)
   npm version major   # 0.1.0 → 1.0.0 (breaking changes)
   ```
   This updates `package.json` and creates a git commit automatically.

2. **Push the commit and tag:**
   ```bash
   git push && git push --tags
   ```

3. **That's it.** The `publish.yml` workflow fires, builds, tests, and publishes to npm under `@adhd8k/agent-evolver`.

You can watch the publish at: https://github.com/adhd8k/agent-evolver/actions

---

## Versioning

Follow [semver](https://semver.org/):

- **patch** (`0.1.x`) — Bug fixes, no API changes
- **minor** (`0.x.0`) — New skills, new CLI flags, backwards compatible
- **major** (`x.0.0`) — Breaking changes to CLI or skill format

---

## What the CI Does

On every `v*` tag push, `.github/workflows/publish.yml`:

1. Checks out the repo
2. Sets up Node 22
3. Runs `npm ci`
4. Runs `npm run build` (compiles TypeScript)
5. Runs `npm test`
6. Runs `npm publish --access public` (authenticated via OIDC, no token needed)

Provenance attestations are generated automatically — users can verify the package was built from this repo.

---

## If Something Goes Wrong

- **Build failed:** Fix the issue, bump patch, push a new tag
- **Tests failed:** Same — fix, bump, tag
- **Wrong version published:** npm doesn't allow republishing the same version. Bump patch and publish a corrected version
- **Workflow permissions issue:** Check the trusted publisher config at npmjs.com → Packages → @adhd8k/agent-evolver → Settings → Trusted Publishing
