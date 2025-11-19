# VinuCrush 🎮

A year-long procedural Match-3 game powered by VinuChain blockchain. Infinite levels generated using AI-validated algorithms with state saved on-chain.

## 🚀 Features

- **Infinite Procedural Levels**: Every level is uniquely generated using the Reverse-Play Constructive Solver algorithm
- **Guaranteed Solvable**: All levels are validated to ensure they have valid moves
- **Sawtooth Difficulty Curve**: Progressive difficulty that cycles every 20 levels
- **VinuChain Integration**: Game progress saved on VinuChain (ChainID 207) using feeless transactions
- **Premium UI**: Beautiful dark theme with Framer Motion animations
- **ECS Architecture**: High-performance game engine using Uint8Array for zero GC stutter

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Framer Motion
- **Web3**: Thirdweb SDK v5
- **Blockchain**: VinuChain Mainnet (ChainID 207)
- **Storage**: IndexedDB (local) + Smart Contract (on-chain)

## 📁 Project Structure

```
/lib/ecs/          # Entity Component System (game engine)
  ├── grid.ts      # Uint8Array grid state management
  ├── match.ts     # Match detection algorithms
  └── gravity.ts   # Tile physics and refilling

/lib/pcg/          # Procedural Content Generation
  └── generator.ts # Level generation algorithms

/lib/web3/         # Blockchain integration
  ├── chain.ts     # VinuChain configuration
  └── client.ts    # Thirdweb client setup

/lib/storage/      # Data persistence
  ├── indexeddb.ts # Local storage wrapper
  └── merkle.ts    # Move history hashing

/components/game/  # React UI components
  ├── Tile.tsx     # Individual tile component
  └── GameBoard.tsx # Main game board

/contracts/        # Smart contracts
  ├── IScoreKeeper.sol      # Solidity interface
  └── scorekeeper-abi.ts    # TypeScript ABI
```

## 🎯 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Thirdweb client ID (get one at [thirdweb.com/dashboard](https://thirdweb.com/dashboard))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp env.example .env.local
   ```

4. Add your Thirdweb client ID to `.env.local`:
   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
   ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Building for Production

```bash
npm run build
npm start
```

## 🎮 How to Play

1. **Match Tiles**: Click on a tile, then click an adjacent tile to swap them
2. **Create Matches**: Match 3 or more tiles of the same color horizontally or vertically
3. **Chain Reactions**: Tiles fall and refill automatically, creating cascading matches
4. **Progress**: Complete levels to unlock higher difficulties
5. **Blockchain**: Every 5 levels, your progress is saved to VinuChain

## 🏗️ Architecture Highlights

### ECS Pattern (No Classes!)
- Uses `Uint8Array` for grid storage to prevent garbage collection stutter
- Flat array indexing: `index = y * 9 + x`
- Bitmask status flags for tile states

### Procedural Generation
- **Reverse-Play Constructive Solver**: Guarantees solvable levels
- **Seeded RNG**: Same level number always generates the same board
- **Difficulty Curve**: `TargetDifficulty = Base + (Level % 20) * Step`

### Data Persistence
- **Local**: Full move history stored in IndexedDB
- **Remote**: Merkle root hash submitted to VinuChain every 5 levels
- **Feeless**: Leverages VinuChain's feeless transaction layer

## 📝 Smart Contract

The `ScoreKeeper` contract on VinuChain stores:
- Player addresses
- Level numbers
- Move history hashes (Merkle roots)
- Highest completed levels

Contract address: *To be deployed*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or building your own games!

## 🔗 Links

- [VinuChain](https://vitainu.org/)
- [Thirdweb](https://thirdweb.com/)
- [Next.js](https://nextjs.org/)

---

Built with ❤️ using Next.js, TypeScript, and VinuChain
