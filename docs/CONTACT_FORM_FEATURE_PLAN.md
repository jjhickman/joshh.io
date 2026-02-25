# Contact Form Feature Plan

Status: planning doc for backend implementation. The current Contact page form is a non-functional UI mock.

## Goals

- Keep personal email address private and out of client code.
- Accept legitimate contact messages from the public site.
- Block obvious spam, abuse, and malicious payloads.
- Keep operational overhead low and AWS-native.

## Proposed Architecture

1. Static site form submits JSON to an HTTPS endpoint.
2. API Gateway receives request and routes to Lambda.
3. Lambda validates payload shape, content quality, and anti-spam checks.
4. On success, Lambda sends message through an email delivery path.
5. Response returns success/failure details to the frontend.

Suggested AWS stack:

- API Gateway HTTP API
- Lambda (Node.js + TypeScript)
- AWS Secrets Manager (recipient + provider credentials)
- CloudWatch Logs + alarms
- Optional DynamoDB table for rate limiting and abuse tracking

## Data Contract (Draft)

Request body:

```json
{
  "name": "string",
  "replyEmail": "string",
  "message": "string",
  "website": "string"
}
```

Notes:

- `website` is a hidden honeypot field. Any non-empty value is treated as spam.
- Validation should use shared Zod schema logic where practical.

## Validation and Security Requirements

Hard checks:

- Name length bounds and allowed characters.
- Email format validation and basic domain sanity checks.
- Message min/max length and character safety checks.
- Reject HTML/script payloads and suspicious link stuffing.
- Reject malformed JSON and unexpected fields.

Abuse controls:

- IP + fingerprint rate limiting.
- Honeypot trap (`website` field).
- Time-based form submission heuristics (too fast => suspicious).
- Optional captcha integration if abuse exceeds baseline.

Operational security:

- Never store recipient email in frontend code or repository.
- Lambda reads recipient and provider tokens from Secrets Manager at runtime.
- Least-privilege IAM for Lambda, API Gateway, and secrets access.
- Structured logs with redaction for sensitive user input.

## Delivery Options

Primary options (evaluate before implementation):

1. **AWS SES**
   - Lowest AWS-native overhead.
   - Requires domain/sender setup and sandbox exit.
2. **Resend / Postmark / Mailgun**
   - Faster onboarding and deliverability tooling.
   - External dependency and API key management.

Decision criteria:

- Ongoing cost
- Deliverability quality
- Operational complexity
- Vendor lock-in tolerance

## Frontend UX Plan

Contact page behavior once wired:

- Client-side validation before submit.
- Loading and disabled submit state.
- Clear inline error messaging.
- Success state with reset confirmation.
- Generic failure messaging that avoids leaking backend details.

## Rollout Phases

### Phase 1: API Skeleton

- Provision API Gateway + Lambda endpoint.
- Add schema validation and request parsing.
- Return mock success/failure responses.

### Phase 2: Real Delivery

- Integrate chosen email provider.
- Add secrets management and IAM policies.
- Add structured logs and alarm hooks.

### Phase 3: Abuse Hardening

- Add rate limiting and honeypot enforcement.
- Add optional captcha if needed.
- Add alerting thresholds for abuse patterns.

### Phase 4: Frontend Integration

- Wire form submit to API endpoint.
- Add UX feedback states and accessibility checks.
- Add integration tests for success/failure flows.

## Testing Plan

- Unit tests for validation schema and sanitization.
- Lambda handler tests for all status paths.
- Contract tests for API request/response shape.
- Manual abuse checks (link spam, script injection, flood patterns).

## Non-Goals (for this phase)

- No backend deployment in this checkpoint.
- No live email sending in this checkpoint.
- No recipient identity stored in repo or client code.
