const algosdk = require('algosdk');
const { waitForConfirmation } = require('./chain-interactions/createApplication');

async function mintNFT() {

    try {
        const passphrase = "pigeon arena range poet pudding above initial spend labor satisfy cruel later repeat seed final like tobacco chest attack ghost furnace mesh flame abandon zero";
        let nftOwner = algosdk.mnemonicToSecretKey(passphrase);


        // Connect your client
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://localhost';
        const algodPort = 4001;
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
        let params = await algodClient.getTransactionParams().do();

        const creator = nftOwner.addr;
        const defaultFrozen = true;
        const unitName = "ATMP2";
        const assetName = "TRY1000";
        const assetURL = "https://gateway.pinata.cloud/ipfs/QmSF5GEeJpzZsmT9jygZ3XvweWThMeNFwMVriveiLVGzSx";
        let note = undefined;
        const manager = nftOwner.addr;
        const reserve = nftOwner.addr;
        const freeze = nftOwner.addr;
        const clawback = nftOwner.addr;
        let assetMetadataHash = undefined;
        const total = 1;
        const decimals = 0;
        const txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
            creator,
            note,
            total,
            decimals,
            defaultFrozen,
            manager,
            reserve,
            freeze,
            clawback,
            unitName,
            assetName,
            assetURL,
            assetMetadataHash,
            params,
        );


        // Sign the transaction
        let signedTxn = txn.signTxn(myAccount.sk);
        let txId = txn.txID().toString();
        console.log("Signed transaction with txID: %s", txId);


        // Submit the transaction
        await algodClient.sendRawTransaction(signedTxn).do();

        // Wait for confirmation
        let confirmedTxn = await waitForConfirmation(algodClient, txId, 4);
        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        let assetID = null;

    }
    catch (err) {
        console.log("err", err);
    }
    process.exit();
};

mintNFT();