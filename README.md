# TruthLens

> **See the claim. Check the evidence. Know what to trust.**
>
> **#AI4Elections Hackathon** — Track 1: AI and Trustworthy Electoral Information

TruthLens is a source-grounded, privacy-first web application designed to evaluate viral election claims against authoritative electoral regulations and published manuals.

Unlike generative chatbots that can hallucinate or invent plausible-sounding legal sections, TruthLens enforces **deterministic citation validation**: claims are verified strictly against retrieved official passages, citations not present in the retrieved set are stripped, and ungrounded statements are automatically downgraded to *"Insufficient evidence"*.

---

## Key Features

1. **Deterministic Source Grounding**: Evaluates claims strictly against an indexed corpus of electoral regulations. Never invents facts.
2. **Three-Tier Categorisation**:
   - `Supported by sources` (Corroborated by explicit regulatory passages)
   - `Not supported by sources` (Directly contradicted or prohibited by regulation)
   - `Insufficient evidence` (No corroborating evidence in the verified corpus)
3. **Backend Citation Validation**: The backend cross-checks every cited passage ID against the retrieved document set. If a claim lacks valid citations, it is immediately downgraded to *"Insufficient evidence"*.
4. **Prompt-Injection Defence**: User claims are treated strictly as untrusted data within boundary delimiters (`<untrusted_claim>`). The LLM is instructed to ignore any embedded directives or system prompt overrides.
5. **Fail-Safe Demo Fallback**: Works with zero dependencies or API keys out of the box using built-in precomputed responses for standard benchmark claims and offline BM25 retrieval.
6. **Human-in-the-Loop Reviewer Workspace (`/reviewer`)**: Fact-checkers and election monitors can review AI outputs, label items (*"Approved"*, *"Flagged"*, *"Corrected"*), add notes, and export audit logs.
7. **Abuse Mitigation**: In-memory sliding-window rate limiter (10 requests/minute per IP) and 2,000-character input capping.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              User Interface                  │
                      │  Next.js 15 App Router + Tailwind CSS        │
                      └──────────────────────┬───────────────────────┘
                                             │ POST /api/verify
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │         Input Validation & Guardrails        │
                      │  • 2,000 character cap                       │
                      │  • In-memory Rate Limiter (10 req/min/IP)    │
                      │  • Delimiter-based prompt injection shield   │
                      └──────────────────────┬───────────────────────┘
                                             │
                      ┌──────────────────────┴───────────────────────┐
                      │                                              │
                      ▼                                              ▼
           ┌───────────────────────┐                    ┌─────────────────────────┐
           │   1. Claim Extraction │                    │  2. BM25 Search Engine  │
           │   Extracts atomic     │                    │  Scoring over           │
           │   factual assertions  │                    │  data/corpus.json       │
           └──────────┬────────────┘                    └────────────┬────────────┘
                      │                                              │
                      └──────────────────────┬───────────────────────┘
                                             │ Top 3-5 passages + claim
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    3. Isolated LLM Evaluation (lib/llm.ts)   │
                      │    • Google Gemini / OpenAI / Anthropic      │
                      │    • 15s AbortController timeout             │
                      │    • Fallback to DEMO_MODE on timeout/error  │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │       4. Backend Citation Validator          │
                      │  • Strips any hallucinated passage IDs       │
                      │  • Downgrades invalid citations to           │
                      │    "Insufficient evidence"                   │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             Results & Audit Trail            │
                      │  • Color-coded verification card             │
                      │  • Permanent AI advisory banner              │
                      │  • Auto-queued to /reviewer in localStorage  │
                      └──────────────────────────────────────────────┘
```

---

## Quickstart

### Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/truthlens.git
cd truthlens

# Install dependencies
npm install

# (Optional) Set up environment variables
cp .env.example .env.local
```

### Running Locally

