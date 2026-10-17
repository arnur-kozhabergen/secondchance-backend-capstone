# See sentiment for community comments

Label: icebox

As a member, I need a sentiment service to classify short comments so that I can quickly understand the tone of community interest.

## Acceptance criteria
- The service accepts a sentence in JSON and returns a numeric score plus positive, neutral, or negative sentiment.
- Missing sentence input returns HTTP 400.
- The endpoint is independently deployable and exposes a health check.