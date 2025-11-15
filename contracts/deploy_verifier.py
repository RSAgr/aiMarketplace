# from algosdk.v2client import algod
# from algosdk.future.transaction import *
# from algosdk import account, mnemonic

# from verifier_task import approval_program

# def compile_program(client, source_code):
#     compile_response = client.compile(source_code)
#     return base64.b64decode(compile_response['result'])

# # --- UPDATE THESE ---
# ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
# ALGOD_TOKEN = ""
# SENDER_MN = "your mnemonic"

# client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
# private_key = mnemonic.to_private_key(SENDER_MN)
# sender = mnemonic.to_public_key(SENDER_MN)

# # compile PyTeal
# approval_teal = compileTeal(approval_program(), Mode.Application, version=6)
# approval_binary = compile_program(client, approval_teal)

# # create app
# global_schema = StateSchema(5, 0)
# local_schema = StateSchema(1, 0)

# txn = ApplicationCreateTxn(
#     sender,
#     client.suggested_params(),
#     OnComplete.NoOpOC,
#     approval_binary,
#     clear_program=b"\x01\x20\x01\x01\x22",  # minimal clear program
#     global_schema=global_schema,
#     local_schema=local_schema
# )

# signed = txn.sign(private_key)
# txid = client.send_transaction(signed)
# print("Waiting…")
# result = transaction.wait_for_confirmation(client, txid)
# app_id = result["application-index"]

# print("APP ID:", app_id)

from algosdk import account, mnemonic

addr, sk = account.generate_account()
print(type(sk))
mn = mnemonic.from_private_key(sk)


print("Address:", addr)
print("Mnemonic:", mn)
