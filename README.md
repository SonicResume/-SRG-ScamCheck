# -SRG-ScamCheck

**Commercial Scam Detection & Investigation Platform**

-SRG-ScamCheck is a commercial platform designed to help users investigate potentially suspicious websites, messages, payment information, and other scam-related activity.

## Production Status

**Production-ready application**

The platform is designed for production deployment with:

* React + TypeScript frontend
* Vite production builds
* Python backend services
* Firebase integration
* AI-assisted scam analysis
* Ollama-compatible AI inference
* Render backend deployment
* Stripe billing integration
* Environment-based configuration
* Proprietary commercial licensing

## Features

* Website and URL investigation
* Message and text analysis
* Scam and fraud investigation
* Payment and UPI-related checks
* AI-assisted investigation
* Backend-powered analysis services
* Production billing infrastructure
* Secure environment-based configuration

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Python
* Machine-learning models
* API services
* Render deployment

### AI

* Ollama-compatible API
* Qwen-based AI model
* AI-assisted scam investigation

### Infrastructure

* Firebase
* Render
* Stripe

## Production Architecture

```text
User
  ↓
-SRG-ScamCheck Frontend
  ↓
Python Backend API
  ↓
AI / Investigation Services
  ↓
Firebase / External Services
```

Billing is handled through the application's Stripe payment infrastructure.

## Environment Configuration

Production credentials and secrets must be stored using environment variables.

Never commit:

* API keys
* Stripe secret keys
* Stripe webhook secrets
* Private Firebase credentials
* Other private credentials

Use `.env.example` as the configuration reference.

## Deployment

The frontend and backend are deployed as separate services.

The Python backend is located in:

```text
backend/
```

Backend dependencies are defined in:

```text
backend/requirements.txt
```

Large voice-model files are intentionally excluded from Git because GitHub's standard Git file-size limit does not support files of that size.

## Commercial Software

-SRG-ScamCheck is proprietary commercial software.

Commercial use, redistribution, resale, sublicensing, modification for commercial distribution, or incorporation into another commercial product requires written authorization and an applicable commercial license.

See `LICENSE` for the complete proprietary license.

## Legal

The production application provides:

* Terms of Service
* Privacy Policy
* Contact / Support information
* Billing and cancellation information

Use of the service is subject to the applicable Terms of Service and Privacy Policy.

## No-Refund Policy

Payments for the service are **non-refundable**, except where a refund is required by applicable law or expressly approved by the service provider.

The applicable billing terms are presented to users before purchase.

## Contact

For support, commercial licensing, partnerships, or other inquiries, use the official -SRG-ScamCheck contact page.

## Disclaimer

-SRG-ScamCheck is intended to assist with scam and fraud investigation.

Automated analysis may be inaccurate, incomplete, or unavailable in some circumstances. Results should not be treated as guaranteed determinations of fraud, identity, legality, or financial loss.

Users remain responsible for decisions made based on information provided by the service.

## License

**Proprietary Software — All Rights Reserved.**

See `LICENSE` for the complete commercial license terms.
