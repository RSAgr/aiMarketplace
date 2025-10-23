# deploy_contract.py
from algosdk import account, transaction, mnemonic
from algosdk.v2client import algod
from pyteal import compileTeal, Mode
from task_verifier import approval_program
import os

# Load your Algorand credentials
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""  # empty for most public nodes like Algonode
CREATOR_MNEMONIC = mn = os.getenv("CREATOR_MNEMONIC")

def get_private_key_from_mnemonic(mn):
    return mnemonic.to_private_key(mn)

def get_algod_client():
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

def compile_program(client, source_code):
    compile_response = client.compile(source_code)
    return base64.b64decode(compile_response["result"])

def main():
    client = get_algod_client()
    private_key = get_private_key_from_mnemonic(CREATOR_MNEMONIC)
    sender = account.address_from_private_key(private_key)

    # Compile PyTeal to TEAL
    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=6)
    approval_result = client.compile(approval_teal)
    approval_binary = base64.b64decode(approval_result["result"])

    # Use empty clear program (optional)
    clear_teal = compileTeal(Approve(), mode=Mode.Application, version=6)
    clear_result = client.compile(clear_teal)
    clear_binary = base64.b64decode(clear_result["result"])

    # Create the app
    sp = client.suggested_params()
    txn = transaction.ApplicationCreateTxn(
        sender=sender,
        sp=sp,
        on_complete=transaction.OnComplete.NoOpOC.real,
        approval_program=approval_binary,
        clear_program=clear_binary,
        global_schema=transaction.StateSchema(num_uints=2, num_byte_slices=3),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=1)
    )

    signed_txn = txn.sign(private_key)
    txid = client.send_transaction(signed_txn)
    response = transaction.wait_for_confirmation(client, txid, 4)
    app_id = response["application-index"]
    #print("✅ Transaction confirmed in round", response["confirmed-round"])
    print("✅ Smart contract deployed successfully!")
    print("App ID:", app_id)

if __name__ == "__main__":
    import base64
    from pyteal import Approve
    main()
