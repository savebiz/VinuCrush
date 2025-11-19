/**
 * VinuChain Configuration
 * ChainID: 207 (VinuChain Mainnet)
 */

import { defineChain } from 'thirdweb';

export const vinuchain = defineChain({
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

export const VINUCHAIN_ID = 207;
