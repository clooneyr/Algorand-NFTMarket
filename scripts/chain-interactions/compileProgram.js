const algosdk = require('algosdk');
/**
 * 
 * @description Helper function to compile program source
 * @async 
 * @param {Object} client Client constructor for connecting to test environment
 * @param {String} programSource Teal approval program source code 
 * @returns {Uint8Array} compiledBytes 
 */
async function compileProgram(client, programSource) {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await client.compile(programBytes).do();
    let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
    return compiledBytes;
}

module.exports = compileProgram;