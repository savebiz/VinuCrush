// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * ScoreKeeper Contract Interface
 * Simple contract for storing game progress hashes on VinuChain
 */
interface IScoreKeeper {
    /**
     * Submit a score hash for a player
     * @param level The level number
     * @param scoreHash The Merkle root hash of the move history
     */
    function submitScore(uint256 level, bytes32 scoreHash) external;

    /**
     * Get the score hash for a player at a specific level
     * @param player The player address
     * @param level The level number
     * @return The score hash
     */
    function getScore(address player, uint256 level) external view returns (bytes32);

    /**
     * Get the highest level completed by a player
     * @param player The player address
     * @return The highest level number
     */
    function getHighestLevel(address player) external view returns (uint256);

    /**
     * Event emitted when a score is submitted
     */
    event ScoreSubmitted(address indexed player, uint256 indexed level, bytes32 scoreHash);
}
