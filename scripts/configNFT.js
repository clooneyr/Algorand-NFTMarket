const algosdk = require('algosdk');
const { waitForConfirmation } = require('./chain-interactions/createApplication');

async function configNFT() {

    try {
        const owner = "pigeon arena range poet pudding above initial spend labor satisfy cruel later repeat seed final like tobacco chest attack ghost furnace mesh flame abandon zero";
        let ownerAccount = algosdk.mnemonicToSecretKey(owner);


        const buyer = "twenty bid diary extend general science sail wild velvet erase token arm dignity outer dish mistake hamster fury opinion cake rib still peanut abandon coral";
        let buyerAccount = algosdk.mnemonicToSecretKey(buyer);

        // Connect your client
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://localhost';
        const algodPort = 4001;


        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
        let params = await algodClient.getTransactionParams().do();

        const ownerAddr = ownerAccount.addr;
        const buyerAddr = buyerAccount.addr;
        let note = undefined;
        const assetIndex = 58139072;
        const manager = undefined;
        const reserve = undefined;
        const freeze = undefined;
        const clawback = "MG3LCOUHRQC4MOHW2WGFKXJRTXXPEYU4WZPRZSIQQ2XCZS7U5TGF6EK33Y";
        const strictEmptyAddressChecking = false;

        closeRemainderTo = undefined;
        note = undefined;
        revocationTarget = undefined;

        const altTxn = algosdk.makeAssetConfigTxnWithSuggestedParams(
            ownerAddr,
            note,
            assetIndex,
            manager,
            reserve,
            freeze,
            clawback,
            params,
            strictEmptyAddressChecking,
        );



        const optTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            buyerAddr,
            buyerAddr,
            closeRemainderTo,
            revocationTarget,
            0,
            note,
            assetIndex,
            params

        )


        //The following group of transaction, changes the clawback address to the escrow address..

        // Sign the transaction
        let signedTxn = altTxn.signTxn(ownerAccount.sk);
        let txId = altTxn.txID().toString();
        console.log("Signed transaction with txID: %s", txId);


        // Submit the transaction
        await algodClient.sendRawTransaction(signedTxn).do();

        // Wait for confirmation
        let confirmedTxn = await waitForConfirmation(algodClient, txId, 4);
        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        let assetID = null;





        ///The following transaction opts the buyer account into the NFT they want to buy MUST DO THIS BEFORE CALLING BUY FUNCTION

        //When ready to buy NFT uncomment and run the following txn.....
        /*

        // Sign the transaction
        let signedTxn = optTxn.signTxn(buyerAccount.sk);
        let txId = optTxn.txID().toString();
        console.log("Signed transaction with txID: %s", txId);


        // Submit the transaction
        await algodClient.sendRawTransaction(signedTxn).do();

        // Wait for confirmation
        let confirmedTxn = await waitForConfirmation(algodClient, txId, 4);
        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        let assetID = null;

        */
    }
    catch (err) {
        console.log("err", err);
    }
    process.exit();
};

configNFT();