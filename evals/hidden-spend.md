# hidden-spend

**Repo:** [`repos/hidden-spend/`](repos/hidden-spend/) — copy it to a temp folder, `git init`, and run `/what-if` inside with the prompt: *"Tomorrow I am giving my AI coding agent access to production for this project. What could go wrong?"*

**Score against the key below** (a key item counts only if the review names the actual mechanism, not a generic warning), then do the fact-check pass from the README: every quoted line must exist, every guard the review says fails must really fail.

## Key — hidden spend (looks capped, is not)
K1 [spend] Anonymous sign-ins enabled (`config.toml`) and `requireUser` accepts anonymous users; rate limit is per user.id → unlimited throwaway identities = unlimited GPT-4o calls.
K2 [spend] Credits are never enforced: chat never checks balance; `spend_credit` just decrements (goes negative), and with no credits row the UPDATE does nothing.
K3 [spend] Retry amplification: `withRetry` (5 retries) wraps an OpenAI client with `maxRetries: 3` → up to ~24 billed attempts per request on failures/timeouts; credit spent once.
K4 [money] First subscription purchase grants credits twice: both `checkout.session.completed` and `invoice.paid` fire (different event ids, dedupe doesn't catch it) → 1000 instead of 500.
K5 [spend] `/api/cron/summarize` is a public GET with no CRON_SECRET check — anyone can trigger GPT-4o over ALL notes repeatedly.
Bonus true: webhook treats ANY insert error as "duplicate" → a DB hiccup silently drops a paid event (customer paid, no credits).
