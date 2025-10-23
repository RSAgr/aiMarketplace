from algosdk import transaction
from algosdk import mnemonic, account
from algosdk.v2client import algod
import os

# Connect to Algod
algod_token = ""
algod_address = "https://testnet-api.algonode.cloud"
client = algod.AlgodClient(algod_token, algod_address)

# Load creator
mn = os.getenv("CREATOR_MNEMONIC")
creator_private_key = mnemonic.to_private_key(mn)
creator_address = account.address_from_private_key(creator_private_key)

app_id = 748319846

# Get suggested params
params = client.suggested_params()

# Build opt-in transaction
optin_txn = transaction.ApplicationOptInTxn(
    sender=creator_address,
    sp=params,
    index=app_id
)

# Sign and send
signed_optin_txn = optin_txn.sign(creator_private_key)
txid = client.send_transaction(signed_optin_txn)
print(f"Opt-in transaction sent: {txid}")
