# Lumi MAX ULTRA

MAX ULTRA adds a hybrid local/online brain layer to the MAX v4 companion.

## Offline layer
- Local vocabulary lexicon (`public/offline_vocabulary.json`)
- Common greetings and conversation fallbacks
- Simple arithmetic
- Built-in definition lookups for common technical/general terms
- Local browser settings, history and memory continue to work without internet

## Expression layer
- Happy, excited, curious, thinking, surprised, confused, gentle, calm, listening and talking states
- Expression badge and manual expression controls
- Character-stage animation/filter layer

## Online layer
When `OPENAI_API_KEY` is configured, the Responses API remains the general-purpose brain for broad questions. If the endpoint cannot be reached, the UI falls back to the local brain.

The offline vocabulary is a word lexicon, not a complete offline LLM. A full general-purpose offline LLM would require bundling a separate model and its runtime, which is substantially larger.
