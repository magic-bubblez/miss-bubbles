---
title: "on LSP: how X × Y became X + Y"
date: 2026-07-09
category: technical
description: "How Language Servers untangled the m-to-n editor problem."
---
![alt text](<images/on-lsp/wizard.webp>)

any good code editor contains a lot of magical packs that can assist a developer in writing code. creating these magical packs mean they should be infused with complete understanding of the programming languages they support. 

say, there are X number of programming languages(magical packs) and Y number of good code editors. you want to add the magical features of pack x1 to all the Y editors. 

however, each one of those editor is built differently. they come in distinct shapes and all of them need special requests in their own dialects to perform the pack x1 magic, which means, pack x1 needs to re-wire its request Y times. how tedious. 

but this tedious job was done by the creators of magical packs for years because nobody had invented a proper solution to something that looks so obvious. every pack was made to learn the dialects of Y number of editors out there, by our brilliant sorcerers - such a waste of time and talent! 

and then finally someone asked: what if the packs didn't speak any dialect at all? 
by definition they should not. a magical pack should only do what it's supposed to do - perform magic. that's all. anything more than that is a violation of its boundary and overreach - overreach is exactly how systems rot. 

this is an old idea. older than code editors, older than softwares even - a well designed component should have exactly one reason to exist in a system, any responsibility bolted onto it beyond that reason is a debt the system as a whole will have to pay. 

here, 2 things were coupled that had no business being coupled - the understanding of a language (grammar, structure, meaning) AND knowing how to speak that language (interface). different jobs, but the same pack was made to carry both. 

so the fix was to untangle them both - teach all the editors a common protocol and let every magical pack become a **Language Server**. now the server only has one responsibility i.e to understand the language. the editor has one responsibility i.e to speak the protocol.

the protocol is ordinary. it simply standardizes the shape of communication b/w language server and editor. every interaction is a **JSON-RPC** message with a well-defined schema, sent over stdin/stdout or socket. once an editor knows how to serialise and deserialise these messages, it can communicate with anything implementing the protocol. 

so whatever you do in your workspace, however it may evolve - the editor continuously streams changes to the language server and the server keeps updating its internal representation of the workspace. that's how one able to experience all those magical features of a pack inside the editor. 

alright then, what lesson do we draw from here? 
<br>.<br>
.<br>
.<br>
<span style="font-style: italic; font-weight: bold;">stop trying to understand everyone’s internals and just build a clean way to communicate.</span>
