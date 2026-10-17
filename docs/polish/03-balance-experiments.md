# Measured final-chain tuning proposal

Recommendation: change only Titã's `atk: 36` to `atk: 32` in `src/data/enemies.js`. Leave HP2400, MAG28, DEF24, shield8, skills, ATB, all global difficulty factors, Varek, MP and ECO unchanged. This is the smallest scope (one numeric field) among measured candidates meeting both requested bands. Two less aggressive percentage changes (HP2250 +ATK35) also meet the sample target, but alter two combat dimensions.

Portable proposed repository tool: `/workspace/scratch/balance-sim.mjs`, intended destination `tools/balance-sim.mjs`. Default repository root resolves from the script location; no absolute workspace paths in the script. `AURORA_ROOT` optionally overrides it. Source SHA256 values, seed, sample count and configuration are embedded in output. Numeric experiment overrides operate on the loaded source string only. No repository file has been modified.

## Main comparison

Each cell is 300 seeded complete Varek→Titã chains. Initial party L7+150 EXP each; actual Varek rewards can level survivors to8 (KO heroes gain half); chest weapons/armor and guaranteed brooch equipped; no optional bonds; six potions/two ethers/two phoenix feathers at Varek start; full HP/MP before Varek. HP/MP/status/inventory carry into Titã. Actual Battle logic and actual GameState are reused. No forced recovery between bosses.

| Policy / Titã ATK | Calma losses | Normal losses | Desafio losses |
|---|---:|---:|---:|
| Weakness-aware, 36 baseline | 0/300 (0%) | 13/300 (4.33%) | 136/300 (45.33%) |
| Weakness-aware, 32 proposed | 0/300 (0%) | 4/300 (1.33%) | 77/300 (25.67%) |
| First offensive skill, 32 proposed | 0/300 (0%) | 17/300 (5.67%) | 201/300 (67%) |

The comparison policy retains the exact same healing/items/ECO/Aurora rules and immediate command timing, but chooses the first learned affordable offensive skill rather than ranking damage with elemental/type weakness. It still accidentally hits weaknesses through Sena's light and resonance; it is accurately described as “no adaptive weakness selection,” not zero weakness damage. All Varek fights were won in these runs. Failure counts therefore specifically reflect the Titã phase.

Desafio's weak-aware proposed fights average13.68 weakness hits and1.58 breaks; the comparison policy averages4.20 and0.84. Weakness-aware Normal received damage falls666.79→548.49; potions3.01→2.44 in Titã. Desafio remains materially harder, requiring4.65 potions and1 Ether in Titã on average; chain potions5.27/6. Failure samples do not consume all remaining resources efficiently, which is a limitation of the heuristic. These outcomes are model-specific sample measurements, not guarantees for human players.

## Candidate sweep

All used the same300 seeds and realistic chest/no-bonds chain:

| Loaded Titã changes | Normal defeat | Desafio defeat |
|---|---:|---:|
| HP2300 | 3.33% | 40.33% |
| HP2250 | 2% | 38.33% |
| HP2200 | 1.67% | 35.33% |
| ATK35, HP2300 | 2.67% | 27.67% |
| ATK35, HP2250 | 2% | 26.67% |
| ATK34 | 2.67% | 30.33% |
| ATK34, HP2350 | 2.67% | 28.67% |
| ATK34, HP2300 | 2.67% | 25.33% |
| ATK34, MAG27 | 2.33% | 29.67% |
| ATK33 | 2.67% | 27% |
| ATK32 | 1.33% | 25.67% |
| MAG26 | 3.33% | 42% |

## ECO and MP checks

The proposed change touches neither system. Across6 fortress encounter formations ×300 seeds ×3 difficulties (5400 independent healed fights), Normal had zero resonances in every formation; final ECO means40.85–51.46, starting at30. Thus ECO is not available in every normal encounter. Shorter fortress encounters expend12.45–16.33 total MP across the party per encounter, with113.67–117.55 MP remaining from130. Attrition across multiple encounters is not represented by these independent healed samples.

In the proposed full chain, mean MP spent is112.81 Calma /129.88 Normal /148.96 Desafio; Titã-only mean77.13 Normal /85.03 Desafio. Mean MP left after Titã32.81 Normal /27.92 Desafio, supported by0.43/1.00 Ether used during that phase. The unchanged spell costs, replenishment and physical fallback remain consequential. Fortress crystals and the inn offer recovery; an MP economy review should consider that routing rather than reduce spell costs based on independent fights.

## Artifacts and reproduction

`final-baseline.json`, `final-atk32.json`, `final-atk32_naive.json`, and `final-regulars.json` are in `/workspace/scratch`, generated with the portable tool and source hashes. Earlier candidate files are `tune-*.json`.

When copied into repository `tools/`:

```sh
N=300 ONLY=tita LEVEL=7 START_EXP=150 CHAIN=1 GEAR=chests node tools/balance-sim.mjs > before.json
N=300 ONLY=tita LEVEL=7 START_EXP=150 CHAIN=1 GEAR=chests TITA_ATK=32 node tools/balance-sim.mjs > after.json
N=300 ONLY=tita LEVEL=7 START_EXP=150 CHAIN=1 GEAR=chests TITA_ATK=32 NAIVE=1 node tools/balance-sim.mjs > naive.json
N=300 ONLY=forte GEAR=chests node tools/balance-sim.mjs > regulars.json
```

While the script remains in scratch, prefix commands with `AURORA_ROOT=/workspace/aurora-repo` and use `/workspace/scratch/balance-sim.mjs`. After applying actual gameplay changes omit override variables to measure the real updated source. The harness stubs renderer/audio/timers/animation waits, reproduces combatant construction, and runs actual ATB update at60Hz; activeSeconds excludes presentation and command selection time. It does not claim browser parity. See initial `balance-notes.md` for progression/economy details and other assumptions.
