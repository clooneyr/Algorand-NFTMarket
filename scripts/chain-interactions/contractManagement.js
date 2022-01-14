const algosdk = require('algosdk');
const { waitForConfirmation } = require('./createApplication');
/**
 * @description Used to update the approval or clear program source code
 * @async
 * @param {Object} client Client constructor for connecting to test environment
 * @param {String} creatorAccount Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 * @param {Uint8Array} approvalProgram Compiled TEAL source code
 * @param {Uint8Array} clearProgram compiled TEAL source code
 * @returns {Number} Application ID
 */
async function updateApp(client, creatorAccount, index, approvalProgram, clearProgram) {
    // define sender as creator
    sender = creatorAccount.addr;

    // get node suggested parameters
    let params = await client.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // create unsigned transaction
    let txn = algosdk.makeApplicationUpdateTxn(sender, params, index, approvalProgram, clearProgram);
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(creatorAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await waitForConfirmation(client, txId);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Updated app-id: ", appId);
    return appId;
}

/**
 * @description Closes out a user's state in an application
 * @async
 * @param {Object} client Client constructor for connecting to test environment
 * @param {String} account Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 */
async function closeOutApp(client, account, index) {
    // define sender
    sender = account.addr;

    // get node suggested parameters
    let params = await client.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // create unsigned transaction
    let txn = algosdk.makeApplicationCloseOutTxn(sender, params, index)
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
    console.log("Closed out from app-id:", transactionResponse['txn']['txn']['apid'])
}

/**
 * @description Deletes an application
 * @async
 * @param {Object} client Client constructor for connecting to test environment
 * @param {String} creatorAccount Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 * @returns {Number} Application ID
 */
async function deleteApp(client, creatorAccount, index) {
    // define sender as creator
    sender = creatorAccount.addr;

    // get node suggested parameters
    let params = await client.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // create unsigned transaction
    let txn = algosdk.makeApplicationDeleteTxn(sender, params, index);
    let txId = txn.txID().toString();

    // Sign the transaction
    let signedTxn = txn.signTxn(creatorAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    // Submit the transaction
    await client.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    await waitForConfirmation(client, txId);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Deleted app-id: ", appId);
    return appId;
}

/**
 * @description Clears a user's state in an application
 * @async
 * @param {Object} client Client constructor for connecting to test environment
 * @param {String} account Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 * @returns {Number} Application ID
 */
async function clearApp(client, account, index) {
    // define sender as creator
    sender = account.addr;

    // get node suggested parameters
    let params = await client.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // create unsigned transaction
    let txn = algosdk.makeApplicationClearStateTxn(sender, params, index);
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
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Cleared local state for app-id: ", appId);
    return appId;
}

module.exports = { updateApp, closeOutApp, deleteApp, clearApp };