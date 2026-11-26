# Voice Sales Agent

A voice agent that talks with visitors to [arlabs.tech](https://arlabs.tech). It asks what they use AI for today, finds the problem they want solved and what solving it would change, then offers a follow-up with Richard. While it talks, the page shows which stage the conversation is in and what the agent has picked up so far.

**Try it:** [salesbot.arlabs.tech](https://salesbot.arlabs.tech)

## How it works

- **Audio** travels between the browser and the bot over WebRTC, through [Daily](https://www.daily.co).
- **[Pipecat](https://github.com/pipecat-ai/pipecat)** runs the voice pipeline: Deepgram turns speech into text, Claude Haiku writes the reply (OpenAI's gpt-4o-mini can stand in), and Cartesia speaks it.
- **Conversation stages** are a state machine built on Pipecat Flows. Each stage lists the facts it needs; a separate model call reads the conversation, records those facts and decides when the stage is done, so the voice model only has to talk.
- **The page** is React and the Pipecat client. It follows the conversation through messages the bot sends as each fact is recorded and each stage completes.
- **After the call**, a visitor can leave an email address; the request is stored in SQLite and sent on with Resend.

## What's here

The source code is private. This repository holds the design:

- [DESIGN.md](DESIGN.md): the architecture, the conversation stages and the decisions behind them
- [docs/adr](docs/adr/ADR-INDEX.md): the architecture decision records
- [docs/diagrams](docs/diagrams/salesbot-slice1-architecture.svg): the architecture diagram
- [docs/pipecat-architecture.md](docs/pipecat-architecture.md): notes on how Pipecat runs a voice pipeline
