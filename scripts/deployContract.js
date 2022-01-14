const algosdk = require('algosdk');
const compileProgram = require('./chain-interactions/compileProgram');
const tealSource = require('./approvalTeal');
const clearSource = require('./clearTeal');
const { createApp } = require('./chain-interactions/createApplication');

// user declared account mnemonics
creatorMnemonic = "twenty bid diary extend general science sail wild velvet erase token arm dignity outer dish mistake hamster fury opinion cake rib still peanut abandon coral";
userMnemonic = "pink cost kid easily bachelor crunch ability live carpet garment hurt cart alone hollow develop behave top wrist nature stool aerobic tired jeans abstract frost"



// declare application state storage (immutable)
localInts = 1;
localBytes = 1;
globalInts = 3;
globalBytes = 3;


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
        let params = await algodClient.getTransactionParams().do();
        // get accounts from mnemonic
        let creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
        let userAccount = algosdk.mnemonicToSecretKey(userMnemonic);

        // compile programs 
        let approvalProgram = await compileProgram(algodClient, tealSource);
        let clearProgram = await compileProgram(algodClient, clearSource);

        let nftOwnerAdd = "6ELZ4T3ZGN7YBFQS36VF6FB6XXZSCXI53RZQPYYUGHYMIRDY3IBOKSRUBY";

        let adminAdd = "DHBCQQ4DWQOPOW6NRMGYFISFFHVEF5IJIPX6BDETIMCON5CTONKGLQRECI"

        let appAdmin = new algosdk.decodeAddress(adminAdd);
        let nftOwner = new algosdk.decodeAddress(nftOwnerAdd);

        let appArgs = [];
        appArgs.push(nftOwner.publicKey);
        appArgs.push(appAdmin.publicKey);

        let accounts = undefined;
        let foreignApps = undefined;
        let foreignAssets = [58139072];

        // create new application
        await createApp(algodClient, params, creatorAccount, approvalProgram, clearProgram, localInts, localBytes, globalInts, globalBytes, appArgs, accounts, foreignApps, foreignAssets);

    }
    catch (err) {
        console.log("err", err);
    }
}

main();
