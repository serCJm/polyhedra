import { setTimeout } from "timers/promises";
import { TransactionReceipt } from "web3-core";
import { config } from "../config";
import { mintConractABI } from "./ABIs/mintABI";
import { logToFile, randomNumber, shuffleArr } from "./utils/utils";
import { web3 } from "./web3Providers";

const { minWaitTime, maxWaitTime, contractAddress, mintTimesPerWallet } =
	config.mint;
const { excludedWallets } = config;

const contract = new web3.eth.Contract(mintConractABI, contractAddress);

const confirmationsRequired = 1;

async function mintToken({
	privateKey,
	name,
}: {
	privateKey: string;
	name: string;
}) {
	try {
		const account = web3.eth.accounts.privateKeyToAccount(privateKey);
		const fromAddress = account.address;

		const gasPrice = await web3.eth.getGasPrice();
		const nonce = await web3.eth.getTransactionCount(fromAddress);

		const transactionParameters = {
			to: contractAddress,
			gasPrice: web3.utils.toHex(gasPrice),
			gasLimit: web3.utils.toHex(150000), // Set an appropriate gas limit
			nonce: web3.utils.toHex(nonce),
			data: contract.methods.mint().encodeABI(),
		};

		const signedTransaction = await web3.eth.accounts.signTransaction(
			transactionParameters,
			privateKey
		);

		return new Promise(async (resolve, reject) => {
			const eventEmitter = web3.eth.sendSignedTransaction(
				signedTransaction.rawTransaction!
			);
			eventEmitter
				.once("transactionHash", (hash: string) => {
					console.log(
						`Transaction sent: https://bscscan.com/tx/${hash}`
					);
				})
				.on(
					"confirmation",
					(
						confirmationNumber: number,
						receipt: TransactionReceipt
					) => {
						if (confirmationNumber >= confirmationsRequired) {
							console.log("Transaction receipt:", receipt);
							logToFile(
								`COMPLETED ${name}: ${JSON.stringify(receipt)}`,
								"transactions.txt"
							);
							eventEmitter.removeAllListeners();
							resolve(receipt);
						}
					}
				)
				.on("error", (error: Error) => {
					console.error("Error in mintToken:", error);
					reject(error);
				});
		});
	} catch (error) {
		console.error("Error in mintToken:", error);
	}
}

async function main() {
	const wallets = shuffleArr([...config.secretWalletData]);

	for (const { privateKey, name } of wallets) {
		if (excludedWallets.includes(+name)) {
			console.log(
				`Skipping wallet ${name} as it's in the excluded list.`
			);
			continue;
		}
		try {
			for (let i = 1; i <= mintTimesPerWallet; i++) {
				await mintToken({ privateKey, name });

				console.log(
					`Finished minting token for wallet ${name}, iteration ${i}`
				);
			}

			await setTimeout(randomNumber(minWaitTime, maxWaitTime));
		} catch (error) {
			console.error(
				`Error sending transaction: ${error}, for user: ${name}`
			);
		}
	}
}

main().then(() => process.exit(0));
