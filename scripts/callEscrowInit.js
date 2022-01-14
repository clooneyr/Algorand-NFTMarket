const algosdk = require('algosdk');
const compileProgram = require('./chain-interactions/ompileProgram');
const tealSource = require('./escrowTeal');
const { callEscrow } = require('./chain-interactions/interactApplication');


// user declared account mnemonics
adminMnemonic = "pink cost kid easily bachelor crunch ability live carpet garment hurt cart alone hollow develop behave top wrist nature stool aerobic tired jeans abstract frost";


function bigIntToUint8Array(bn) {
    var hex = BigInt(bn.toString()).toString(16);
    if (hex.length % 2) {
        hex = '0' + hex;
    }

    var len = hex.length / 2;
    var u8 = new Uint8Array(len);

    var i = 0;
    var j = 0;
    while (i < len) {
        u8[i] = parseInt(hex.slice(j, j + 2), 16);
        i += 1;
        j += 2;
    }

    return u8;
}

function EncodeBytes(utf8String) {
    let enc = new TextEncoder()
    return enc.encode(utf8String)
}

function EncodeUint(intOrString) {
    return bigIntToUint8Array(intOrString)
}

async function main() {
    try {
        // initialize an algodClient
        const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const algodServer = 'http://localhost';
        const algodPort = 4001;


        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
        //Get parameters neessary for making transaction on testnet
        let params = await algodClient.getTransactionParams().do();

        // get accounts from mnemonic
        let adminAccount = algosdk.mnemonicToSecretKey(adminMnemonic);

        // compile Teal code
        let escrowLogic = await compileProgram(algodClient, tealSource);

        let escrow = new algosdk.LogicSigAccount(escrowLogic);
        let escrowAddress = escrow.address();

        //(Uncomment to test outputs if error's occur)!
        //console.log(escrow);
        //console.log(escrowAddress);

        let accounts = undefined;
        let foreignApps = undefined;
        let foreignAssets = [58139072]; //NFT ID

        let decoded = new algosdk.decodeAddress(escrowAddress);

        //(Uncomment to test outputs if error's occur)!
        //console.log(decoded);

        let appArgs = [];
        appArgs.push(EncodeBytes('initializeEscrow'));
        appArgs.push(decoded.publicKey);

        // call application with arguments
        await callEscrow(algodClient, adminAccount, params, 58139207, appArgs, accounts, foreignApps, foreignAssets);
    }
    catch (err) {
        console.log("err", err);
    }
}

main();
