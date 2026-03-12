# 🚨 TOKEN ROTATION REQUIRED

## Exposed Token Details

### Token 1: `.claude/settings.local.json`
**File**: `.claude/settings.local.json` (was tracked in git history)
**Token Type**: OpenRouter API Token (Anthropic)
**Token Value**: `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`
**Exposure**: Token was in the initial git commit (712aba4) and visible to anyone with repository access

### Token 2: `claude-switcher.sh`
**File**: `claude-switcher.sh` line 25 (hardcoded default)
**Token Type**: OpenRouter API Token (Anthropic)
**Token Value**: `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`
**Exposure**: Token was hardcoded in script since initial commit (712aba4)
**Status**: ✅ **FIXED in code** (removed), but token must still be rotated

---

## ✅ What We Did

### For Token 1 (.claude/settings.local.json):
1. Removed file from git tracking (kept locally)
2. Added `.claude/*` to `.gitignore`
3. Updated pre-commit hook to skip `.claude/` directory
4. Created template `.claude/settings.local.json.example`

### For Token 2 (claude-switcher.sh):
1. Removed hardcoded token from script
2. Replaced with environment variable requirement
3. Updated pre-commit hook to detect longer API keys (OpenRouter)
4. Updated scan-secrets.js to catch OpenAI/OpenRouter keys (48+ chars)
5. Committed fix on `c048da3`

---

## 🎯 **YOU MUST IMMEDIATELY ROTATE BOTH TOKENS**

### Steps to Rotate (OpenRouter):

1. Go to https://openrouter.ai/keys
2. Find and **revoke BOTH compromised tokens**:
   - Token 1: `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`
   - Token 2: `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`
3. Create **new API key(s)** (you can reuse the same key for both purposes)
4. Update your local `.claude/settings.local.json`:
   ```json
   {
     "env": {
       "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-YOUR-NEW-KEY"
     }
   }
   ```
5. Set `OPENROUTER_API_KEY` environment variable for `claude-switcher.sh`:
   ```bash
   export OPENROUTER_API_KEY="sk-or-v1-YOUR-NEW-KEY"
   ```
   Or add to your shell profile (`~/.zshrc`, `~/.bashrc`).
6. Keep new tokens secure (never commit them)

---

## 🔍 Verify Token Was in Git History

```bash
# Search git history for the exposed token
git log --all -p -- '.claude/settings.local.json' | grep ANTHROPIC_AUTH_TOKEN || echo "Not found in current history (good!)"
```

Note: The token may still be in the remote repository's history. All collaborators should rotate any tokens that might have been exposed.

---

## 📋 After Rotation

1. ✅ Test that Claude Code still works with the new token
2. ✅ Ensure `.claude/settings.local.json` remains untracked (check: `git status`)
3. ✅ Confirm all team members have updated their local settings
4. ✅ Consider enabling GitHub secret scanning (Settings → Security → Code security)

---

## 🔐 Going Forward

- Never commit `.claude/settings.local.json` - it's now in `.gitignore`
- Share `.claude/settings.local.json.example` with team members
- Store API tokens in environment variables or secret managers
- Use pre-commit hook to prevent future leaks

---

**Date**: 2025-03-12
**Status**: ⚠️ **ACTION REQUIRED** - Token not yet rotated
**Impact**: High - API token with potential usage costs

