const algosdk = require('algosdk');
const compileProgram = require('./chain-interactions/compileProgram');
const tealSource = require('./escrowTeal');
const { callBuyOffer } = require('./chain-interactions/interactApplication');



// user declared account mnemonics
buyerMnemonic = "twenty bid diary extend general science sail wild velvet erase token arm dignity outer dish mistake hamster fury opinion cake rib still peanut abandon coral";
let buyerAccount = algosdk.mnemonicToSecretKey(buyerMnemonic);



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

        let escrowLogic = await compileProgram(algodClient, tealSource);


        let owner = "6ELZ4T3ZGN7YBFQS36VF6FB6XXZSCXI53RZQPYYUGHYMIRDY3IBOKSRUBY"; //Owner of NFT
        let escrow = "MG3LCOUHRQC4MOHW2WGFKXJRTXXPEYU4WZPRZSIQQ2XCZS7U5TGF6EK33Y" //Escrow address

        let appArgs = [];
        appArgs.push(EncodeBytes('buy'));

        let nftPrice = 100;
        let appID = 58139207;
        let nftID = 58139072;

        await callBuyOffer(algodClient, buyerAccount, owner, escrow, nftPrice, params, appID, nftID, appArgs, escrowLogic);

    }
    catch (err) {
        console.log("err", err);
    }
}

main();
