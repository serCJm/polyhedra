import * as dotenv from "dotenv";
import * as path from "path";

// After changing, please rename to config.ts
// Private key file should be .env file with following structure:
// WALLETS=[{"name":"number", "privateKey":"0x..."}, {...}]
dotenv.config({ path: path.resolve(__dirname, "YOUR-WALLET-ENV-FILE-PATH") });

export const config = {
	bscRPC: "YOUR-WEB-SOCKET-RPC",
	mint: {
		contractAddress: "0x40a2A882c82AD7cC74E5f58Cde7612c07956D4A6",
		mintTimesPerWallet: 5,
		minWaitTime: 300000,
		maxWaitTime: 900000,
	},
	excludedWallets: [] as number[],
	secretWalletData: process.env.WALLETS
		? JSON.parse(process.env.WALLETS)
		: [],
};
