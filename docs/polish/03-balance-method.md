# Battle measurement preparation (read-only)

Harness: `/workspace/scratch/balance-probe.mjs`. No gameplay/repo edits. It evaluates actual Battle.js and resonance.js after injecting imports and presentation stubs, imports actual GameState/data, and reuses actual update (60Hz), ATB, status/buff turns, enemy AI, execute, damage, weakness, shields, duals, items, and resonance execution. Browser-only combatant construction is reproduced without WebGL. Seeded LCG; seed 12345 + replicate * 7919; 300 replicates per scenario/difficulty. All 26 encounters × 3 difficulties = 23,400 fights in balance-results.json; sensitivity runs add 900 each.

Interpretation limits: activeSeconds excludes meaningful animation/command/intro/result time and is not play duration. Presentation RNG is stubbed, so identical seeds do not reproduce browser RNG streams. Heuristic player chooses immediately, weakness-aware damage, Sena cure under 62% HP, potion under 35%, Phoenix for KO, Ether for low-MP healer; situational Aurora only, no deliberate dual timing. Base runs begin full HP/MP with starter equipment, story sword after ECO, six potions, two ethers and two feathers. This fixed inventory is not an economy/attrition simulation. Models do not claim browser parity or tune targets. Chain runs carry Varek resources, actual EXP and KO half-EXP; include Varek failures in total chain failure. ECO correctly resets per battle. Gear/bond runs are optimistic exploration cases; all-bonds assumes every camp scene flag, regardless of route. Parent should not compare active time directly to wall-clock time.

Exact one-clear normal rewards establish a plausible story envelope (all static groups, no respawns; forest cap2 e8 excluded; Brann joining after cave group accounting is conservative): forest 124 EXP, dog +120, raid +44, cave +326, Golem +420, fort +508, Varek +600. Lio before dog L2+81; after dog L3+119; before Golem L5; after Golem L6; before Varek L7+259 (others ~L7+139–178); after Varek L8. Missing optional encounters can lower these significantly. Join uses rounded current party average, not fixed levels. EXP is awarded in full to each living party member, half to KO heroes. Difficulty reward factor 0.9/1/1.25 also changes progression, so fixed-level comparisons isolate combat, not campaign difficulty.

Shop/economy: start gold 60 and 3 potions. Every first-pass encounter + boss through Varek yields 1777 gold; map cash chests add 80+220. Potions cost30, Ether150, Phoenix220. Camp armor420 and magic cloak280 compete with consumables; a 20-gold inn fully restores, crystals restore free repeatedly. Camp shop lacks upgraded caster/Brann weapons, but these are exploration rewards: cave c2 lunar staff, fort c1 war lance, fort c3 silver astrolabe, fort c4 steel mail; Golem guarantees star brooch. Story sword auto-equips when granted. No heal occurs between Varek and Titã. Optional bonds grant 4% maxHP per linked scene (12% max), and +25% dual power per pair rank; dual partner must be ≥75 ATB or waiting, both pay MP and consume turns. ECO unlocks only after Golem.

Normal baseline means: dog L3 ~15.12 active s /88.74 received damage /0.32 potions; Golem L5 ~15.04s /281.99 /1.36; Varek L7 ~10.13s /126.82 /0.96; fresh Titã L8 ~23.53s /749.64 /~4 potions. Raw durations mostly explain relative workload, not presentation pacing. Most healed regular encounters end before a second enemy action; story attrition and exploration remain necessary to assess.

Titã chain sensitivity (300 chains per difficulty; all start L7+150 EXP before Varek):

| Equipment/bonds | Calma chain defeat | Normal | Desafio |
|---|---:|---:|---:|
| Starter except story sword | 0.33% | 10.67% | 88% |
| Available chest equipment + brooch | 0% | 4.33% | 45.33% |
| Chest equipment + all bonds | 0% | 0.67% | 23% |

This supports preserving meaningful exploration rewards, explaining bonds/gear, and targeted difficulty review of the final chain rather than an across-the-board damage reduction. A level sensitivity with zero starting EXP deliberately does not level up after normal Varek and loses 56.33%; that is a stress case, not the expected all-clear route.

Reproduction from any directory:

```sh
N=300 node /workspace/scratch/balance-probe.mjs > /workspace/scratch/balance-results.json
N=300 ONLY=tita LEVEL=7 CHAIN=1 START_EXP=150 node /workspace/scratch/balance-probe.mjs > /workspace/scratch/tita-story-chain-results.json
N=300 ONLY=tita LEVEL=7 CHAIN=1 START_EXP=150 GEAR=chests node /workspace/scratch/balance-probe.mjs > /workspace/scratch/tita-chests-chain-results.json
N=300 ONLY=tita LEVEL=7 CHAIN=1 START_EXP=150 GEAR=chests BONDS=1 node /workspace/scratch/balance-probe.mjs > /workspace/scratch/tita-chests-bonds-chain-results.json
```

`AURORA_ROOT` can point to a separate repository snapshot. Repeat against final implementation for post-change comparison. Artifacts read actual source at invocation; they do not freeze the source revision.
