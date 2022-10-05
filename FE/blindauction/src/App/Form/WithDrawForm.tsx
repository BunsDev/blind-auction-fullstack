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
  closeWithDrawForm: () => void;
  wallet: string;
}

interface WithDrawParams {
  destination: string;
  value: string;
  data: string;
  token: string;
  wallet: string;
}

const WithdrawForm: React.FC<Props> = ({ closeWithDrawForm, wallet }) => {
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
        token: "0x0000000000000000000000000000000000000000",
        wallet,
      });

      if (error) {
        Swal.fire(`Error: ${error.message}`, "", "error");
      } else {
        Swal.fire("Withdraw ETH successfully", "", "success");
        closeWithDrawForm();
        setWithDrawValue(0);
      }
    }
  }

  return (
    <div className="base-form-mask">
      <div className="withdraw-form">
        <div className="form-header">
          <h1>Withdraw</h1>
          <h2>Wallet Address: {wallet}</h2>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Amount(Wei)</label>
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
            onClick={closeWithDrawForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawForm;
