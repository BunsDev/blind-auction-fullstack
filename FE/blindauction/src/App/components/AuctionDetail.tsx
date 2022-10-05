import React, { useEffect, useState } from "react";
import "../../css/components/auctiondetail.css";
import moment from "moment";
import { Button } from "semantic-ui-react";
import BidForm from "../Form/BidForm";
import { auctionEnd, getListBids, withDraw } from "../../api/blindauction";
import { useWeb3Context } from "../../contexts/Web3";
import RevealForm from "../Form/RevealForm";
import Swal from "sweetalert2";
const { generateKeyPair } = require('crypto');
const {ethSig,test} = require("../../crypto/metamaskCrypto");
interface Props {
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

interface AuctionEnd{
  highestBid:number;
  highestBidder: string;
  totalDeposit: number;
}

const AuctionDetail: React.FC<Props> = ({auction}) => {
  const {
    state: { web3, account, netId }
  } = useWeb3Context();
  const [openBid, setOpenBid] = useState(false);
  const [openReveal, setOpenReveal] = useState(false);
  const [highestBidder, setHighestBidder] = useState("");
  const [highestBid, setHighestBid] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [bids, setBids] = useState<Bid[]>([]);
  function openBidForm() {
      setOpenBid(true);
  }
  function openRevealForm(){
    setOpenReveal(true);
  }
  async function withdrawHandler(){
    if(web3){
      await withDraw(web3, account, auction.address);
      Swal.fire("Withdraw successfully", "", "success");
    }
  }
  async function auctionEndHandler(){
    if(web3){
      const auctionEndInstance = await auctionEnd(web3, account, auction.address);
      setHighestBid(auctionEndInstance.highestBid);
      setHighestBidder(auctionEndInstance.highestBidder);
      setTotalDeposit(auctionEndInstance.totalDeposit);
    }
  }
  useEffect(() => {
    if(web3){
      debugger
      const fetchData = async () => {
      const listBids = await getListBids(web3, account, auction.address);
      setBids(listBids);
      }
      fetchData()
        .catch(console.error);
    }
  }, []);
  return (
    <div className="auction-detail">
        <div>Auction Address: {auction.address}</div>
        <div>Bidding End: {moment(new Date(auction.biddingEnd*1000)).format('MM/DD/YYYY HH:MM:SS')}</div>
        <div>Reveal End: {moment(new Date(auction.revealEnd*1000)).format('MM/DD/YYYY HH:MM:SS')}</div>
        <Button
            inverted
            color="blue"
            onClick={() => openBidForm()}
            >
            Bid
        </Button>
        <Button
            inverted
            color="blue"
            onClick={() => openRevealForm()}
            >
            Reveal
        </Button>
        <Button
            inverted
            color="blue"
            onClick={() => auctionEndHandler()}
            >
            Auction end
        </Button>
        <h4>History of Bids</h4>
        <table className="ui selectable table wallet-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Value</th>
                    <th>Secret</th>
                    <th>Fake</th>
                    <th>Deposit</th>
                  </tr>
                </thead>
                <tbody>
                {bids.length ? (
                    bids.map((bid,index) => {
                      return (
                        <tr key={index}>
                          <td>
                            {index + 1}
                          </td>
                          <td>
                            {bid.value}
                          </td>
                          <td>
                            {bid.secret}
                          </td>
                          <td>
                            {bid.fake?"true":"false"}
                          </td>
                          <td>
                            {bid.deposit}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        There are no records.
                      </td>
                    </tr>
                  )}
                </tbody>
        </table>
        <h3>Result</h3>
        <div><b>Highest bidder: </b><span>{highestBidder}</span></div>
        <div><b>Highest Bid: </b><span>{highestBid}</span></div>
        <div><b>Total Deposit Remain: </b><span>{totalDeposit}</span></div>
        <Button
            inverted
            color="blue"
            onClick={() => withdrawHandler()}
            >
            WithDraw
        </Button>
        
        {openBid ? (
        <BidForm
          closeBidForm={() => setOpenBid(false)}
          auction={auction}
        />
      ) : null}

        {openReveal ? (
        <RevealForm
          closeRevealForm={() => setOpenReveal(false)}
          bids={bids}
          auction={auction}
        />
      ) : null}
    </div>
  );
};

export default AuctionDetail;

