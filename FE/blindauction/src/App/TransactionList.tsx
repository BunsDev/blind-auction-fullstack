import React from "react";
import BN from "bn.js";
import TransactionActions from "./TransactionActions";

interface Transaction {
  txIndex: number;
  destination: string;
  token: string;
  value: BN;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isConfirmedByCurrentAccount: boolean;
}

interface Props {
  numConfirmationsRequired: number;
  count: number;
  data: Transaction[];
  wallet: string;
}

const TransactionList: React.FC<Props> = ({
  numConfirmationsRequired,
  count,
  data,
  wallet,
}) => {
  return (
    <ul>
      {data.map((tx) => (
        <li key={tx.txIndex}>
          <div>Tx Index: {tx.txIndex}</div>
          <div>Destination: {tx.destination}</div>
          <div>Value: {tx.value.toString()}</div>
          <div>Data: {tx.data}</div>
          <div>Executed: {tx.executed.toString()}</div>
          <div>Confirmations: {tx.numConfirmations}</div>
          <TransactionActions
            numConfirmationsRequired={numConfirmationsRequired}
            tx={tx}
            wallet={wallet}
          />
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;
