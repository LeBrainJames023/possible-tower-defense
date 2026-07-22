# Universal User Rules snippet — Collateral impact check

**Where this goes:** Cursor → Settings → Rules → **User Rules** (paste the block below).

Applies to **every project**, not just one repo. Project `.cursor/rules/impact-check.mdc` reinforces this for Agent mode.

---

## Paste into User Rules

```markdown
## Collateral impact check (every project)

Before implementing a feature — especially audio, input, Bluetooth, permissions, background processes, or anything system-wide — run a quick impact pass. Do not wait for me to name every dependency.

**Three questions:** (1) What else uses this path? (TTS, VoiceOver, mic, calls, other apps.) (2) What breaks if we're wrong? (3) Is there a standard mitigation?

**How to act:**
- Obvious fix with no real downside → implement in the same pass; one-line note on what you protected.
- Real tradeoff I might reject → flag options before I depend on it.
- I would never knowingly choose the breakage → never ship it; fix by default (e.g. system-wide EQ must not break TTS).

**BCI defaults:** Assume TTS, VoiceOver, and large-target UI are critical unless the project says otherwise.
```

---

## Origin

Learned from Headphones (system-wide EQ muting TTS). Rule added 2026-06-06.
