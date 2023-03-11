import { useState } from 'react';
import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import { v4 as uuidv4 } from 'uuid';
import server from './server';

function Transfer({ setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const setValue = setter => evt => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const uuid = uuidv4();

      const msg = {
        amount: parseInt(sendAmount),
        uuid,
        recipient,
      };

      const msgHash = toHex(keccak256(utf8ToBytes(JSON.stringify(msg))));

      const [signature, recoveryBit] = await secp.sign(msgHash, privateKey, {
        recovered: true,
      });

      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: toHex(signature),
        recoveryBit,
        amount: parseInt(sendAmount),
        recipient,
        uuid,
      });

      setBalance(balance);

      alert('Transaction sended correctly');
      setSendAmount('');
      setRecipient('');
      
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form
      className="container transfer"
      onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0xcd9e9fb84b953dbab5c2f827643f2490d8509d01"
          value={recipient}
          onChange={setValue(setRecipient)}></input>
      </label>

      <input
        type="submit"
        className="button"
        value="Transfer"
      />
    </form>
  );
}

export default Transfer;
