from pyteal import *

""" NFT market place that allows the selling & buying of a NFT """

def nft_market():

    on_create = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(Bytes("APP_STATE"), Int(0)),
        App.globalPut(Bytes("NFT_ID"), Txn.assets[0]),
        App.globalPut(Bytes("NFT_OWNER"), Txn.application_args[0]), #First arguement passed is owner addr
        App.globalPut(Bytes("APP_ADMIN"), Txn.application_args[1]), #Second arguement passed is the admin addr
        Approve(),
    ])
   
    

    escrow_address = Txn.application_args[1]

    asset_escrow = AssetParam.clawback(Txn.assets[0])
    manager_address = AssetParam.manager(Txn.assets[0])
    freeze_address = AssetParam.freeze(Txn.assets[0])
    reserve_address = AssetParam.reserve(Txn.assets[0])
    default_frozen = AssetParam.defaultFrozen(Txn.assets[0])

    initialize_escrow = Seq([
        Assert(Global.group_size() == Int(1)), #Making sure there is only 1 transaction
        asset_escrow,
        manager_address,
        freeze_address,
        reserve_address,
        default_frozen,
        Assert(Txn.assets[0] == App.globalGet(Bytes("NFT_ID"))),
        Assert(asset_escrow.value() == Txn.application_args[1]),
        Assert(default_frozen.value()),
        Assert(manager_address.value() == Global.zero_address()),
        Assert(freeze_address.value() == Global.zero_address()),
        Assert(reserve_address.value() == Global.zero_address()),
        App.globalPut(Bytes("ESCROW_ADDRESS"), escrow_address), #setting the escrow address
        App.globalPut(Bytes("APP_STATE"), Int(1)),
        Approve(),
    ])

    valid_number_of_transactions = Global.group_size() == Int(1)
    app_is_active = Or(App.globalGet(Bytes("APP_STATE")) == Int(1), App.globalGet(Bytes("APP_STATE")) == Int(2))

    valid_seller = Txn.sender() == App.globalGet(Bytes("NFT_OWNER"))
    valid_number_of_arguments = Txn.application_args.length() == Int(2)

    can_sell = And(valid_number_of_transactions, app_is_active, valid_seller, valid_number_of_arguments)

    Sell_Price = Btoi(Txn.application_args[1])

    make_sell_offer = Seq([
        Assert(can_sell),
        App.globalPut(Bytes("NFT_PRICE"), Sell_Price),
        App.globalPut(Bytes("APP_STATE"), Int(2)),
        Approve(),
    ])


    valid_number_buy_transactions = Global.group_size() == Int(3)
    nft_is_on_sale = App.globalGet(Bytes("APP_STATE")) == Int(2)

    valid_payment_to_seller = And(
        Gtxn[1].type_enum() == TxnType.Payment,
        Gtxn[1].receiver() == App.globalGet(Bytes("NFT_OWNER")),
        Gtxn[1].amount() == App.globalGet(Bytes("NFT_PRICE")),
        Gtxn[1].sender() == Gtxn[0].sender(),
        Gtxn[1].sender() == Gtxn[2].asset_receiver(),
    )

    valid_nft_transfer_from_escrow_to_buyer = And(
        Gtxn[2].type_enum() == TxnType.AssetTransfer,
        Gtxn[2].sender() == App.globalGet(Bytes("ESCROW_ADDRESS")),
        Gtxn[2].xfer_asset() == App.globalGet(Bytes("NFT_ID")),
        Gtxn[2].asset_amount() == Int(1)
    )

    can_buy = And(valid_number_buy_transactions,nft_is_on_sale,valid_payment_to_seller,valid_nft_transfer_from_escrow_to_buyer)


    buy = Seq([
        Assert(can_buy),
        App.globalPut(Bytes("NFT_OWNER"), Gtxn[0].sender()),
        App.globalPut(Bytes("APP_STATE"), Int(1)),
        Approve(),
    ])

    valid_number_sell_transactions = Global.group_size() == Int(1)
    valid_caller = Txn.sender() == App.globalGet(Bytes("NFT_OWNER"))
    app_is_initialized = App.globalGet(Bytes("APP_STATE")) != Int(0)

    can_stop_selling = And(valid_number_sell_transactions, valid_caller, app_is_initialized)

    stop_sell_offer = Seq([
        Assert(can_stop_selling),
        App.globalPut(Bytes("APP_STATE"), Int(1)),
        Approve(),
    ])


    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("initializeEscrow"), initialize_escrow],
        [on_call_method == Bytes("makeSellOffer"), make_sell_offer],
        [on_call_method == Bytes("buy"), buy],
        [on_call_method == Bytes("stopSellOffer"), stop_sell_offer],
        
    )

    program_calls = Cond (
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, on_call],
    )

    return program_calls






""" Clear Contract """
def clear_state_program():
    return Approve()


if __name__ == "__main__":
    with open("nftMarketPlace.teal", "w") as f:
        compiled = compileTeal(nft_market(), mode=Mode.Application, version=5)
        f.write(compiled)

    with open("clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)