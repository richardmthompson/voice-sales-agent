# Architecture Decision Records

Decisions made during the AR Labs Voice Agent build, documented as they happen.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001.md) | Build from scratch vs. deploy existing codebase | Accepted | 2026-04-04 |
| [ADR-002](ADR-002.md) | Three-module architecture (Frontend, LLM, Voice) | Superseded by ADR-013 | 2026-04-04 |
| [ADR-003](ADR-003.md) | Pipecat for voice pipeline framework | Accepted | 2026-04-05 |
| [ADR-004](ADR-004.md) | Daily.co for WebRTC transport | Accepted | 2026-04-05 |
| [ADR-005](ADR-005.md) | Deepgram for speech-to-text | Accepted | 2026-04-05 |
| [ADR-006](ADR-006.md) | FastAPI for Python web framework | Superseded by ADR-013 | 2026-04-05 |
| [ADR-007](ADR-007.md) | Conversation orchestration approach | Superseded by ADR-020 | 2026-04-05 |
| [ADR-008](ADR-008.md) | Hosting topology — portfolio on Vercel, demos on VPS subdomains | Partially Superseded by ADR-019 | 2026-04-07 (amended 2026-04-13) |
| [ADR-009](ADR-009.md) | Real-time control plane via Pipecat RTVI / Daily data channels | Accepted | 2026-04-07 |
| [ADR-010](ADR-010.md) | Daily.co region selection for geographically-distant audiences | Superseded by ADR-019 | 2026-04-07 |
| [ADR-011](ADR-011.md) | Vite + React for frontend framework (not Next.js) | Accepted | 2026-04-12 |
| [ADR-012](ADR-012.md) | Cartesia for text-to-speech | Accepted | 2026-04-07 |
| [ADR-013](ADR-013.md) | Pipecat native tool calling over Agent SDK | Accepted | 2026-05-26 |
| [ADR-014](ADR-014.md) | GPT-4o-mini for voice conversation | Superseded by ADR-022 | 2026-05-26 |
| [ADR-015](ADR-015.md) | SQLite for persistent storage | Accepted | 2026-05-26 |
| [ADR-016](ADR-016.md) | Email capture via frontend field, not voice | Accepted | 2026-05-26 |
| [ADR-017](ADR-017.md) | Two-gate gamification driving pipeline UI | Partially Superseded by ADR-021 | 2026-05-26 |
| [ADR-018](ADR-018.md) | Resend for transactional email | Accepted | 2026-05-26 |
| [ADR-019](ADR-019.md) | Migrate voice pipeline from VPS to Pipecat Cloud | Accepted | 2026-06-01 |
| [ADR-020](ADR-020.md) | pipecat-flows for conversation state machine | Accepted | 2026-06-12 |
| [ADR-021](ADR-021.md) | Responder-driven incremental gate recording | Accepted | 2026-07-21 |
| [ADR-022](ADR-022.md) | Claude Haiku 4.5 as the voice responder | Accepted | 2026-10-21 |

## Convention

- **Format:** Each ADR follows the Nygard template (Context, Decision, Consequences)
- **Numbering:** Sequential, never reused
- **Status:** Proposed → Accepted → Deprecated/Superseded
- **Location:** `projects/arlabs.tech/salesbot/docs/adr/ADR-NNN.md`