```bash
# Start development server
npm run dev

# Or build and run production server
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

TruthLens works **completely offline with zero environment variables** by serving pre-computed benchmark claims. To enable live LLM verification:

| Variable | Description | Default |
|---|---|---|
| `LLM_PROVIDER` | LLM service provider (`gemini`, `openai`, `anthropic`) | `gemini` |
| `LLM_API_KEY` | API Key for the chosen provider | None (triggers fallback) |
| `DEMO_MODE` | Force demo mode for presentations / offline demos (`true`/`false`) | `false` |

---

## Deploying to Vercel (Zero Extra Setup)

TruthLens is designed to deploy to [Vercel](https://vercel.com) with zero database configuration or external dependencies:

1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **Add New Project** and select the repository.
3. Keep the default settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. *(Optional)* Add `LLM_API_KEY` and `LLM_PROVIDER=gemini` in **Environment Variables**.
5. Click **Deploy**. Your app will be live within 60 seconds.

---

## Replacing Corpus Placeholders with Real Electoral Sources

All entries in `data/corpus.json` are currently placeholder passages adhering to strict hackathon guidelines: marked with `"placeholder": true` and `"note": "Replace with real excerpt from official INEC/Electoral Act source before production"`.

### Schema

```json
{
  "id": "INEC-DOC-002",
  "source_title": "INEC Regulations on Permanent Voter Card (PVC) Collection",
  "source_url": "https://inecnigeria.org",
  "published_date": "2023-01-15",
  "text": "Permanent Voter Cards (PVCs) must be collected in person by the registered voter at designated INEC Local Government Area offices or designated Ward collection centers...",
  "placeholder": true,
  "note": "Replace with real excerpt from official INEC/Electoral Act source before production"
}
```

### Steps to Replace with Official Data:

1. **Obtain Official Gazette or Regulation Documents**:
   - Nigeria Electoral Act (e.g. 2022)
   - INEC Regulations and Guidelines for the Conduct of Elections
   - INEC Manual for Election Officials
   - Official INEC Press Statements from [inecnigeria.org](https://inecnigeria.org)
2. **Segment into Passages**:
   - Break legal and regulatory sections into discrete passages of 50–150 words each.
   - Each passage should address one specific administrative rule (e.g. collation order, voter accreditation, BVAS troubleshooting, proxy voting prohibition).
3. **Update `data/corpus.json`**:
   - Replace the `text` field with verbatim excerpts.
   - Set `"placeholder": false`.
   - Update `source_title`, `published_date`, and the exact canonical `source_url`.
4. **Rebuild the App**:
   - Run `npm run build`. The in-memory BM25 indexer will automatically re-index the updated passages at startup.

---

## Responsible AI & Privacy Framework

TruthLens adheres strictly to responsible AI principles tailored for democratic elections:

- **Non-Partisan Mandate**: TruthLens never evaluates political candidates, campaign promises, or electoral fairness. It focuses solely on procedural, regulatory, and administrative facts.
- **No Declaration of Results or Fraud**: The tool does not declare election winners, tally disputed votes, or make legal determinations of fraud.
- **Privacy & NDPA 2023 Compliance**:
  - No personal identifiable information (PII) is collected or processed.
  - No user accounts or authentication cookies are required.
  - Submitted queries are processed ephemerally in memory and are **never stored on server disks or databases**.
  - Reviewer records reside exclusively in the reviewer's browser `localStorage` and can be cleared at any time.
- **Transparent AI Advisory**: Every verification card features a permanent warning:
  > *"AI-generated assessment. Not an official INEC finding. Not reviewed by a human unless marked."*
- **Human Oversight**: Public claims marked for broadcast or official dissemination require human-in-the-loop review through the `/reviewer` portal.

---

## Limitations

- **Corpus Boundary**: The tool can only verify claims against documents present in its corpus. It cannot verify hyper-local, real-time election day incidents (e.g. specific polling unit logistics delays) without a connected real-time incident database.
- **Advisory Only**: AI assessments are intended to assist human fact-checkers and citizens, not replace official statements from the Independent National Electoral Commission (INEC).
