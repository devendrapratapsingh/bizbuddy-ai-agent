#!/bin/bash
# ================================================================
# setup-multimodel.sh
# Multi-Model OpenRouter Profile System for Claude Code
#
# USAGE:
#   bash setup-multimodel.sh
#
# AFTER SETUP, switch modes with:
#   claude-code    → general coding
#   claude-vision  → images & video analysis
#   claude-research→ deep research & reasoning
#   claude-write   → articles & content
#   claude-teach   → teacher / tutor mode
#   claude-audio   → audio transcription / analysis
#   claude-think   → ultrathink / hard reasoning
#
# OR: use the interactive switcher:
#   claude-switch
# ================================================================

set -e

# ── YOUR CONFIG ─────────────────────────────────────────────────
OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-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}"
PROJECT_DIR="$(pwd)"
CLAUDE_DIR="$PROJECT_DIR/.claude"
PROFILES_DIR="$CLAUDE_DIR/profiles"

# ── BEST FREE MODELS PER DOMAIN (March 2026) ────────────────────
# 🖥️  CODE     — Qwen3 Coder 480B: #1 free coding model, 262K context
MODEL_CODE="qwen/qwen3-coder-480b-a35b-instruct:free"
MODEL_CODE_SMALL="deepseek/deepseek-r1-0528:free"

# 🔬 RESEARCH  — DeepSeek R1: best free reasoning/chain-of-thought
MODEL_RESEARCH="deepseek/deepseek-r1-0528:free"
MODEL_RESEARCH_SMALL="qwen/qwq-32b:free"

# 🖼️  VISION   — Qwen3 VL 235B Thinking: best free multimodal (images + video)
MODEL_VISION="qwen/qwen3-vl-235b-thinking:free"
MODEL_VISION_SMALL="qwen/qwen3-vl-30b-a3b-thinking:free"

# 🎵 AUDIO     — Gemma 3 27B: best free model with audio understanding
MODEL_AUDIO="google/gemma-3-27b-it:free"
MODEL_AUDIO_SMALL="google/gemma-3-12b-it:free"

# ✍️  ARTICLE  — Trinity Large (user's preferred) + Llama 70B fallback
MODEL_WRITE="arcee-ai/trinity-large-preview:free"
MODEL_WRITE_SMALL="meta-llama/llama-3.3-70b-instruct:free"

# 👨‍🏫 TEACHER  — Llama 3.3 70B: strong instruction-following, broad knowledge
MODEL_TEACH="meta-llama/llama-3.3-70b-instruct:free"
MODEL_TEACH_SMALL="mistralai/mistral-small-3.1-24b-instruct:free"

# 🧠 ULTRATHINK — Qwen3 235B Thinking: best free deep reasoning model
MODEL_THINK="qwen/qwen3-235b-a22b-thinking:free"
MODEL_THINK_SMALL="deepseek/deepseek-r1-0528:free"

# ────────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       🤖  Claude Code × OpenRouter Multi-Model          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  Project: $PROJECT_DIR"
echo ""

mkdir -p "$PROFILES_DIR"

# ── HELPER: write a profile ──────────────────────────────────────
write_profile() {
  local NAME=$1
  local PRIMARY=$2
  local SMALL=$3
  local DIR="$PROFILES_DIR/$NAME"
  mkdir -p "$DIR"

  cat > "$DIR/settings.local.json" <<EOF
{
  "_profile": "$NAME",
  "_model_primary": "$PRIMARY",
  "permissions": {
    "allow": [
      "Bash", "Edit", "Write", "Read",
      "WebFetch", "WebSearch", "Glob", "Grep", "Agent"
    ],
    "blockedCommands": []
  },
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "$PROJECT_DIR"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-github"]
    }
  },
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "$OPENROUTER_API_KEY",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_MODEL": "$PRIMARY",
    "ANTHROPIC_SMALL_FAST_MODEL": "$SMALL"
  }
}
EOF
  echo "  ✅ Profile [$NAME] → $PRIMARY"
}

# ── CREATE ALL PROFILES ─────────────────────────────────────────
echo "📁 Creating profiles..."
write_profile "code"     "$MODEL_CODE"     "$MODEL_CODE_SMALL"
write_profile "research" "$MODEL_RESEARCH" "$MODEL_RESEARCH_SMALL"
write_profile "vision"   "$MODEL_VISION"   "$MODEL_VISION_SMALL"
write_profile "audio"    "$MODEL_AUDIO"    "$MODEL_AUDIO_SMALL"
write_profile "write"    "$MODEL_WRITE"    "$MODEL_WRITE_SMALL"
write_profile "teach"    "$MODEL_TEACH"    "$MODEL_TEACH_SMALL"
write_profile "think"    "$MODEL_THINK"    "$MODEL_THINK_SMALL"

