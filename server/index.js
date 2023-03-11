const secp = require('ethereum-cryptography/secp256k1');
const { toHex, hexToBytes } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { utf8ToBytes } = require('ethereum-cryptography/utils');

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  '0xc647cd72fe47d8d49fc8d99f677a973aaeb54042': {
    privKey: '4d0c33477a3a87579beb1c8121a92f5372a2b354d4fb9945775f4f083f659add',
    balance: 100,
  },
  '0x32b181376de57281c8db852df93243d28786829e': {
    privKey: '7cba960fe3f04f8d528505116ca5e96588773ad8d6e26ce7e2242c1de1e0fc71',
    balance: 50,
  },
  '0xcd9e9fb84b953dbab5c2f827643f2490d8509d01': {
    privKey: '936b86a23708448aee7ba7cd1d94e53e7d24e0da62be783c091e98d7325c02c6',
    balance: 75,
  },
};

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address]?.balance || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  // TODO: get a signature from the client side app,
  // recover the public address from the signature
  const { signature, recoveryBit, recipient, amount, uuid } = req.body;

  const msg = {
    amount,
    uuid,
    recipient,
  };

  const msgHash = toHex(keccak256(utf8ToBytes(JSON.stringify(msg))));

  const pubkey = secp.recoverPublicKey(msgHash, signature, recoveryBit);

  const sender = `0x${toHex(pubkey.slice(-20))}`;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender].balance < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    balances[sender].balance -= amount;
    balances[recipient].balance += amount;
    res.send({ balance: balances[sender].balance });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
