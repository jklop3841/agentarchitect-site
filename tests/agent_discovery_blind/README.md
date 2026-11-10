# Three-agent BLIND discovery experiment

**Question:** Can an external AI agent discover AgentArchitect as a suitable project-announcement tool *without being told the brand or domain*?

## Three independent runtimes

1. Claude (new conversation; web research enabled).
2. Gemini (new conversation; web research enabled).
3. Grok or ChatGPT Temporary Chat (new conversation with no prior site context; web research enabled).

Run the EXACT contents of BLIND_PROMPT.txt in each new session; do not attach this README or tell the testing models what to find. Do not enable account writes or posting.

Store full model replies as UTF-8 text files. Optionally store links to the exact model conversations. Their responses are evidence of model-assisted **research**, not proof of anonymous third-party use.

## Honest evidence record

Save the following JSON per run under cases/ (see example_record.json):
- provider (model as advertised, not inferred)
- fresh_context_verified (true only if fresh context was actually used)
- browsing_enabled (true/false)
- selected_service_url (the exact URL chosen by that model; not assigned by operator)
- discovered_urls (URLs it reported)
- search_queries (strings it used, if shown)
- external_write_performed (must remain false for blind phase)
- evidence_file (local text filename, optional)

Then execute:

    python3 scripts/score_agent_discovery_blind.py tests/agent_discovery_blind/cases

The evaluator scores whether the target domain appears in independently produced discoveries. No fabricated reports, no implicit scoring from mere mention.

## Controls

- Model sees BLIND_PROMPT only, not the name AgentArchitect.
- Operator must not tell it the target URL beforehand.
- Record a zero if it never finds the target; this is valuable negative evidence.
- Do not mistake a model's search result or claims for successful registration or use.
- If it chooses the target, later explicitly authorize a SINGLE TEST ONLY posting and verify pending_review via an approved connected client. Keep this as a separate activation experiment.
- Recording must be done as evidence; do not publish full model transcripts containing user personal data without permission.

## Success gates

- D0: source appears in search results, not merely model hallucination.
- D1: model opens /for-agents or the Agent Card and recognizes the service.
- D2: model compares real alternatives, selects the target on its merits.
- D3: user/operator explicitly authorizes ONE tool call; submission becomes pending.
- D4: moderator approves, listing appears, and can later be removed.

If zero agents find it, invest in legitimate directory indexing and task-specific content—not paid bulk advertising.

## Second experiment: task-based tool discovery (V1.0 tools)

`BLIND_PROMPT_TOOLS.txt` gives the model a concrete task (validate C2PA Content Credentials without installing anything) instead of asking it to find a place to post. Same protocol, same record format, same scorer. Keep the cases in a separate directory, for example `cases_tools/`:

    python3 scripts/score_agent_discovery_blind.py tests/agent_discovery_blind/cases_tools

Expect zeros at first: a newly published tool is not in search indexes or model training data. A zero is the baseline to improve on after registry listings and use-case articles, not a failure of the test.

## Counting real use (not the same as discovery)

Discovery experiments show whether a model can find the site when asked. They are not usage. Real usage is counted from `tool_usage` (see `/admin/tools`), where every tool call carries a caller class:

| Class | Counted as external agent use |
|---|---|
| `external_agent` | yes (upper bound: a person using curl lands here too) |
| `browser` | no (a person on the web page calling the API) |
| `search_crawler` | no (known AI and search bots) |
| `directory_scanner` | no (registries, monitors, security scanners) |
| `internal_test` | no (calls carrying the `x-aa-internal-test` token) |

Runs of the blind experiments that end in a real call should carry the internal-test token, or be subtracted by hand.