# ── ACTIVATE DEFAULT PROFILE (code) ────────────────────────────
cp "$PROFILES_DIR/code/settings.local.json" "$CLAUDE_DIR/settings.local.json"
echo ""
echo "  🎯 Active profile set to: [code]"

# ── WRITE THE SWITCHER SCRIPT ───────────────────────────────────
SWITCHER="$PROJECT_DIR/claude-switch.sh"
cat > "$SWITCHER" <<'SWITCHEOF'
#!/bin/bash
# ================================================================
# claude-switch.sh  — Interactive multi-model profile switcher
# Usage: bash claude-switch.sh [profile]
#        bash claude-switch.sh code
#        bash claude-switch.sh            (interactive menu)
# ================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILES_DIR="$PROJECT_DIR/.claude/profiles"
SETTINGS="$PROJECT_DIR/.claude/settings.local.json"

declare -A PROFILE_LABELS=(
  ["code"]="🖥️  Code        — Qwen3 Coder 480B (262K ctx, #1 free coder)"
  ["research"]="🔬 Research    — DeepSeek R1 0528 (chain-of-thought, deep reasoning)"
  ["vision"]="🖼️  Vision      — Qwen3 VL 235B Thinking (images + video)"
  ["audio"]="🎵 Audio       — Gemma 3 27B (audio/speech understanding)"
  ["write"]="✍️  Article     — Trinity Large Preview (writing & content)"
  ["teach"]="👨‍🏫 Teacher     — Llama 3.3 70B (instruction, tutoring)"
  ["think"]="🧠 Ultrathink  — Qwen3 235B Thinking (hardest reasoning)"
)

PROFILES=("code" "research" "vision" "audio" "write" "teach" "think")

get_active() {
  if [ -f "$SETTINGS" ]; then
    python3 -c "
import json
try:
  with open('$SETTINGS') as f:
    d = json.load(f)
  print(d.get('_profile', 'unknown'))
except:
  print('unknown')
" 2>/dev/null || echo "unknown"
  else
    echo "none"
  fi
}

switch_to() {
  local PROFILE=$1
  if [ ! -d "$PROFILES_DIR/$PROFILE" ]; then
    echo "❌ Unknown profile: $PROFILE"
    echo "   Available: ${PROFILES[*]}"
    exit 1
  fi
  cp "$PROFILES_DIR/$PROFILE/settings.local.json" "$SETTINGS"
  echo ""
  echo "  ✅ Switched to: ${PROFILE_LABELS[$PROFILE]}"
  echo "  📄 Active: $SETTINGS"
  echo ""
}

# Direct switch if argument given
if [ -n "$1" ]; then
  switch_to "$1"
  exit 0
fi

# Interactive menu
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         🤖  Claude Code — Model Profile Switcher        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
ACTIVE=$(get_active)
echo "  Current profile: [$ACTIVE]"
echo ""
echo "  Select a profile:"
echo ""

for i in "${!PROFILES[@]}"; do
  PROFILE="${PROFILES[$i]}"
  NUM=$((i + 1))
  MARKER="  "
  [ "$PROFILE" = "$ACTIVE" ] && MARKER="→ "
  echo "  $MARKER $NUM) ${PROFILE_LABELS[$PROFILE]}"
done

echo ""
echo -n "  Enter number (1-${#PROFILES[@]}) or q to quit: "
read -r CHOICE

if [[ "$CHOICE" == "q" || "$CHOICE" == "Q" ]]; then
  echo "  Cancelled."
  exit 0
fi

if [[ "$CHOICE" =~ ^[0-9]+$ ]] && [ "$CHOICE" -ge 1 ] && [ "$CHOICE" -le "${#PROFILES[@]}" ]; then
  IDX=$((CHOICE - 1))
  switch_to "${PROFILES[$IDX]}"
else
  echo "  ❌ Invalid choice."
  exit 1
fi
SWITCHEOF

chmod +x "$SWITCHER"
echo ""
echo "🔀 Switcher created: claude-switch.sh"

