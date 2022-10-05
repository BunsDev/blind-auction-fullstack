import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { getAuctionDetail } from "../../api/blindauction";
import useAsync from "../../components/useAsync";
import "../../css/form/importwallet.css";
import { useAppContext } from "../../contexts/App";
import Swal from "sweetalert2";

interface Props {
  closeImportBlindAuction: () => void;
  wallet: string;
}

const ImportBlindAuctionForm: React.FC<Props> = ({ closeImportBlindAuction, wallet }) => {
  const {
    state: { web3, account },
  } = useWeb3Context();
  const { createBlindAuction } = useAppContext();
  const [address, setAddressValue] = useState("");
  const [pendingImport, setPendingImport] = useState(false);
  const walletAddr = wallet;

  async function changeAddressValue(e: React.ChangeEvent<HTMLInputElement>) {
    setAddressValue(e.target.value);
  }
  async function importBlindAuction() {
    if (web3) {
      setPendingImport(true);
      const blindauction = await getAuctionDetail(web3, account, address);
      createBlindAuction({
        biddingEnd: blindauction.biddingEnd,
        revealEnd: blindauction.revealEnd,
        beneficiary: blindauction.beneficiary,
        address:blindauction.address
      });
      setPendingImport(false);
      closeImportBlindAuction();
      Swal.fire("Import wallet successfully", "", "success");
    } else {
      Swal.fire("You must unclock Metamask", "", "warning");
    }
  }

  return (
    <div className="base-form-mask">
      <div className="import-wallet-form">
        <div className="form-header">
          <h1>Import Blind Auction</h1>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Blind Auction Address</label>
              <Form.Input
                placeholder=""
                type="text"
                value={address}
                onChange={changeAddressValue}
              />
            </Form.Field>
          </Form>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={pendingImport}
            loading={pendingImport}
            onClick={importBlindAuction}
          >
            Import
          </Button>
          <Button
            color="red"
            disabled={pendingImport}
            loading={pendingImport}
            onClick={closeImportBlindAuction}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportBlindAuctionForm;
