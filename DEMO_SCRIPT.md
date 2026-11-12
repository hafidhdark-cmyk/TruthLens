# TruthLens: 2-Minute Hackathon Demo Script
**Track 1: AI and Trustworthy Electoral Information**
*Target Audience: Hackathon Judges & Civic Tech Evaluators*

---

### Timing Breakdown (120 Seconds Total)

| Timestamp | Phase | Action / Talking Point |
|---|---|---|
| **0:00 – 0:15** | **The Problem** | *"During elections, viral misinformation on WhatsApp and social media can suppress voter turnout before human fact-checkers can react. TruthLens is a source-grounded AI system that cross-references electoral claims directly against verified regulations — with zero hallucinations."* |
| **0:15 – 0:45** | **Test 1: Supported Claim** | Click **Synthetic Demo Claim 1** (*"Permanent Voter Cards must be collected in person..."*).<br/>• Show the **Green Badge**: `Supported by sources`.<br/>• Point out the verified citation: `INEC-DOC-002` with direct excerpt: *“Collection by proxy is strictly prohibited...”*<br/>• Emphasize the live link to verify at official INEC channels. |
| **0:45 – 1:15** | **Test 2: Not Supported Claim** | Click **Synthetic Demo Claim 2** (*"INEC announced registered voters can cast ballot online via WhatsApp..."*).<br/>• Show the **Red Badge**: `Not supported by sources`.<br/>• Show how TruthLens cites statutory procedures (`INEC-DOC-004`, `INEC-DOC-005`, `INEC-DOC-006`) proving that balloting requires in-person BVAS accreditation and physical secret ballot.<br/>• Highlight prompt injection protection: malicious user inputs cannot alter the system prompt. |
| **1:15 – 1:35** | **Test 3: Insufficient Evidence** | Click **Synthetic Demo Claim 3** (*"Polling Unit 014 in Ward 3 recorded an unexpected shortage..."*).<br/>• Show the **Amber Badge**: `Insufficient evidence`.<br/>• Key selling point: **TruthLens never invents facts.** When the corpus does not contain micro-level incident logs, the system refuses to guess and forces *"Insufficient evidence"*. |
| **1:35 – 2:00** | **Human-in-the-Loop & Ethics** | Navigate to the **Reviewer Portal** (`/reviewer`):<br/>• Show how verified claims are held locally in browser storage without exposing user queries on any server.<br/>• Mark a claim as **"Approved"** or **"Corrected"** and add a human reviewer note.<br/>• Highlight **Responsible AI & NDPA 2023 alignment**: non-partisan, no user accounts, no PII collected, and permanent advisory banners on all outputs. |

---

### Backup / Troubleshooting Notes for Demo Presenter
- **Offline / Flight Mode Ready**: If the presentation room Wi-Fi drops, TruthLens continues to function flawlessly in `DEMO_MODE` with cached benchmark evaluations.
- **Direct Navigation Links**:
  - Home Page: `http://localhost:3000`
  - Reviewer Portal: `http://localhost:3000/reviewer`
  - API Health Check: `POST http://localhost:3000/api/verify` with `{"text": "PVC collection"}`
