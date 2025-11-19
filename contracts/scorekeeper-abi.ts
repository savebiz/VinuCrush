/**
 * ScoreKeeper Contract ABI
 * Generated from IScoreKeeper.sol
 */

export const SCOREKEEPER_ABI = [
    {
        type: 'function',
        name: 'submitScore',
        inputs: [
            { name: 'level', type: 'uint256' },
            { name: 'scoreHash', type: 'bytes32' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'getScore',
        inputs: [
            { name: 'player', type: 'address' },
            { name: 'level', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getHighestLevel',
        inputs: [{ name: 'player', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'event',
        name: 'ScoreSubmitted',
        inputs: [
            { name: 'player', type: 'address', indexed: true },
            { name: 'level', type: 'uint256', indexed: true },
            { name: 'scoreHash', type: 'bytes32', indexed: false },
        ],
    },
] as const;

// Placeholder contract address - replace with actual deployed contract
export const SCOREKEEPER_ADDRESS = '0x0000000000000000000000000000000000000000';
