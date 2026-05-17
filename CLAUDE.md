# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a fork of [miroslavpejic85/mirotalk](https://github.com/miroslavpejic85/mirotalk) — a WebRTC P2P video conferencing server. It is being adapted for self-hosting at `meet.sgc.ai`.

The fork has two sister projects:

- **`~/sgc/ansible/roles/mirotalk-ar`** — Ansible role that deploys this app. Defaults to image `legitservices/mirotalk:latest` (not the upstream `mirotalk/p2p:latest`).
- **`~/sgc/SGC`** — master MASH-based playbook that consumes the role. The role must follow the SGC architectural patterns documented in `~/sgc/CLAUDE.md` (4-step add pattern, role-specific markers, password derivation, etc.).

Custom Docker images for SGC services live in `~/sgc/container-images/`, are built locally, and pushed to Docker Hub under the `legitservices` account before being referenced from the role.

## Common Commands

```bash
# Local dev (creates app/src/config.js from template via prestart)
npm install
npm start            # production mode
npm run start-dev    # nodemon

# Tests (mocha, runs everything in tests/)
npm test
npx mocha tests/test-validate.js          # single file
npx mocha tests/test-api.js --grep "..."  # single test by name

# Format (prettier across repo per .prettierrc.js — 4-space, single quotes, 120-col)
npm run lint

# Mailpit dev SMTP catcher
npm run mailpit:up
npm run mailpit:down

# Docker (all repointed to legitservices/mirotalk on sgc-dev / sgc branches)
npm run docker:build       # single-arch local build of legitservices/mirotalk:latest
npm run docker:buildx      # amd64-only build AND push to Docker Hub (arm to be added to a future CI pipeline)
npm run docker:push        # push legitservices/mirotalk:latest
npm run docker:run         # ephemeral, no .env mount
npm run docker:rune        # mounts ./.env read-only
npm run docker:run-vm      # mounts .env + app/ + public/ for live edits
```

For a tagged production release: `docker buildx build --platform linux/amd64 -t legitservices/mirotalk:<tag> -t legitservices/mirotalk:latest --push .` — `docker login` to the `legitservices` Docker Hub account first. Releases are cut from the `sgc` branch only, after `sgc-dev` security review. ARM builds are deferred to a future CI pipeline; do not enable QEMU/multi-arch on developer workstations.

## Required Pre-Run Files

The server will not boot without these (the `prestart` script copies the first one automatically):

- `app/src/config.js` ← copied from `app/src/config.template.js`
- `.env` ← copy from `.env.template`
- `app/ssl/key.pem` and `app/ssl/cert.pem` — `httpolyglot` reads them at startup with `fs.readFileSync`, so missing files crash the process

The Dockerfile bakes in `.env.template` as `.env` and `config.template.js` as `config.js`; production deployments override `.env` via volume mount (see `docker-compose.template.yml`).

## Architecture

### Single-process Node server, two surfaces

`app/src/server.js` (~2400 lines) is the entrypoint and does almost everything:

- **Express + httpolyglot**: serves both HTTP and HTTPS on the same port using the SSL cert pair above.
- **Socket.IO** (`maxHttpBufferSize: 1e7`, websocket-only) handles all real-time signaling for WebRTC peer connections, chat, file transfer, screen share, whiteboard, etc.
- **REST API** at `/api/v1/*` (token, join, meeting, meetings, stats) — handlers live in `app/src/api.js`, schema is `app/api/swagger.yaml`, exposed at `/api/v1/docs` via `swagger-ui-express`.
- **OIDC** auth via `express-openid-connect` (optional, env-gated).
- **Static views** rendered from `public/views/*.html`; assets from `public/{js,css,images,sounds,svg}`.

There is no SFU/MCU — media goes peer-to-peer between browsers. The Node server is purely signaling + auth + room state. STUN/TURN are configured via env (see `coturn/` for a reference config).

### Configuration flow

Everything is centralized in `app/src/config.js` (copied from `config.template.js`). That file does the `require('dotenv').config()` and exposes a single nested object. **The rest of the codebase imports `config` and never touches `process.env` directly** — preserve this pattern when adding new settings: add the env var to `.env.template`, parse it in `config.template.js`, and consume the resulting field elsewhere.

### Modules in `app/src/`

| File                | Purpose                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `server.js`         | Express, Socket.IO, room lifecycle, signaling, chat, ChatGPT, OIDC, webhook, Sentry, Slack/Mattermost dispatch |
| `api.js`            | REST API handlers (mounted under `/api/v1`)                                                                    |
| `tokenManager.js`   | JWT mint/verify for room join tokens                                                                           |
| `host.js`           | Tracks IPs authenticated via host-protection login                                                             |
| `validate.js`       | Input schema validation (covered by `tests/test-validate.js`)                                                  |
| `xss.js`            | XSS sanitization wrapper around DOMPurify+jsdom (covered by `tests/test-xss.js`)                               |
| `htmlInjector.js`   | Server-side HTML injection points (analytics, branding)                                                        |
| `mattermost.js`     | Mattermost bot integration                                                                                     |
| `logs.js`           | Structured logger (JSON or colorized, env-controlled)                                                          |
| `lib/nodemailer.js` | Email alerts/notifications                                                                                     |

### Client code

`public/js/client.js` (~17k lines) is the browser-side counterpart — it owns the entire room UI, WebRTC peer connection mesh, and Socket.IO event handlers. Smaller siblings in `public/js/` cover specific concerns (`videoGrid.js`, `waitingRoom.js`, `speechRecognition.js`, `noiseSuppressionProcessor.js`, `roomTemplate.js`, etc.). Recent refactors have extracted DOM templates into `public/js/roomTemplate.js` (tested by `tests/test-RoomTemplates.js` via JSDOM + `vm`).

Views in `public/views/` are static HTML; the server serves them with `htmlInjector` substitutions for branding, OIDC state, and analytics tags.

### Tests

Mocha + `should` + `sinon` + `proxyquire`. Tests run without a live server — they require modules under test and stub their dependencies. `test-RoomTemplates.js` evaluates the client-side template module inside JSDOM. There is no integration/E2E suite in this repo.

### Optional integrations (all env-gated)

ChatGPT (OpenAI), Sentry, Slack slash commands, Mattermost bot, Ngrok tunneling, webhook outbound, SMTP email. Each is a top-level conditional block in `server.js` keyed off its `config.<feature>.enabled` flag. When extending, follow the same pattern: feature-flag in `.env.template`, parse in `config.template.js`, conditional require + init in `server.js`.

### Adjacent services in this repo

- `webhook/` — standalone tiny Express app (`webhook/server.js`) used as a local receiver for the main app's outbound webhook integration. Has its own `package.json`.
- `widgets/` — static HTML examples of the embeddable widget; not part of the server build.
- `kubernetes/` — k8s manifests; unused by the SGC deployment path (we use Docker via the ansible role).

## Conventions

- Prettier config in `.prettierrc.js` is the source of truth for formatting; run `npm run lint` before committing.
- The codebase uses CommonJS (`require`), not ESM, throughout.
- Bumping the app version: `package.json`, the banners in `app/src/server.js` and `app/src/config.template.js`, and the header of `.env.template` all carry the version string. CI (`.github/workflows/ci.yml`) runs `npm test` then builds/pushes the upstream Docker image on push to `master`; for SGC, do not rely on CI — build and push to `legitservices` manually.
