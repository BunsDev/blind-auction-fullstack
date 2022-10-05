import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form, Input, Radio, Segment } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { bidAuction, getAuctionDetail } from "../../api/blindauction";
import useAsync from "../../components/useAsync";
import { useAppContext } from "../../contexts/App";
import Swal from "sweetalert2";
import "../../css/form/bidform.css";

interface Props {
    closeBidForm: () => void;
    auction:Auction
}


interface Auction {
    biddingEnd: number;
    revealEnd: number;
    beneficiary: string;
    address: string;
}

interface Bid {
    value: number;
    fake: boolean;
    secret: string;
    deposit: number;
    encrypt: string;
}

const BidForm: React.FC<Props> = ({ closeBidForm, auction }) => {
  const {
    state: { web3, account },
  } = useWeb3Context();
  const { createBlindAuction } = useAppContext();
  const [address, setAddressValue] = useState("");
  const [isFake, setIsFake] = useState(false);
  const [bid, setBid] = useState<Bid>({value:0,fake:false,secret:"",deposit:0,encrypt:""});
  const [publicKey, setPublicKey] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [pendingImport, setPendingImport] = useState(false);

  async function changeAddressValue(e: React.ChangeEvent<HTMLInputElement>) {
    setAddressValue(e.target.value);
  }
  async function bidAuctionHandler() {
    if (web3) {
      setPendingImport(true);
      
      const blindauction = await bidAuction(web3, account, bid, auction.address);
      setPendingImport(false);
      closeBidForm();
      Swal.fire("Bid auction successfully", "", "success");
    } else {
      Swal.fire("You must unclock Metamask", "", "warning");
    }
  }

  return (
    <div className="base-form-mask">
      <div className="bid-form">
        <div className="form-header">
          <h1>Bid Form</h1>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Deposit (Wei)</label>
              <Form.Input
                placeholder=""
                type="number"
                value={bid.deposit}
                onChange={(e) => {
                  setBid({
                    ...bid,
                    deposit:Number(e.target.value)
    
                  })
                }}
              />

              <label>Value (Wei)</label>
              <Form.Input
                placeholder=""
                type="number"
                value={bid.value}
                onChange={(e) => {
                  setBid({
                    ...bid,
                    value:Number(e.target.value)
    
                  })
                }}
              />

              <label>Secret</label>
              <Form.Input
                placeholder=""
                type="text"
                value={bid.secret}
                onChange={(e) => {
                  setBid({
                    ...bid,
                    secret:e.target.value
    
                  })
                }}
              />
             
            </Form.Field>
            

          </Form>
          <div className="b-flex fake-checkbox">
            <div >Is Fake ?</div>
            <input type="checkbox" onChange={(e) => {
                setBid({
                  ...bid,
                  fake: e.target.checked
                })
             }}/>
            
          </div>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={pendingImport}
            loading={pendingImport}
            onClick={bidAuctionHandler}
          >
            Bid
          </Button>
          <Button
            color="red"
            disabled={pendingImport}
            loading={pendingImport}
            onClick={closeBidForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BidForm;
