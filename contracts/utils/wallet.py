from algosdk import account, mnemonic, transaction
from algosdk.v2client import algod
import os

ALGOD_URL = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
CREATOR_MNEMONIC = os.getenv("CREATOR_MNEMONIC")

def request_payment(receiver, amount, reason=""):
    private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
    sender = account.address_from_private_key(private_key)
    algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_URL)

    params = algod_client.suggested_params()
    unsigned_txn = transaction.PaymentTxn(sender, params, receiver, amount)
    signed_txn = unsigned_txn.sign(private_key)
    txid = algod_client.send_transaction(signed_txn)
    print(f"💸 Payment sent: {amount} microAlgos to {receiver} for {reason}. TxID: {txid}")
