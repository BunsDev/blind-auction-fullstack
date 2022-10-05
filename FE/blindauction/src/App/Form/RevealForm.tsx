import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form, Input, Radio, Segment } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { bidAuction, getAuctionDetail, reveal } from "../../api/blindauction";
import useAsync from "../../components/useAsync";
import { useAppContext } from "../../contexts/App";
import Swal from "sweetalert2";
import "../../css/form/revealform.css";

interface Props {
    closeRevealForm: () => void;
    bids:Bid[],
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

const RevealForm: React.FC<Props> = ({ closeRevealForm, bids, auction}) => {
  const {
    state: { web3, account },
  } = useWeb3Context();
  const [pendingReveal, setPendingReveal] = useState(false);
  async function revealHandler() {
    if (web3) {
      setPendingReveal(true);
      const blindauction = await reveal(web3, account, bids, auction.address);
      setPendingReveal(false);
      closeRevealForm();
      Swal.fire("Reveal auction successfully", "", "success");
    } else {
      Swal.fire("You must unclock Metamask", "", "warning");
    }
  }

  return (
    <div className="base-form-mask">
      <div className="reveal-form">
        <div className="form-header">
          <h1>Reveal Form</h1>
        </div>
        <div className="form-body">
            <div className="reveal-item">
                {
                    bids.map((bid,index)=>{
                        return(
                            <div className ="reveal-item">
                                    <label>Deposit (Wei)</label>
                                    <Form.Input
                                        placeholder=""
                                        type="number"
                                        value={bid.deposit}
                                    />

                                    <label>Value (Wei)</label>
                                    <Form.Input
                                        placeholder=""
                                        type="number"
                                        value={bid.value}
                                        
                                    />

                                    <label>Secret</label>
                                    <Form.Input
                                        placeholder=""
                                        type="text"
                                        value={bid.secret}
                                        
                                    />
                                    
                                    

                                <div className="b-flex fake-checkbox">
                                    <div >Is Fake ?</div>
                                    <input type="checkbox" checked={bid.fake}/>
                                    
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={pendingReveal}
            loading={pendingReveal}
            onClick={revealHandler}
          >
            Reveal
          </Button>
          <Button
            color="red"
            disabled={pendingReveal}
            loading={pendingReveal}
            onClick={closeRevealForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RevealForm;
