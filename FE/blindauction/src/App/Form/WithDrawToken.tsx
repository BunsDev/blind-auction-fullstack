import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { submitTransaction } from "../../api/wallet";
import useAsync from "../../components/useAsync";
import "../../css/form/withdrawform.css";
import Swal from "sweetalert2";

interface Props {
  closeWithDrawTokenForm: () => void;
  wallet: string;
  token: string;
}

interface WithDrawParams {
  destination: string;
  value: string;
  data: string;
  token: string;
  wallet: string;
}

const WithdrawTokenForm: React.FC<Props> = ({
  closeWithDrawTokenForm,
  wallet,
  token,
}) => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const [withDrawValue, setWithDrawValue] = useState(0);
  const [address, setAddress] = useState("");
  const { pending, call: withdrawCall } = useAsync<WithDrawParams, void>(
    async (params) => {
      if (!web3) {
        throw new Error("No web3");
      }
      return await submitTransaction(web3, account, params);
    }
  );

  function changeWithDrawValue(e: React.ChangeEvent<HTMLInputElement>) {
    setWithDrawValue(Number(e.target.value));
  }
  function changeAddress(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value);
  }
  async function withDrawWallet() {
    if (pending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unclock Metamask", "", "warning");
      return;
    }

    const value = Web3.utils.toBN(withDrawValue);
    const zero = Web3.utils.toBN(0);

    if (value.gt(zero)) {
      const { error } = await withdrawCall({
        value: withDrawValue.toString(),
        destination: address,
        data: "sdasdas",
        token,
        wallet,
      });

      if (error) {
        Swal.fire(`Error: ${error.message}`, "", "error");
      } else {
        closeWithDrawTokenForm();
        setWithDrawValue(0);
      }
    }
  }

  return (
    <div className="base-form-mask">
      <div className="withdraw-form">
        <div className="form-header">
          <h1>Withdraw Token</h1>
          <div>Wallet Address: {wallet}</div>
          <div>Token: {token}</div>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Amount token:</label>
              <Form.Input
                placeholder=""
                type="number"
                min={0}
                value={withDrawValue}
                onChange={changeWithDrawValue}
              />
            </Form.Field>
            <Form.Field>
              <label>Address</label>
              <Form.Input
                placeholder=""
                type="text"
                value={address}
                onChange={changeAddress}
              />
            </Form.Field>
          </Form>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={pending}
            loading={pending}
            onClick={withDrawWallet}
          >
            Send transaction
          </Button>
          <Button
            color="red"
            disabled={pending}
            loading={pending}
            onClick={closeWithDrawTokenForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawTokenForm;
