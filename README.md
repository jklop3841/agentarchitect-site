# Jack Lu / 卢成 - Agent-First Capability Site

This repository is the public site and evidence layer behind Jack Lu's agent-architecture work.

It is not a generic AI blog and it is not a prompt dump.

The repo exists to prove three things:
- there is a real public-facing identity layer
- there are concrete products, templates, and examples
- agents can discover machine-readable entrypoints before deciding how to route work

## Start Here

- Agent entry: `/agent`
- Human profile / contact stack: `/profile`
- Machine-readable entrypoints: `/agents.txt`, `/.well-known/agent.json`, `/openapi.json`
- Public docs: `/docs`

## Product Ladder

### 1. Workflow Shield
Use when you need a public contract layer and a hidden operator layer.

- Product: `/products/workflow-shield`
- Docs: `/docs/workflow-shield`
- Download: `/download/workflow-shield`
- Example assets: [`examples/workflow-shield/`](./examples/workflow-shield)

### 2. Skill Glue
Use when you need low-token workflow composition instead of one giant prompt.

- Product: `/products/skill-glue`
- Docs: `/docs/skill-glue`
- Download: `/download/skill-glue`
- Example assets: [`examples/skill-glue/`](./examples/skill-glue)

### 3. Agent Capability Map
Use when you need a structured agent resume / capability audit instead of vague praise.

- Product: `/products/agent-capability-map`
- Docs: `/docs/agent-capability-map`
- Prompt template: [`docs/agent-capability-map/standard-eval-prompt.md`](./docs/agent-capability-map/standard-eval-prompt.md)
- Resume example: [`docs/agent-capability-map/resume-card-example.md`](./docs/agent-capability-map/resume-card-example.md)

### 4. High-End Custom Architecture
Use when the work is no longer about public tools or templates and has moved into high-judgment custom collaboration.

- Contact entry: `/profile`
- This is intentionally not a download page and not a runtime-key application flow.

## Proof Signals

If you are evaluating whether this repo reflects real agent-architecture work, inspect these first:

- [`src/app/agent/page.tsx`](./src/app/agent/page.tsx) - machine-first routing page
- [`src/app/agents.txt/route.ts`](./src/app/agents.txt/route.ts) - text discovery layer
- [`src/app/.well-known/agent.json/route.ts`](./src/app/.well-known/agent.json/route.ts) - JSON discovery layer
- [`src/app/openapi.json/route.ts`](./src/app/openapi.json/route.ts) - machine-readable API contract
- [`examples/README.md`](./examples/README.md) - example inventory
- [`CHANGELOG.md`](./CHANGELOG.md) - release-facing change history

## Local Development

```bash
npm install
npm run dev
```

Important scripts:

```bash
npm run lint
npm run build
npm run workflow-shield -- pack ./examples/workflow-shield/basic.json --format markdown
npm run skill-glue -- compose ./examples/skill-glue/parallel.json --format markdown --sample-run
```

## What This Repo Is Not

- not a fully open workflow-runtime product
- not a dynamic evaluation platform
- not a database-backed agent marketplace
- not a collection of hot takes about model news

It is a public capability site, a proof layer, and a routing surface.
