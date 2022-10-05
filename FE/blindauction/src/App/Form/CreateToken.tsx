import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { createToken } from "../../api/wallet";
import useAsync from "../../components/useAsync";
import "../../css/form/createtoken.css";
import { useMultiSigWalletContext } from "../../contexts/MultiSigWallet";
import Swal from "sweetalert2";

interface Props {
  closeCreateTokenForm: () => void;
  wallet: string;
}

interface createTokenParams {
  wallet: string;
  name: string;
  symbol: string;
  decimals: number;
  total: number;
}

const CreateTokenForm: React.FC<Props> = ({ closeCreateTokenForm, wallet }) => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const {
    state: { address },
    addTokenCoin,
  } = useMultiSigWalletContext();

  const [name, setTokenName] = useState("");
  const [symbol, setTokenSymbol] = useState("");
  const [decimals, setTokenDecimals] = useState(18);
  const [total, setTokenTotal] = useState(0);

  const { pending, error, call } = useAsync<createTokenParams, any>(
    async (params) => {
      if (!web3) {
        throw new Error("No web3");
      }
      return await createToken(web3, account, params);
    }
  );

  function changeTokenName(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenName(e.target.value);
  }
  function changeTokenSymbol(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenSymbol(e.target.value);
  }
  function changeTokenDecimals(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenDecimals(Number(e.target.value));
  }
  function changeTokenTotal(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenTotal(Number(e.target.value));
  }
  async function createTokenWallet() {
    if (pending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unclock Metamask", "", "warning");
      return;
    }
    const { error, data } = await call({
      name,
      symbol,
      decimals,
      total,
      wallet,
    });
    if (error) {
      Swal.fire(`Error ${error.message}`, "", "warning");
    } else {
      addTokenCoin({
        token: data,
      });
      setTokenName("0");
      setTokenSymbol("0");
      setTokenDecimals(0);
      setTokenTotal(0);
      closeCreateTokenForm();
      Swal.fire(`Create successfully`, "", "success");
    }
  }

  return (
    <div className="base-form-mask">
      <div className="create-token-form">
        <div className="form-header">
          <h1>Create New Token</h1>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Token name:</label>
              <Form.Input
                placeholder=""
                type="text"
                value={name}
                onChange={changeTokenName}
              />
            </Form.Field>
            <Form.Field>
              <label>Token Symbol: </label>
              <Form.Input
                placeholder=""
                type="text"
                value={symbol}
                onChange={changeTokenSymbol}
              />
            </Form.Field>
            <Form.Field>
              <label>Token decimals: </label>
              <Form.Input
                placeholder=""
                type="number"
                min={0}
                value={decimals}
                onChange={changeTokenDecimals}
              />
            </Form.Field>
            <Form.Field>
              <label>Total Supply:</label>
              <Form.Input
                placeholder=""
                type="number"
                min={0}
                value={total}
                onChange={changeTokenTotal}
              />
            </Form.Field>
          </Form>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={pending}
            loading={pending}
            onClick={createTokenWallet}
          >
            Create Token
          </Button>
          <Button
            color="red"
            disabled={pending}
            loading={pending}
            onClick={closeCreateTokenForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTokenForm;
