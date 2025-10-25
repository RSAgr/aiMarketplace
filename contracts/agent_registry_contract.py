from pyteal import *

def approval_program():
    # Keys
    agent_owner = Bytes("owner")
    agent_name = Bytes("name")
    agent_description = Bytes("description")
    agent_reputation = Bytes("reputation")

    # When the app is created
    on_create = Seq([
        App.globalPut(Bytes("total_agents"), Int(0)),
        Approve()
    ])

    # Register a new agent
    register_agent = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # name, description, owner
        App.globalPut(Concat(Bytes("agent_"), Itob(App.globalGet(Bytes("total_agents"))), Bytes("_name")), Txn.application_args[0]),
        App.globalPut(Concat(Bytes("agent_"), Itob(App.globalGet(Bytes("total_agents"))), Bytes("_desc")), Txn.application_args[1]),
        App.globalPut(Concat(Bytes("agent_"), Itob(App.globalGet(Bytes("total_agents"))), Bytes("_owner")), Txn.sender()),
        App.globalPut(Concat(Bytes("agent_"), Itob(App.globalGet(Bytes("total_agents"))), Bytes("_rep")), Int(0)),
        App.globalPut(Bytes("total_agents"), App.globalGet(Bytes("total_agents")) + Int(1)),
        Approve()
    ])

    # Increase reputation
    increase_reputation = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # agent_id, increment_value
        App.globalPut(
            Concat(Bytes("agent_"), Txn.application_args[0], Bytes("_rep")),
            App.globalGet(Concat(Bytes("agent_"), Txn.application_args[0], Bytes("_rep"))) + Btoi(Txn.application_args[1])
        ),
        Approve()
    ])

    # Decrease reputation
    decrease_reputation = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # agent_id, decrement_value
        App.globalPut(
            Concat(Bytes("agent_"), Txn.application_args[0], Bytes("_rep")),
            App.globalGet(Concat(Bytes("agent_"), Txn.application_args[0], Bytes("_rep"))) - Btoi(Txn.application_args[1])
        ),
        Approve()
    ])

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.application_args[0] == Bytes("register_agent"), register_agent],
        [Txn.application_args[0] == Bytes("increase_reputation"), increase_reputation],
        [Txn.application_args[0] == Bytes("decrease_reputation"), decrease_reputation],
    )

    return program


if __name__ == "__main__":
    print(compileTeal(approval_program(), mode=Mode.Application, version=6))
