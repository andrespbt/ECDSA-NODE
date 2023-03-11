const secp = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');

const privKey = secp.utils.randomPrivateKey();
const pubKey = secp.getPublicKey(privKey).slice(1).slice(-20);

console.log(`public key: 0x${toHex(pubKey)}`);
console.log('private key', toHex(privKey));
