from pyteal import *


def nft_escrow(app_id = 58139207, asa_id =58139072):
    return Seq([
        Assert(Global.group_size() == Int(3)),
        Assert(Gtxn[0].application_id() == Int(app_id)),

        Assert(Gtxn[1].type_enum() == TxnType.Payment),

        Assert(Gtxn[2].asset_amount() == Int(1)),
        Assert(Gtxn[2].xfer_asset() == Int(asa_id)),
        Assert(Gtxn[2].fee() <= Int(1000)),
        Assert(Gtxn[2].asset_close_to() == Global.zero_address()),
        Assert(Gtxn[2].rekey_to() == Global.zero_address()),

        Return(Int(1))
    ])

if __name__ == "__main__":
    with open("nftEscrow.teal", "w") as f:
        compiled = compileTeal(nft_escrow(), mode=Mode.Application, version=5)
        f.write(compiled)