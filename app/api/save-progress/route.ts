/**
 * Server-Side Relayer API
 * Handles gasless transactions using backend wallet
 * User pays $0 gas, admin wallet has staked VC for quota
 */

import { NextRequest, NextResponse } from 'next/server';
import { createThirdwebClient } from 'thirdweb';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { defineChain } from 'thirdweb';

// VinuChain definition
const vinuchain = defineChain({
    id: 207,
    name: 'VinuChain',
    nativeCurrency: {
        name: 'VINU',
        symbol: 'VINU',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://vinuchain-rpc.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'VinuScan',
            url: 'https://vinuscan.com',
            apiUrl: 'https://vinuscan.com/api',
        },
    },
    testnet: false,
});

// Placeholder contract address - replace with actual deployed contract
const SCOREKEEPER_ADDRESS = '0x0000000000000000000000000000000000000000';

interface SubmitProgressRequest {
    userAddress: string;
    level: number;
    score: number;
    proof: string;
    timestamp: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: SubmitProgressRequest = await request.json();
        const { userAddress, level, score, proof, timestamp } = body;

        // Validate inputs
        if (!userAddress || !level || score === undefined || !proof) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify score is reasonable (anti-cheat)
        const maxReasonableScore = level * 1000; // Adjust based on game design
        if (score > maxReasonableScore) {
            return NextResponse.json(
                { error: 'Score too high - possible cheat detected' },
                { status: 400 }
            );
        }

        // Verify timestamp is recent (within 1 hour)
        const now = Date.now();
        if (Math.abs(now - timestamp) > 3600000) {
            return NextResponse.json(
                { error: 'Timestamp too old or in future' },
                { status: 400 }
            );
        }

        // Check if admin private key is configured
        const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
        if (!adminPrivateKey) {
            console.warn('ADMIN_PRIVATE_KEY not configured - skipping blockchain submission');

            // Return success for development/testing
            return NextResponse.json({
                success: true,
                txHash: '0x' + proof.slice(0, 64),
                message: 'Development mode - transaction simulated',
                level,
                score,
            });
        }

        // Initialize Thirdweb client
        const client = createThirdwebClient({
            secretKey: process.env.THIRDWEB_SECRET_KEY || '',
        });

        // Initialize server wallet from private key
        const account = privateKeyToAccount({
            client,
            privateKey: adminPrivateKey,
        });

        // Get contract instance
        const contract = getContract({
            client,
            chain: vinuchain,
            address: SCOREKEEPER_ADDRESS,
        });

        // Convert proof to bytes32 format
        const scoreHash = `0x${proof.padStart(64, '0')}` as `0x${string}`;

        // Prepare and send transaction
        const transaction = prepareContractCall({
            contract,
            method: 'function submitScore(uint256 level, bytes32 scoreHash)',
            params: [BigInt(level), scoreHash],
        });

        const result = await sendTransaction({
            transaction,
            account,
        });

        console.log(`Progress submitted for ${userAddress} - Level ${level}, Score ${score}`);
        console.log(`Transaction hash: ${result.transactionHash}`);

        return NextResponse.json({
            success: true,
            txHash: result.transactionHash,
            level,
            score,
        });
    } catch (error) {
        console.error('Error submitting progress:', error);

        return NextResponse.json(
            {
                error: 'Failed to submit progress',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
