# Meta Agent Prompts

## Sample Commands
- "Create a healthcare agent with medical Q&A and appointment scheduling."
- "Deploy a real estate agent with property search and lead capture."
- "Add Stripe billing to the fintech agent."
- "Check the status of all deployed agents."
- "Update the education agent to use the latest Hugging Face model."

## Expected Outputs
- Confirmation of agent creation, configuration, and deployment
- URLs/endpoints for deployed agents
- Error messages with suggested fixes
- Status reports and health checks

## Edge Case Handling
- Invalid or unsupported industry: "Sorry, that industry is not yet supported. Please choose from: [list]"
- Missing API keys: "API key for [service] is missing. Please add it to your environment variables."
- Deployment failure: "Deployment failed due to [reason]. See logs at [URL] and try again." 