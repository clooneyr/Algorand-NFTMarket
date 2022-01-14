const algosdk = require('algosdk');
const { callSellOffer } = require('./chain-interactions/interactApplication');

let nftOwnerMnemonic = "pigeon arena range poet pudding above initial spend labor satisfy cruel later repeat seed final like tobacco chest attack ghost furnace mesh flame abandon zero";
let nftOwner = algosdk.mnemonicToSecretKey(nftOwnerMnemonic);


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

        let appID = 58139207;
        let appArgs = [];
        appArgs.push(EncodeBytes('makeSellOffer'));
        appArgs.push(EncodeUint('100')); //Price of NFT

        // call application with arguments
        await callSellOffer(algodClient, nftOwner, params, appID, appArgs);

    }
    catch (err) {
        console.log("err", err);
    }
}

main();
