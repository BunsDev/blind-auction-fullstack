import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, ButtonProps, Form } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { useAppContext } from "../../contexts/App";
import useAsync from "../../components/useAsync";
import { deposit } from "../../api/wallet";
import "../../css/form/createwallet.css";
import { createBlindAuction } from "../../api/blindauction";
import Swal from "sweetalert2";
interface Props {
  closeCreateBlindAuctionForm: () => void;
}

interface depositParams {
  web3: Web3;
  account: string;
  value: BN;
  wallet: string;
}

interface Owners {
  name: string;
  address: string;
}
interface Wallet {
  address?: string;
  name: string;
  numConfirmationsRequired: BN;
  accounts: Owners[];
}

interface CreateWalletParams {
  name: string;
  numConfirmationsRequired: number;
  owners: string[];
}

const CreateBlindAuctionForm: React.FC<Props> = ({ closeCreateBlindAuctionForm }) => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const {
    state: { auctions },
  } = useAppContext();

  const [name, setName] = useState(0);
  const [biddingTime, setBiddingTime] = useState(0);
  const [revealTime, setRevealTime] = useState(0);
  const [beneficiaryAddress, setBeneficiaryAddress] = useState(account);
  const [pendingCreate, setPendingCreate] = useState(false);

  function changeBiddingTime(e: React.ChangeEvent<HTMLInputElement>) {
    setBiddingTime(Number(e.target.value));
  }
  function changeBeneficiaryAddress(e: React.ChangeEvent<HTMLInputElement>) {
    setBeneficiaryAddress(e.target.value);
  }
  function changeRevealTime(e: React.ChangeEvent<HTMLInputElement>) {
    setRevealTime(Number(e.target.value));
  }
  async function createBlindAuctionHander() {
    if (web3) {
      setPendingCreate(true);
      const auctionInstance = await createBlindAuction(web3, account, {
        biddingTime: biddingTime,
        revealTime: revealTime,
        beneficiaryAddress: beneficiaryAddress,
      });
      console.log(auctionInstance);
      setPendingCreate(false);
      closeCreateBlindAuctionForm();
      Swal.fire("Create blind auction successfully", "", "success");
    } else {
      Swal.fire("You must unclock Metamask", "", "warning");
    }
  }

  return (
    <div className="base-form-mask">
      <div className="create-wallet-form">
        <div className="form-header">
          <h1> Create new blind auction</h1>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Bidding time (s)</label>
              <Form.Input
                placeholder=""
                type="number"
                min={0}
                value={biddingTime}
                onChange={changeBiddingTime}
              />
              <label>Reveal time (s)</label>
              <Form.Input
                placeholder=""
                type="number"
                min={0}
                value={revealTime}
                onChange={changeRevealTime}
              />
              <label>Beneficiary Address</label>
              <Form.Input
                placeholder=""
                type="text"
                min={0}
                value={beneficiaryAddress}
                onChange={changeBeneficiaryAddress}
              />
            </Form.Field>
          </Form>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={pendingCreate}
            loading={pendingCreate}
            onClick={createBlindAuctionHander}
          >
            Create
          </Button>
          <Button
            color="red"
            disabled={pendingCreate}
            loading={pendingCreate}
            onClick={closeCreateBlindAuctionForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlindAuctionForm;