# ── FIX ONBOARDING TRAP ─────────────────────────────────────────
GLOBAL_CLAUDE_JSON="$HOME/.claude.json"
if [ ! -f "$GLOBAL_CLAUDE_JSON" ]; then
  echo '{"hasCompletedOnboarding": true}' > "$GLOBAL_CLAUDE_JSON"
  echo "✅ Created ~/.claude.json (onboarding bypass)"
else
  python3 - <<PYEOF
import json
path = "$GLOBAL_CLAUDE_JSON"
try:
  with open(path) as f:
    data = json.load(f)
  if not data.get("hasCompletedOnboarding"):
    data["hasCompletedOnboarding"] = True
    with open(path, "w") as f:
      json.dump(data, f, indent=2)
    print("✅ Patched hasCompletedOnboarding in ~/.claude.json")
  else:
    print("✅ ~/.claude.json onboarding already complete")
except Exception as e:
  print(f"⚠️  Could not patch ~/.claude.json: {e}")
PYEOF
fi

# ── PROTECT API KEYS IN GIT ─────────────────────────────────────
GITIGNORE="$PROJECT_DIR/.gitignore"
PROTECTED=(
  ".claude/settings.local.json"
  ".claude/profiles/*/settings.local.json"
)
touch "$GITIGNORE"
for PATTERN in "${PROTECTED[@]}"; do
  if ! grep -qF "$PATTERN" "$GITIGNORE" 2>/dev/null; then
    echo "$PATTERN" >> "$GITIGNORE"
  fi
done
echo "✅ .gitignore updated (API keys protected)"

# ── WRITE SHELL ALIASES ─────────────────────────────────────────
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then SHELL_RC="$HOME/.zshrc"; fi
if [ -f "$HOME/.bashrc" ] && [ -z "$SHELL_RC" ]; then SHELL_RC="$HOME/.bashrc"; fi

ALIAS_BLOCK="
# ── Claude Code Multi-Model Aliases ── (auto-generated)
alias claude-switch='bash $PROJECT_DIR/claude-switch.sh'
alias claude-code='bash $PROJECT_DIR/claude-switch.sh code && claude'
alias claude-research='bash $PROJECT_DIR/claude-switch.sh research && claude'
alias claude-vision='bash $PROJECT_DIR/claude-switch.sh vision && claude'
alias claude-audio='bash $PROJECT_DIR/claude-switch.sh audio && claude'
alias claude-write='bash $PROJECT_DIR/claude-switch.sh write && claude'
alias claude-teach='bash $PROJECT_DIR/claude-switch.sh teach && claude'
alias claude-think='bash $PROJECT_DIR/claude-switch.sh think && claude'
# ──────────────────────────────────────────────────────"

if [ -n "$SHELL_RC" ]; then
  if ! grep -q "Claude Code Multi-Model Aliases" "$SHELL_RC"; then
    echo "$ALIAS_BLOCK" >> "$SHELL_RC"
    echo "✅ Shell aliases added to $SHELL_RC"
    echo "   Run: source $SHELL_RC  (to activate now)"
  else
    echo "✅ Shell aliases already in $SHELL_RC"
  fi
fi

# ── PRINT SYSTEM PROFILE TABLE ───────────────────────────────────
echo ""
echo "╔════════════╦══════════════════════════════════════════════╗"
echo "║  Profile   ║  Model (Primary)                            ║"
echo "╠════════════╬══════════════════════════════════════════════╣"
echo "║ code       ║ qwen/qwen3-coder-480b-a35b-instruct:free    ║"
echo "║ research   ║ deepseek/deepseek-r1-0528:free              ║"
echo "║ vision     ║ qwen/qwen3-vl-235b-thinking:free            ║"
echo "║ audio      ║ google/gemma-3-27b-it:free                  ║"
echo "║ write      ║ arcee-ai/trinity-large-preview:free         ║"
echo "║ teach      ║ meta-llama/llama-3.3-70b-instruct:free      ║"
echo "║ think      ║ qwen/qwen3-235b-a22b-thinking:free          ║"
echo "╚════════════╩══════════════════════════════════════════════╝"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "  Quick start:"
echo "  $ source ~/.zshrc           # activate aliases"
echo "  $ claude-code               # start coding session"
echo "  $ claude-research           # start research session"
echo "  $ claude-switch             # interactive menu"
echo ""
echo "  Or manually:"
echo "  $ bash claude-switch.sh code"
echo "  $ claude"
echo ""