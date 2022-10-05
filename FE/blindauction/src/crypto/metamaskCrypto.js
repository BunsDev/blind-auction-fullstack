// import {} from 'ethereumjs-util'
//import {encrypt} from '@metamask/eth-sig-util'
const ethUtil = require("ethereumjs-util");
const ethSig = require("@metamask/eth-sig-util")

export async function encryptCustom(rawData, account){
  let result = await window.ethereum
  .request({
    method: 'eth_getEncryptionPublicKey',
    params: [account], // you must have access to the specified account
  });
  return await ethUtil.bufferToHex(
    Buffer.from(
      JSON.stringify(
        ethSig.encrypt({
          publicKey: result,
          data: rawData,
          version: 'x25519-xsalsa20-poly1305',
        })
      ),
      'utf8'
    )
  );
}


export async function decryptCustom(encryptedMessage, account){
  return await window.ethereum
    .request({
      method: 'eth_decrypt',
      params: [encryptedMessage, account],
    });
}
