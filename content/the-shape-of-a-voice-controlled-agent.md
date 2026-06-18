---
title: "The Shape of a Voice Controlled Agent"
date: 2026-04-19
category: technical
description: "Designing a local-first voice agent -- STT, intent classification, orchestration, and why LLMs alone can't reliably control systems."
---
![header](images/the-shape-of-a-voice-controlled-agent/Screenshot-2026-04-18-at-18-06-27.webp)

> {*on medium (just in case): [link](https://medium.com/p/7b32723a8639)*}

A voice controlled agent is a piece of software that sits on your machine, listens to what you say and does things in response. "local" gets used to mean three different things - runs on your machine, is private from third parties, does not require the internet.

At a structural level, it is a five-stage unidirectional pipeline.

1. Audio Input: Raw bytes captured
2. STT (Speech-to-Text): A pure function mapping bytes to a string
3. Intent Classifier: A compressor mapping infinite natural language to a structured JSON plan
4. Orchestrator: A control layer that validates the structured plan and resolves it into specific execution paths.
5. Handlers: The execution layer sitting under the authority of Orchestrator and directly interacts with state of the machine -- *how* something is to be executed.

> To have a look inside the code and know how it works, how it has been implemented, go through the README of the repo [here](https://github.com/magic-bubblez/local-voice-controlled-agent).
> the upcoming sections of the blog do not focus on the implementation part but the designing and architecture.

## The boundary of Intent

Intent classifier is the 3rd layer of system which is responsible for taking in the raw string input from a Speech-to-Text model and using language models to identify the intent of the user. Even after the intent gets well understood, how to make sure the actions to be executed gets mapped accordingly?

LLMs are probabilistic. They give us the language understanding that cannot be programmed by hand. However give them entire control of the systems and it will fail majority of the times in ways that cannot be predicted. Mathematically even though they choose the most *probable* option out of an infinite possibilities, but "probably" in itself is still unreliable.

The only way to make an LLM reliable is to put a **deterministic layer** above it. Because language is an infinite space, to collapse that infinite input into a finite, executable output, we need a structured schema.

We achieve this by managing the context:

`LLMContext = {System Instructions} + {Tool Metadata} + {User Transcript}`

By injecting the metadata of our available tools into the LLM's memory before every call, we force it to speak the language of our defined contract. Here's a flow:

- user speaks -> Speech-to-Text
- Intent Classifier -> JSON Plan (The LLM maps "make a folder for my cat pics" to `{"action": "create_dir", "name": "cats"}`).

---

## The Separation of Concerns: "What" vs. "How"

In a well-designed system, no single component should know too much. Otherwise we get a "leaky abstraction" -- the logic of one layer starts spilling into another, making the whole thing fragile and hard to reason about.

We maintain this boundary through a distinction between the **Orchestrator** (Layer IV) and the **Handlers** (Layer V).

Think of the Orchestrator as the **Authority**. Its only job is to decide *what* should happen. It looks at the JSON plan, validates the schema, and checks its registry. It got brains but no hands. Its pure logic and cannot do anything alone without an implementer.

The Handlers are the **Mechanism**. They are the "hands" of the system. A handler is a small function that executes the commands as directed by the orchestrator. It doesn't ask question, simply interacts with the machine's state and reports back.

#### Why go through this trouble?

Why can't a single layer do both jobs? If we can combine two things into one, that should be a good thing, right?

wrong. Iff the orchestrator starts doing the work itself, the system becomes a tangled mess. we won't be able to test the "brain" of our agent without changing the state of our machine everytime. There's a reason every stage in the pipeline is bounded by a contract; isolation is necessary if we want our systems to be hermetic. It allows the systems to be predictable.

---

## The Registry Pattern

Now we know that orchestrator validates the json plan and call the handlers accordingly. But then how does the orchestrator know which handlers exist and when to call the right one? For this, we use a *Registry*.

The Registry is essentially a dictionary that maps **Intent** to **Implementation**.

When the system starts, every handler "registers" itself. The Orchestrator maintains this list as a single source of truth. When a JSON plan comes in with an action like, for example - `"screenshot"`, the Orchestrator looks it up in the registry:

1. **Does "screenshot" exist?** (Validation)
2. **What function handles it?** (Resolution)
3. **Does the input match the required params?** (Contract checking)

The registry makes the system **extensible**. If I want the agent to do another action on my device, I don't have to rewrite the core engine. I just write a new handler and add one line to the registry.

The registry is an "idiot" in the best way, it's just a lookup table.

---

### Why build this way?

When you start designing a system, it's easy to start at the surface and ask "how?" too quickly. That's how you end up in a rabbit hole. You start at Layer 1, list a few problems, and suddenly fifty other questions emerge before you've even drawn a box.

The discipline of system design is **staying at one level of abstraction at a time.** I've learned that grouping similar ideas and labeling them under one "box" and deferring it for later is much better. By defining clear criteria and building solutions around them layer by layer, one can see the whole shape of the system without getting lost in the noise.

goal is to make a system *boring*. if its boring, it means the design is finally working.

and until it's so perfect that I have nothing left to tweak...we ball :D

thanks for reading ^^
