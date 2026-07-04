---
title: "why reason doesn't converge?"
date: 2026-06-26
category: essays
description: "why reason doesn't converge"
---
![header](images/why-reason-doesnt-converge/header.webp)

in an unbiased system there exists a tree of reason. start at any node and if one reasons enough they're bound to reach the same conclusion others did before them.

following this, democracy is the worst form of government. it allows uneducated people to elect the ones into the position of power. communism is not the best either because if the elected person becomes corrupt, greedy, debauched there's no way to remove them from power. which is the best way of government? even if people remain completely unbiased in their reasoning their conclusions are not converging, why? is the above statement not true? 

above statement is true but there is a missing point -- the starting root of everybody must be same. it is not. what they hold are the beliefs and people have different beliefs. beliefs are axioms, the difference being beliefs are subjective convictions about reality and axioms are fixed parameters for thought experiment. 

for the sake of this thought experiment let's say beliefs are axioms and everybody got different axioms. what happens when you start questioning every axiom, every justification, every starting point, you land in one of those:

- ***infinite regress*** - every justification requires a further justification. forever. "why is liberty good?" "because people don't wanna suffer" "why don't people want to suffer?" "because -" -- it will continue on and on. 

- ***circular reasoning*** - the chain loops back. "liberty is good because it allows human to flourish" "flourishing is good because it will allow human advancement" "advancement is good because it allows humans to flourish......"

- ***you reach a bedrock***. you stop at something that can not be further justified. it's not a conclusion. those are your values and it's a fact about you. 

bedrock is the foundation. people think they got wildly different values - strip down the factual disagreements, culture framings, different phrases for the same thing -- the number of bedrock values are quite few. most humans don't want to suffer, want their own to thrive, want some degree of freedom and agency over their lives. so where do the divergence come from? it lives in the intermediate layers. not the root. 

to visualise it more, back to the original statement - imagine a tree of reason, root is the human's primitive nature. cannot be changed. what shapes the other branches in wildly different directions are the environments. but what shaped the environment? other humans, previous generations. their branches shaped the environment that shapes your branches. It's recursive, but that recursion has inputs beyond the human nature. geography, climate, scarcity, abundance, contact with other groups, accidents in history. 

can we represent it formally? not possible really, but a pseudo-formal way would be: 

```
let, 
    N = human nature(not variable, shared root)
    E(t) = environment at time t
    B(n, t) = branches(beliefs, values of n humans at time t)
    
therefore, 
     B(n, t) = f(N, E(t), experience(n))
where, 
    E(t) = g(N, E(t-1), material_conditions(t), B(n, t-1))
```

reasons do not converge in a system that is informal. however in formal systems that are completely governed by a set structure and rules without any understanding or intent, where axioms are explicit - reasons do converge.
