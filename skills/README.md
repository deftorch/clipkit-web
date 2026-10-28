# ClipKit Agent Skill Distribution & Setup

This directory contains the installable agent skill for **ClipKit**, enabling autonomous AI agents (Claude Code, Antigravity, and other LLM developer agents) to author, edit, compose, validate, inspect, and export VRM 1.0 character animations.

---

## 1. Directory Structure

```
skills/
├── README.md                      # Setup and installation documentation
├── clipkit.skill                  # Packaged distribution archive (.skill)
└── clipkit/
    ├── SKILL.md                   # Agent skill manifest, trigger, and workflow rules
    ├── scripts/
    │   └── clipkit.mjs            # Bundled standalone CLI tool
    ├── references/                # In-depth architectural & kinematic references
    │   ├── dsl.md                 # Full ClipKit JSON DSL specification
    │   ├── channels.md            # Auto-generated rig channels, limits, and parts
    │   ├── rules.md               # Auto-generated validation codes and thresholds
    │   ├── validation-fixes.md    # Actionable diagnostic remedy guide
    │   ├── face.md                # Facial expressions, gaze, and jaw control
    │   ├── hands.md               # Finger poses and grip postures
    │   ├── locomotion.md          # Ground contact, weight shifting, and root motion
    │   ├── combat.md              # Attack anticipation, hitboxes, and recovery
    │   └── animation-principles.md# Classical timing adapted to 3D avatars
    ├── assets/
    │   └── examples/              # Verified reference animation clips
    └── evals/                     # Automated skill evaluation suite
        └── evals.test.js          # Vitest suite testing end-to-end agent workflows
```

---

## 2. Installation & Setup

### A. Repository-Based Usage (`.claude/skills/`)
To configure the skill directly within a repository for Claude Code:

```bash
# 1. Create the repository skill directory
mkdir -p .claude/skills

# 2. Copy the skill directory into place
cp -r skills/clipkit .claude/skills/

# Alternatively, extract the packaged .skill bundle:
unzip -q skills/clipkit.skill -d .claude/skills/clipkit
```

### B. Global Agent Configuration
To make the skill available across all projects for Antigravity or custom agent runtimes:

```bash
# Antigravity IDE / Google AGY:
mkdir -p ~/.gemini/config/skills
cp -r skills/clipkit ~/.gemini/config/skills/

# Custom Agent Roots:
mkdir -p .agents/skills
cp -r skills/clipkit .agents/skills/
```

---

## 3. Staged Release Architecture

ClipKit skill capabilities are organized into three progressive tiers:

| Tier | Capabilities | Included Tooling & References |
|---|---|---|
| **v0** (Baseline) | Pure headless authoring & export | `clipkit validate`, `clipkit export`, `dsl.md`, `channels.md`, `rules.md` |
| **v1** (Perception) | Visual feedback & domain guidance | `clipkit check`, `clipkit sheet`, per-part references (`face.md`, `hands.md`, `locomotion.md`, `combat.md`, `animation-principles.md`) |
| **v2** (Composition) | Comparison, variants & layer flattening | `clipkit compare`, `clipkit version`, `clipkit compose`, deterministic edit operations (`mirror`, `retime`, `scale-amplitude`, `close-loop`) |

---

## 4. Autonomous Agent Workflow Rules

When modifying or generating humanoid motion, agents must adhere to the 5 Core Principles in `SKILL.md`:

1. **One Body Part Per Task**: Modify only the active subsystem (`legs`, `torso`, `arms`, `hands`, `face`) to avoid global motion regression.
2. **One Variant Per Request**: Branch new child versions (`clipkit version`) for different stylistic variations without mutating parents.
3. **Inspect and Validate Every Iteration**: Execute validation and inspect the contact sheet (`clipkit check --sheet`) after every edit.
4. **Never Overwrite Parent Versions**: Treat existing versioned clips as immutable assets.
5. **Compose Last**: Build modular layers or pick from `poses/`, then flatten via `clipkit compose`.

---

## 5. Building & Packaging

To recompile the standalone CLI script, regenerate references from source data, and package `clipkit.skill`:

```bash
npm run build:skill
```

This updates:
- `skills/clipkit/scripts/clipkit.mjs` (Vite SSR production bundle)
- `skills/clipkit/references/channels.md` (from `src/data/rigs/motus.json` and `src/data/parts.json`)
- `skills/clipkit/references/rules.md` (from `src/data/limits.json` and validation rule registry)
- `skills/clipkit.skill` (zip distribution archive)

To verify the skill evaluations:

```bash
npx vitest run skills/clipkit/evals/evals.test.js
```
