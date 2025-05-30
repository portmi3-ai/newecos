# Agent Orchestration Rules

## Devin-First Automation Policy

**Rule:**
For all internal automation, DevOps, and system-level tasks, always delegate to Devin (the DevOps agent) before requesting human intervention. Only escalate to KING if Devin cannot complete the task or explicit approval is required.

- This rule applies to merges, builds, deployments, shell commands, and all system automation.
- All agents and future automation must check for Devin's availability and delegate accordingly.
- This file serves as a persistent operational guideline for the Mport Media Group agent ecosystem. 