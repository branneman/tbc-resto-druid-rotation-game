# WoW TBC Resto Druid Rotation Game

https://branneman.github.io/tbc-resto-druid-rotation-game/

## What is this?

This is a browser-based trainer for Restoration Druid healers in The Burning Crusade. As a Resto Druid, your healing output depends not just on gear, it depends on how precisely you sequence your spells, in real time, under raid pressure.

The core challenge: keep a 3-stack Lifebloom active on one or more tanks at all times, while filling every remaining GCD with other heals. This tool lets you build that muscle memory in a low-stakes environment, so your fingers know the rotation before the raid depends on it.

## Optimal rotation

The cornerstone of TBC Resto Druid play is the **4GCD Cycle**: a repeating sequence of 4 spells that fits within Lifebloom's 7-second window. Before Lifebloom expires you must refresh it to keep the 3-stack, everything else slots around that constraint.

Instant-cast spells (Rejuvenation, Swiftmend, Nature's Swiftness + Regrowth, etc.) each take 1.5s. Regrowth takes 2s. How many Lifeblooms you maintain determines how many GCDs remain for other healing.

| # LB3 | GCD 1     | GCD 2        | GCD 3        | GCD 4        | time |
| ----- | --------- | ------------ | ------------ | ------------ | ---- |
| 1     | Lifebloom | Instant Cast | Instant Cast | Instant Cast | 6    |
| 1     | Lifebloom | Regrowth     | Instant Cast | Instant Cast | 6.5  |
| 1     | Lifebloom | Regrowth     | Regrowth     | Instant Cast | 7 ⚠️ |
| 2     | Lifebloom | Lifebloom    | Instant Cast | Instant Cast | 6    |
| 2     | Lifebloom | Lifebloom    | Regrowth     | Instant Cast | 6.5  |
| 2     | Lifebloom | Lifebloom    | Regrowth     | Regrowth     | 7 ⚠️ |
| 3     | Lifebloom | Lifebloom    | Lifebloom    | Instant Cast | 6    |
| 3     | Lifebloom | Lifebloom    | Lifebloom    | Regrowth     | 6.5  |

⚠️ In the case of 1 LB3 and 2 LB3 theoretically you could cast Regrowth twice while still having room for two instant casts and end up at exactly 7 seconds. But in practice this is hard to keep up because you'll need to utilise spell-queueing 100% correctly, no room for error. So this is a risky option, and it's probably not worth it to take the risk of letting Lifebloom finish and bloom. So those two "double-regrowth" options are not preferred.
