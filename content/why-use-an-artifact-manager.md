---
title: "why use an artifact manager? (butterflies, drifts and entropy)"
date: 2026-01-16
category: technical
description: "Why builds aren't deterministic, why git checkout isn't a rollback, and why you need a vault for your frozen realities."
---
![header](images/why-use-an-artifact-manager/Screenshot%202026-06-18%20at%2010.47.21.png)

for managing the artifacts of course. why? so we can choose which version of the app runs in a specific environment. why? because the most recent build is not always the correct one and we need ability to enable instant rollbacks...

but if i need to rollback, i have git! i'll just `git checkout v1`...so why at all? this argument assumes that if you have the same source code, you will get the same binary. but builds are *rarely* deterministic. its hard to say that new binaries created from the same files would be the exact same as the previous ones.

for our applications we rarely write all the code. 90% is imported from libraries and then, from a very high-level the culprit for all the "vodoodududu bad stuff" turns out to be SemVer ranges (semantic versioning).

when you write `"express": "^4.17.0"` in `package.json`, the caret (`^`) tells the package manager: "Install the *latest* version that is compatible with `4.17.0`." it installs `4.17.1`. the next day maintainer publishes `4.17.2`. you run npm install and grab `4.17.2`. so even if you didn't change *your* code, the *inputs* to the compiler have changed.

then we have this `butterfly effect` in the builds. you depend on lib A, lib A depends on lib B. even if you "pin" lib A to an exact version, lib A might have defined B with a floating range (`^`). this tiny change deep down the layers can break your cute application.

builds need to be ***hermetic*** (if a build is hermetic it is reproducible) and ci/cd pipelines are not. ideally they should be but everything in this world is so tightly deeply coupled that its hard to isolate the entities. the internet is a high-entropy environment and the whole process of software building is chaotic. a particular build relies on the state of the internet at a particular moment and the state is ever-changing. hence we cannot rely on recreation (hoping the build works again); we must rely on preservation (saving those that worked).

artifact manager is a store of the things. 'things' include binaries, libraries, container images, config files, packages etc. to understand the artifact manager, one must internalize the difference b/w **source code** and an **artifact**.

**intent vs reality**

- source code **(Mutable)**: it lies within the app layer and its an *abstract intent*. its a request. it describes the logic but cannot execute it. it is dependent on 'when' and 'where' it's built.
- the artifact **(Immutable)**: a concrete reality. an output of the whole process of *building* which 'collapses' the infinite possibilities of the internet (dependencies, base images, networking) into a single, immutable reality.

the goal is to achieve ***idempotency*** i.e "applying same operation multiple times produces the same result". but it's hard. because `f(x)` in software is actually `f(Code, Config, Time)`.

- code is frozen (artifact)
- config is fluid (env variables)
- time is chaotic (external apis changing, unreliable networks etc....) to achieve idempotency, we have to freeze ALL variables.

and an Artifact Manager is one of the small solutions to manage the "code" part of our `f(x)`. it is a vault where we keep these frozen realities.

a good artifact manager consists of two distinct parts: the **registry** and the **manager**. we store artifacts in a *registry*, which is an object storage and holds all the heavy binaries. but the registry cannot work alone. it needs a manger. registry is an idiot. its a trash dump and needs the manager which helps the rag-pickers (you ofc) to look up for gold in the trash. it holds the metadata and context so it can answer questions like:

"who threw this trash here at what time?" "where is the trash sitting currently?" "which piece of trash caused the fire?" etc.

the registry is the physical storage layer that creates a *content addressable system* (stuff is retrieved via its content rather than the location) where a binary blob is retrieved via a unique identifier. it focuses on **availabilty**. the manger is the control plane - the database and api layer. it focuses on **governance** and **provenance**.

The 4 main reasons for having an artifact manager:

1. ***Reproducibilty*** (the "what") put simply, it means deploying the exact same binary multiple times. ensuring that the bitwise stream deployed to server A is identical to server B, eliminating the *Heisenbugs* (bugs that appear on one env but not on another due to slight binary difference)

2. ***Traceability*** (the "who") to know the complete lifecycle of an artifact. to record detailed history and origin of artifacts, their transformations, dependencies and build environments.

3. ***Observability*** (the "when") we would like to have detailed logs of the history of operations to determine what went wrong, when and where. to have an immutable log of state changes.

4. ***Recovery*** when something goes wrong and we would like to switch to prev versions, having an artifact manager gives us the ability to do instant rollbacks (because rebuilding takes time and well, due to other reasons we discussed above...)

Now that we have established the need to freeze the code into an artifact, question arises - *is freezing the code enough?*

while thinking about the first point - **reproducibility** - there should be a doubt that, let's say, if we deploy artifact A (immutable code) to a server, does it behave the exact same way every time? the initial assumption, probably, would be yes because the binaries are identical. and here's where we encounter something called ***configuration drift***.

every application needs some configs to run. if we use our artifact manager to rollback the code from `v2 -> v1` and do not rollback the configs, its essentially running the old code with new settings. so does that mean we should also have a store of configs in our artifact manager? if yes, why? and if no, why not?

before getting answer to the question, you should know about the **Separation Principle**. as given in "The Twelve-Factor App Methodology":

`Apps sometimes store config as constants in the code. This is a violation of twelve-factor, which requires strict separation of config from code. Config varies substantially across deploys, code does not.`

So why separate them? code lives forever in artifact manager but the api keys will expire. there's this practise of rotating your secrets routinely over a specified time period, xyz months, to avoid leaks. if we bake configuration into artifacts, a compromised db password would mean we have to rebuild and deploy the entire app once again.

but then if we separate them, how do we ensure they match? take a scenario where:

- v1 code needs 2 env variables
- v2 code needs 5 env variables

if we update code to v2 but forget to update the config (which still has 2 vars), v2 will crash immediately. though for the rollback (the happy accident), if we are on v2 (5 vars in config) and rollback code to v1, it will simply ignore the other 3.

so we can conclude that the code is usually "forward compatible" (it ignores what it doesn't need, in this case the extra config). but config is rarely "backward compatible" with new code (missing vars will cause crashes).

*how do we fix this crash?*

we clearly can't store the config in the artifact manager (security and rotation), where does it go? **the Vault (secrets manager).** we store these values in a specialised, secure storage system called Secrets Manager or a Vault. so the artifcat manager is kind of "public-ish" and the secrets manager is "private".

to fix the crash, we stop treating the artifacts and configs as two separate things. you don't "deploy code" and then "update config". you create a *Release*. a "release" is a single locked object that contains both, eg. `(Artifact:sha-123 + Config:v1)`

when you deploy, you deploy the release. when you rollback, you rollback to a release. the system will automatically restore the artifacts and modify the configs accordingly.

.

.

.

.

all of these big ass concepts just to move a simple stupid file from point A to point B. so much of cognitive overload. is this mentally stimulating? yes. do i enjoy it? very much so. but the ultimate goal as always is, to make it absolutely boring for myself. and till that happens, we ball.

thanks for reading ^^
