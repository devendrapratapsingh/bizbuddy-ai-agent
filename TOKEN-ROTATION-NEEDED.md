# 🚨 TOKEN ROTATION REQUIRED

## Exposed Token Details

**File**: `.claude/settings.local.json` (was tracked in git history)
**Token Type**: OpenRouter API Token (Anthropic)
**Token Value**: `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`
**Exposure**: Token was in the initial git commit (712aba4) and visible to anyone with repository access

---

## ✅ What We Did

1. Removed `.claude/settings.local.json` from git tracking
2. Added `.claude/*` to `.gitignore`
3. Updated pre-commit hook to skip `.claude/` directory
4. Created template `.claude/settings.local.json.example`

---

## 🎯 **YOU MUST IMMEDIATELY ROTATE THIS TOKEN**

### Steps to Rotate (OpenRouter):

1. Go to https://openrouter.ai/keys
2. Find and **revoke** the compromised token
3. Create a **new API key**
4. Update your local `.claude/settings.local.json`:
   ```json
   {
     "env": {
       "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-NEW-KEY-HERE"
     }
   }
   ```
5. Keep the new token secure (never commit it)

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

