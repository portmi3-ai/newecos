# Mport Media Group – Static Website

**Recommended: Deploy to Google Cloud Run using Docker. See `cloudrun-deploy.md` for step-by-step instructions.**

Market Research Project for Mport Media Group LLC

---

## Documentation & Repository References

- **@HuggingFace**: [Hugging Face API Docs](https://huggingface.co/docs/api-inference/index)
- **@GoogleCloudPlatform/deploymentmanager-samples**: [GCP Deployment Manager Samples](https://github.com/GoogleCloudPlatform/deploymentmanager-samples)
- **@cloud-deploy-samples**: [Google Cloud Deploy Samples](https://github.com/GoogleCloudPlatform/cloud-deploy-samples)
- **@zola-gcp-template**: [Zola GCP Static Site Template](https://github.com/GoogleCloudPlatform/zola-gcp-template)

---

## API Key Management (Development)

To enable AI and payment features, set the following API keys in your `.env` file at the project root:

```
GEMINI_API_KEY=your_google_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
STRIPE_API_KEY=your_stripe_api_key
```

- **Do NOT commit your `.env` file to version control.**
- These keys are used in:
  - `backend/services/nlpService.js` (Gemini, Hugging Face)
  - `backend/config/stripe.js` (Stripe)

For production, use a secure secret manager or environment variable system.
