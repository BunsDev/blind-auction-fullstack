import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { deposit } from "../../api/wallet";
import { transferToken } from "../../api/token";
import useAsync from "../../components/useAsync";
import "../../css/form/depositform.css";
import { useMultiSigWalletContext } from "../../contexts/MultiSigWallet";
import Swal from "sweetalert2";

interface Props {
  closeDepositTokenForm: () => void;
  wallet: string;
  token: string;
}

interface DepositParams {
  value: BN;
  destination: string;
  token: string;
}

const DepositTokenForm: React.FC<Props> = ({
  closeDepositTokenForm,
  wallet,
  token,
}) => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const { state } = useMultiSigWalletContext();

  const [depositTokenValue, setDepositTokenValue] = useState(0);
  const walletAddr = wallet;

  const { pending: depositPending, call: depositCall } = useAsync<
    DepositParams,
    boolean
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await transferToken(web3, account, params);
  });

  function changeDepositValue(e: React.ChangeEvent<HTMLInputElement>) {
    setDepositTokenValue(Number(e.target.value));
  }

  async function depositTokenWallet() {
    if (depositPending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unclock Metamask", "", "warning");
      return;
    }
    const value = Web3.utils.toBN(depositTokenValue);
    const zero = Web3.utils.toBN(0);

    if (value.gt(zero)) {
      const { error, data } = await depositCall({
        value,
        destination: wallet,
        token,
      });
      if (error) {
        Swal.fire(`Error: ${error.message}`, "", "error");
      } else {
        setDepositTokenValue(0);
        let valueEther = web3.utils.fromWei(
          depositTokenValue.toString(),
          "ether"
        );
        // updateBalanceWallet({
        //   address: wallet,
        //   balance: Number(Number(valueEther).toFixed(4)),
        // });
        closeDepositTokenForm();
        Swal.fire(`Deposit successfully`, "", "success");
      }
    }
  }

  return (
    <div className="base-form-mask">
      <div className="deposit-form">
        <div className="form-header">
          <h1>Deposit Token</h1>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <div>Token: {token} </div>
              <div>Wallet: {wallet}</div>
              <label>Amount(Wei)</label>
              <Form.Input
                placeholder=""
                type="number"
                min={0}
                value={depositTokenValue}
                onChange={changeDepositValue}
              />
            </Form.Field>
          </Form>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={depositPending}
            loading={depositPending}
            onClick={depositTokenWallet}
          >
            Send transaction
          </Button>
          <Button
            color="red"
            disabled={depositPending}
            loading={depositPending}
            onClick={closeDepositTokenForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepositTokenForm;
