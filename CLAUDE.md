# homebridge-valor-fireplace
## Claude Code GitHub Actions

This repo uses Claude Code GitHub Actions for PR automation:

- **`claude-code-review.yml`** - Auto-reviews PRs when marked "Ready for review" (draft → ready triggers review)
- **`claude.yml`** - Responds to `@claude` mentions in PR/issue comments for manual reviews

**Workflow:** Open PRs as draft → push commits → mark "Ready for review" to trigger auto-review. Use `@claude` in comments for follow-up reviews.
