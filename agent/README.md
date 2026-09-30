# Priyanshu Autonomous AI Agent

This directory defines the architecture for the project's AI agent.

## Capabilities
- Understand natural-language tasks
- Plan multi-step work
- Read project context
- Propose and implement website changes through the GitHub workflow
- Explain changes
- Keep secrets out of frontend code

## Safe architecture
Browser UI -> server-side agent -> AI model -> project tools/GitHub

Never put an AI provider API key in `index.html`, `style.css`, or browser JavaScript.

## Setup
1. Choose an AI provider/model.
2. Store its API key in the deployment platform's encrypted environment variables.
3. Implement the server endpoint described in the project documentation.
4. Connect the frontend chat UI to that endpoint.

The agent must request confirmation before destructive repository operations and must not claim tests were run unless they actually ran.
