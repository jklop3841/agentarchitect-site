# Examples Inventory

These example files are part of the repo's proof layer.

They exist so a visitor, reviewer, or agent can inspect something concrete instead of relying only on product language.

## Workflow Shield

- [`workflow-shield/basic.json`](./workflow-shield/basic.json)

Purpose:
- shows the public-vs-hidden boundary structure
- demonstrates contract, asset exposure, and extraction-cost framing

Before / after:
- before: contract, prompts, fallback logic, and operator notes are bundled together
- after: only the contract layer is public while high-value operator logic stays hidden

## Skill Glue

- [`skill-glue/serial.json`](./skill-glue/serial.json)
- [`skill-glue/parallel.json`](./skill-glue/parallel.json)
- [`skill-glue/replaceable.json`](./skill-glue/replaceable.json)

Purpose:
- shows serial workflow composition
- shows parallel preparation lanes
- shows replaceable heavy/light planning paths

Before / after:
- before: one giant prompt handles everything and must be rerun as a whole
- after: small nodes can be composed, cached, replaced, and explained independently

## Agent Capability Map

- [`../docs/agent-capability-map/standard-eval-prompt.md`](../docs/agent-capability-map/standard-eval-prompt.md)
- [`../docs/agent-capability-map/resume-card-example.md`](../docs/agent-capability-map/resume-card-example.md)

Purpose:
- shows how to evaluate an agent with one standard prompt
- shows how to publish the result as a readable capability resume card

Before / after:
- before: people describe agents with vague praise and unstable impressions
- after: agents are described with one repeatable structure covering role, boundaries, and recommended tasks

## How To Read These

- Treat them as examples of workflow structure, not as production runtime configs
- Use them to understand the design logic behind each free product
- Compare them against the product docs and CLI output rather than reading them in isolation
