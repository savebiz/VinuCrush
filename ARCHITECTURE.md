# VinuCrush: A Year-Long Procedural Match-3 Game

**Core Philosophy:** Infinite levels via procedural generation, validated by AI solvers, with state saved on VinuChain.

## 1. Tech Stack

*   **Framework:** Next.js 14 (App Router), TypeScript.
*   **State:** React Hooks (UI) + ECS Pattern (Game Logic).
*   **Web3:** Thirdweb SDK v5 (connected to VinuChain Mainnet, ChainID 207).
*   **Styling:** TailwindCSS + Framer Motion.

## 2. The Game Engine (ECS Pattern)

**NO CLASSES.** Use `Uint8Array` for the grid to prevent garbage collection stutter.

*   **Grid State:** A flat array of size 81 (9x9). Index `i = y * 9 + x`.
*   **Entities:** Tiles are just indices in the array.
*   **Components:**
    *   `Type`: `Uint8Array` (values 0-5 for colors).
    *   `Status`: `Uint8Array` (Bitmask: 1=Match, 2=Falling, 4=Ice).

## 3. Procedural Content Generation (PCG)

*   **Algorithm:** 'Reverse-Play Constructive Solver'.
    1.  Start with an empty board.
    2.  Insert a 'Match-3' pattern.
    3.  Perform a valid 'Reverse Move' (pulling a piece out) to break the match.
    4.  Repeat until board is full. This guarantees the level is solvable.
*   **Difficulty Curve:** Sawtooth Wave. `TargetDifficulty = Base + (Level % 20) * Step`.

## 4. Data Persistence (The Feeless Layer)

*   **Local:** Save full move history to IndexedDB.
*   **Remote:** Every 5 levels, hash the history (Merkle Root) and submit to VinuChain.
*   **Contract:** A simple 'ScoreKeeper' contract on VinuChain.

## 5. Folder Structure

*   `/lib/ecs/`: Core engine logic (arrays, systems).
*   `/lib/pcg/`: Generator algorithms.
*   `/components/game/`: React view layer (Canvas/Divs).
*   `/contracts/`: Solidity interfaces.
