# Cursor Best Practices

## Prompt Engineering
- Be explicit and concise in your instructions to the meta agent.
- Use clear, unambiguous language for commands and configuration.
- Provide context and expected outcomes for each request.

## Workflow Tips
- Use the one-command deployment script (`deploy.sh`) for consistency.
- Store all secrets in environment variables and never commit them.
- Leverage modular templates for adding new agent types or workflows.
- Document all changes and update the knowledge base regularly.
- Use CI/CD pipelines for automated testing and deployment.

# Cursor Best Practices Guide

Cursor is an AI-powered IDE and agent development environment. Following best practices ensures efficient, secure, and scalable agent workflows.

- **Official Docs:** [Cursor AI Prompting Best Practices](https://docs.cursor.so/)

**Use this guide to optimize agent development, integration, and collaboration in Cursor.**

---

## PowerShell Command Chaining Rule

> **Rule:** In Windows PowerShell, do not use '&&' as a statement separator. Use ';' or ':' instead, or run commands on separate lines. If you need Unix-style chaining, use a compatible shell (e.g., Git Bash, WSL, or install a POSIX-compliant shell). Always check your shell's syntax before scripting command chains.

---

## File/Directory Existence Rule

> **Rule:** Always check for existing files and directories before suggesting or creating them. If a file or path exists, suggest updating, appending, or reviewing its contents instead of recreating. Use idempotent logic in all scripts and automation (e.g., `if [ ! -f filename ]; then ... fi` in bash, or `Test-Path` in PowerShell). Document this for all future development and onboarding. 