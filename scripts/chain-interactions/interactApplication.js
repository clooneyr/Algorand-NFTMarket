const algosdk = require('algosdk');
const { waitForConfirmation } = require('./createApplication');
/**
 * @description Lets user opt into application so local state can be changed
 * @async
 * @param {Object} client Client Constructor for connecting to test environment
 * @param {String} account Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 */
async function optInApp(client, account, index) {
    // define sender
    sender = account.addr;
    // get node suggested parameters
    let params = await client.getTransactionParams().do();

    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // create unsigned transaction
    let txn = algosdk.makeApplicationOptInTxn(sender, params, index);
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(account.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await waitForConfirmation(client, txId);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Opted-in to app-id:", transactionResponse['txn']['txn']['apid'])
}

/**
 * @description Calls application & passes arguements
 * @async
 * @param {Object} client Client Constructor for connecting to test environment
 * @param {String} account Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 * @param {Uint8Array} appArgs Arguements passed which are put into a Uint8Array
 */
async function callApp(client, account, index, appArgs) {
    // define sender
    sender = account.addr;

    // get node suggested parameters
    let params = await client.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // create unsigned transaction
    let txn = algosdk.makeApplicationNoOpTxn(sender, params, index, appArgs)
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(account.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await waitForConfirmation(client, txId);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Called app-id:", transactionResponse['txn']['txn']['apid'])
    if (transactionResponse['global-state-delta'] !== undefined) {
        console.log("Global State updated:", transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined) {
        console.log("Local State updated:", transactionResponse['local-state-delta']);
    }
}


async function callEscrow(client, userAccount, params, index, appArgs, accounts, foreignApps, foreignAssets) {
    // define sender
    sender = userAccount.addr;


    // create unsigned transaction
    let txn = algosdk.makeApplicationNoOpTxn(sender, params, index, appArgs, accounts, foreignApps, foreignAssets)
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(userAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await waitForConfirmation(client, txId, 4);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Called app-id:", transactionResponse['txn']['txn']['apid'])
    if (transactionResponse['global-state-delta'] !== undefined) {
        console.log("Global State updated:", transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined) {
        console.log("Local State updated:", transactionResponse['local-state-delta']);
    }
}

async function callSellOffer(client, nftOwner, params, index, appArgs) {
    // define sender
    sender = nftOwner.addr;

    // create unsigned transaction
    let txn = algosdk.makeApplicationNoOpTxn(sender, params, index, appArgs)
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(userAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await waitForConfirmation(client, txId, 4);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Called app-id:", transactionResponse['txn']['txn']['apid'])
    if (transactionResponse['global-state-delta'] !== undefined) {
        console.log("Global State updated:", transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined) {
        console.log("Local State updated:", transactionResponse['local-state-delta']);
    }
}


async function callBuyOffer(client, buyerAccount, owner, escrow, amount, params, index, NFTindex, appArgs, escrowLogic) {
    // define sender
    sender = buyerAccount.addr;

    closeRemainderTo = undefined;
    note = undefined;
    revocationTarget = owner;


    //Pass "buy"
    let txn1 = algosdk.makeApplicationNoOpTxn(sender, params, index, appArgs);
    //Payment Transaction buyer to seller
    let txn2 = algosdk.makePaymentTxnWithSuggestedParams(sender, owner, amount, closeRemainderTo, note, params);
    //NFT transfer transaction, escrow -> Buyer
    let txn3 = algosdk.makeAssetTransferTxnWithSuggestedParams(escrow, sender, closeRemainderTo, owner, 1, note, NFTindex, params);


    //group the transactions
    let atomictxn = [txn1, txn2, txn3];

    // Group transactions
    let txgroup = algosdk.assignGroupID(atomictxn);

    //Sign the transactions

    let tx3Signer = new algosdk.LogicSigAccount(escrowLogic);
    console.log(tx3Signer);

    let signedTx1 = txn1.signTxn(userAccount.sk);
    let signedTx2 = txn2.signTxn(userAccount.sk);
    let signedTx3 = algosdk.signLogicSigTransaction(txn3, tx3Signer.lsig);

    let signed = [];
    signed.push(signedTx1);
    signed.push(signedTx2);
    signed.push(signedTx3.blob);

    // Submit the transaction
    let tx = (await client.sendRawTransaction(signed).do());

    // Wait for confirmation
    await waitForConfirmation(client, tx.txId, 4);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(tx.txId).do();
    console.log("Called app-id:", transactionResponse['txn']['txn']['apid'])
    if (transactionResponse['global-state-delta'] !== undefined) {
        console.log("Global State updated:", transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined) {
        console.log("Local State updated:", transactionResponse['local-state-delta']);
    }
}


module.exports = { optInApp, callApp, callEscrow, callSellOffer, callBuyOffer };