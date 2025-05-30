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