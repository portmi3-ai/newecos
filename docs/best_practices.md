# Best Practices

## Development
- Write clean, modular, and well-documented code
- Use consistent naming conventions and code style
- Commit early, commit often, and write clear commit messages
- Write unit and integration tests for all new features
- Use feature branches and pull requests for all changes
- Review code for security, performance, and maintainability

## Security
- Never hardcode secrets or API keys; use environment variables
- Use GCP Secret Manager or similar for production secrets
- Follow the principle of least privilege for all cloud resources
- Regularly rotate credentials and review access logs
- Sanitize all user inputs and validate API requests

## Documentation
- Keep all documentation in the `docs/` directory
- Update docs when adding new features or making changes
- Use Markdown for all documentation
- Maintain onboarding and best practices docs for the team
- Link to external docs and APIs in `docs/resources.md`

## Agent Usage
- Ensure agents have access to up-to-date documentation and APIs
- Log agent actions and monitor for errors or unexpected behavior
- Regularly review and retrain agents as needed
- Use version control for agent prompts and configurations

## Collaboration
- Communicate regularly with the team (standups, Slack, etc.)
- Share knowledge and help onboard new team members
- Review and update onboarding and best practices docs as needed 