# Security & Compliance

## Secret Management
- All API keys and credentials are managed via environment variables (`.env` files or GCP/Firebase secrets).
- Never commit secrets to version control.
- Rotate keys regularly and document the process.

## Data Privacy
- Ensure all user data is encrypted in transit (HTTPS) and at rest (GCP/Firebase defaults).
- Follow least-privilege principle for service accounts and API keys.

## Compliance
- Review and comply with relevant regulations (HIPAA for healthcare, PCI DSS for payments, etc.).
- Document compliance requirements for each supported industry.

## Security Best Practices
- Sanitize all user inputs and validate API requests.
- Use secure dependencies and monitor for vulnerabilities.
- Enable logging and alerting for suspicious activity. 