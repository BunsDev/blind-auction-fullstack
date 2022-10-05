// import fs from 'fs'

import { AnySoaRecord } from "dns";

import crypto from 'crypto'
// const crypto = require("crypto")

export function generateKeyPairSyncCrypto(){
    console.log(crypto.generateKeyPair)
    console.log(crypto);
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
    })
    return {publicKey, privateKey}
}

export function encryptText(plainText:any) {
    return crypto.publicEncrypt({
        // key: fs.readFileSync('public_key.pem', 'utf8'),
        key: "publicKey",
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    },
        Buffer.from(plainText)
    )
}

export function decryptText(encryptedText:any) {
    return crypto.privateDecrypt(
        {
            //   key: fs.readFileSync('private_key.pem', 'utf8'),
            key: "privateKey",
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        encryptedText
    )
}

//console.log('encryptText: ', encryptText('hello').toString('base64'));
//console.log('de: ', decryptText(encryptText('hello')).toString());  