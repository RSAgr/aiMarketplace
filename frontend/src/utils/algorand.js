import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";

const peraWallet = new PeraWalletConnect();

export const connectWallet = async () => {
  try {
    const accounts = await peraWallet.connect();
    const address = accounts[0];
    console.log("Connected wallet address:", address);
    return address;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
};

export const disconnectWallet = async () => {
  try {
    await peraWallet.disconnect();
    console.log("Disconnected wallet");
  } catch (err) {
    console.error("Wallet disconnect error:", err);
  }
};

export const getAlgodClient = () => {
  // TestNet client — we can switch to MainNet later
  return new algosdk.Algodv2(
    { "X-API-Key": "" },
    "https://testnet-api.algonode.cloud",
    ""
  );
};
