const tealSource = `#pragma version 5
txn ApplicationID
int 0
==
bnz main_l12
txn OnCompletion
int NoOp
==
bnz main_l3
err
main_l3:
txna ApplicationArgs 0
byte "initializeEscrow"
==
bnz main_l11
txna ApplicationArgs 0
byte "makeSellOffer"
==
bnz main_l10
txna ApplicationArgs 0
byte "buy"
==
bnz main_l9
txna ApplicationArgs 0
byte "stopSellOffer"
==
bnz main_l8
err
main_l8:
global GroupSize
int 1
==
txn Sender
byte "NFT_OWNER"
app_global_get
==
&&
byte "APP_STATE"
app_global_get
int 0
!=
&&
assert
byte "APP_STATE"
int 1
app_global_put
int 1
return
main_l9:
global GroupSize
int 3
==
byte "APP_STATE"
app_global_get
int 2
==
&&
gtxn 1 TypeEnum
int pay
==
gtxn 1 Receiver
byte "NFT_OWNER"
app_global_get
==
&&
gtxn 1 Amount
byte "NFT_PRICE"
app_global_get
==
&&
gtxn 1 Sender
gtxn 0 Sender
==
&&
gtxn 1 Sender
gtxn 2 AssetReceiver
==
&&
&&
gtxn 2 TypeEnum
int axfer
==
gtxn 2 Sender
byte "ESCROW_ADDRESS"
app_global_get
==
&&
gtxn 2 XferAsset
byte "NFT_ID"
app_global_get
==
&&
gtxn 2 AssetAmount
int 1
==
&&
&&
assert
byte "NFT_OWNER"
gtxn 0 Sender
app_global_put
byte "APP_STATE"
int 1
app_global_put
int 1
return
main_l10:
global GroupSize
int 1
==
byte "APP_STATE"
app_global_get
int 1
==
byte "APP_STATE"
app_global_get
int 2
==
||
&&
txn Sender
byte "NFT_OWNER"
app_global_get
==
&&
txn NumAppArgs
int 2
==
&&
assert
byte "NFT_PRICE"
txna ApplicationArgs 1
btoi
app_global_put
byte "APP_STATE"
int 2
app_global_put
int 1
return
main_l11:
global GroupSize
int 1
==
assert
txna Assets 0
asset_params_get AssetClawback
store 0
store 1
txna Assets 0
asset_params_get AssetManager
store 2
store 3
txna Assets 0
asset_params_get AssetFreeze
store 4
store 5
txna Assets 0
asset_params_get AssetReserve
store 6
store 7
txna Assets 0
asset_params_get AssetDefaultFrozen
store 8
store 9
txna Assets 0
byte "NFT_ID"
app_global_get
==
assert
load 1
txna ApplicationArgs 1
==
assert
load 9
assert
load 3
global ZeroAddress
==
assert
load 5
global ZeroAddress
==
assert
load 7
global ZeroAddress
==
assert
byte "ESCROW_ADDRESS"
txna ApplicationArgs 1
app_global_put
byte "APP_STATE"
int 1
app_global_put
int 1
return
main_l12:
txn NumAppArgs
int 2
==
assert
byte "APP_STATE"
int 0
app_global_put
byte "NFT_ID"
txna Assets 0
app_global_put
byte "NFT_OWNER"
txna ApplicationArgs 0
app_global_put
byte "APP_ADMIN"
txna ApplicationArgs 1
app_global_put
int 1
return
`;

module.exports = tealSource;