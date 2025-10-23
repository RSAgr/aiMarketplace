from pyteal import *

def approval_program():
    task_creator = Bytes("creator")
    agent = Bytes("agent")
    result_hash = Bytes("result_hash")
    verified = Bytes("verified")
    payment_amount = Bytes("amount")

    on_create = Seq([
        App.localPut(Txn.sender(), task_creator, Txn.sender()),
        Approve()
    ])

    register_task = Seq([
        App.globalPut(result_hash, Txn.application_args[1]),
        App.globalPut(agent, Txn.sender()),
        App.globalPut(verified, Int(0)),
        Approve()
    ])

    approve_and_release = Seq([
        Assert(Txn.sender() == App.globalGet(task_creator)),  # Only task creator (or expert system AI) can approve
        App.globalPut(verified, Int(1)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: App.globalGet(payment_amount),
            TxnField.receiver: App.globalGet(agent)
        }),
        InnerTxnBuilder.Submit(),
        Approve()
    ])

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.application_args[0] == Bytes("register_task"), register_task],
        [Txn.application_args[0] == Bytes("approve_and_release"), approve_and_release],
    )

    return program

print(compileTeal(approval_program(), mode=Mode.Application, version=6))
