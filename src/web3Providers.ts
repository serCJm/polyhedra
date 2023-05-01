import { config } from "../config";
const Web3 = require("web3");

const bscWebSocketRPC = config.bscRPC;

export const web3 = new Web3(bscWebSocketRPC);
