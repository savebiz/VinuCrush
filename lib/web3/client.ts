/**
 * Thirdweb Client Configuration
 */

import { createThirdwebClient } from 'thirdweb';

// Create the Thirdweb client
// You'll need to get a client ID from https://thirdweb.com/dashboard
export const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
});
