const algosdk = require('algosdk');
/**
 * @description Function waits for transaction to complete
 * @param {Object} algodclient Constructor for connecting to test environment
 * @param {String} txId Identification key for the current transaction
 */
const waitForConfirmation = async function (algodClient, txId, timeout) {
    if (algodClient == null || txId == null || timeout < 0) {
        throw new Error("Bad arguments");
    }

    const status = (await algodClient.status().do());
    if (status === undefined) {
        throw new Error("Unable to get node status");
    }

    const startround = status["last-round"] + 1;
    let currentround = startround;

    while (currentround < (startround + timeout)) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo !== undefined) {
            if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
                //Got the completed Transaction
                return pendingInfo;
            } else {
                if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
                    // If there was a pool error, then the transaction has been rejected!
                    throw new Error("Transaction " + txId + " rejected - pool error: " + pendingInfo["pool-error"]);
                }
            }
        }
        await algodClient.statusAfterBlock(currentround).do();
        currentround++;
    }
    throw new Error("Transaction " + txId + " not confirmed after " + timeout + " rounds!");
};


/**
 * 
 * @description Creates application and puts it on Algorand
 * @async
 * @param {Object} client Constructor for connecting to test environment
 * @param {String} creatorAccount Wallet SK obtained from mnemonic
 * @param {String} approvalProgram TEAL source code for approval program
 * @param {String} clearProgram TEAL source code for clear program
 * @param {Number} localInts Local state allocation
 * @param {Number} localBytes Local state allocation
 * @param {Number} globalInts Global state allocation
 * @param {Number} globalBytes Global state allocation
 * @returns {Number} Application ID
 */
async function createApp(client, params, creatorAccount, approvalProgram, clearProgram, localInts, localBytes, globalInts, globalBytes, appArgs, accounts, foreignApps, foreignAssets) {

    // define sender as creator
    sender = creatorAccount.addr;
    // declare onComplete as NoOp
    onComplete = algosdk.OnApplicationComplete.NoOpOC;

    // create unsigned transaction
    let txn = algosdk.makeApplicationCreateTxn(sender, params, onComplete,
        approvalProgram, clearProgram,
        localInts, localBytes, globalInts, globalBytes, appArgs, accounts, foreignApps, foreignAssets);
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(creatorAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();
    // Wait for confirmation
    await waitForConfirmation(client, txId, 4);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index'];
    console.log("Created new app-id: ", appId);
    return appId;
}





module.exports = { waitForConfirmation, createApp };
