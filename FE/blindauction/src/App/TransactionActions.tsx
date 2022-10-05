import React from "react";
import { Button } from "semantic-ui-react";
import { useWeb3Context } from "../contexts/Web3";
import useAsync from "../components/useAsync";
import {
  executeTransaction,
  confirmTransaction,
  revokeConfirmation,
} from "../api/wallet";

interface Props {
  wallet: string;
  numConfirmationsRequired: number;
  tx: {
    txIndex: number;
    executed: boolean;
    numConfirmations: number;
    isConfirmedByCurrentAccount: boolean;
  };
}

const TransactionActions: React.FC<Props> = ({
  numConfirmationsRequired,
  tx,
  wallet,
}) => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const { txIndex } = tx;

  const confirmTx = useAsync(async () => {
    if (!web3) {
      throw new Error("No web3");
    }
    await confirmTransaction(web3, account, { txIndex, wallet });
  });

  const revokeConfirmationTx = useAsync(async () => {
    if (!web3) {
      throw new Error("No web3");
    }

    await revokeConfirmation(web3, account, { txIndex, wallet });
  });

  const executeTx = useAsync(async () => {
    if (!web3) {
      throw new Error("No web3");
    }

    await executeTransaction(web3, account, { txIndex, wallet });
  });

  if (tx.executed) {
    return null;
  }
  return (
    <>
      {tx.isConfirmedByCurrentAccount ? (
        <Button
          onClick={(_e) => revokeConfirmationTx.call(null)}
          disabled={revokeConfirmationTx.pending}
          loading={revokeConfirmationTx.pending}
        >
          Revoke Confirmation
        </Button>
      ) : (
        <Button
          onClick={(_e) => confirmTx.call(null)}
          disabled={confirmTx.pending}
          loading={confirmTx.pending}
        >
          Confirm
        </Button>
      )}
      {tx.numConfirmations >= numConfirmationsRequired && (
        <Button
          onClick={(_e) => executeTx.call(null)}
          disabled={executeTx.pending}
          loading={executeTx.pending}
        >
          Execute
        </Button>
      )}
    </>
  );
};

export default TransactionActions;
