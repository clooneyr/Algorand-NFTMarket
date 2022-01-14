const algosdk = require('algosdk');
/**
 * @description Used to read local state of a specific account
 * @async
 * @param {Object} client Constructor for connecting to test environment 
 * @param {String} account Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 */
async function readLocalState(client, account, index) {
    let accountInfoResponse = await client.accountInformation(account.addr).do();
    for (let i = 0; i < accountInfoResponse['apps-local-state'].length; i++) {
        if (accountInfoResponse['apps-local-state'][i].id == index) {
            console.log("User's local state:");
            for (let n = 0; n < accountInfoResponse['apps-local-state'][i][`key-value`].length; n++) {
                console.log(accountInfoResponse['apps-local-state'][i][`key-value`][n]);
            }
        }
    }
}

/**
 * @description Used to read global state of the application
 * @async
 * @param {Object} client Constructor for connecting to test environment
 * @param {String} account Wallet SK obtained from mnemonic
 * @param {Number} index Number identifier for application
 */
async function readGlobalState(client, account, index) {
    let accountInfoResponse = await client.accountInformation(account.addr).do();
    for (let i = 0; i < accountInfoResponse['created-apps'].length; i++) {
        if (accountInfoResponse['created-apps'][i].id == index) {
            console.log("Application's global state:");
            for (let n = 0; n < accountInfoResponse['created-apps'][i]['params']['global-state'].length; n++) {
                console.log(accountInfoResponse['created-apps'][i]['params']['global-state'][n]);
            }
        }
    }
}

module.exports = { readLocalState, readGlobalState };