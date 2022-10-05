import Web3 from "web3";
import BN from "bn.js";
import TruffleContract from "@truffle/contract";
import blindAuctionJson from "../build/contracts/BlindAuction.json";
import { decryptCustom, encryptCustom } from "../crypto/metamaskCrypto";
import { decryptText } from "../crypto/crypto2";
import { debug } from "console";

// @ts-ignore
const blindAuction = TruffleContract(blindAuctionJson);

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

export async function createBlindAuction(
    web3: Web3,
    account: string,
    params: {
        biddingTime: number;
        revealTime: number;
        beneficiaryAddress: string;
    }
  ) {
    const { biddingTime, revealTime, beneficiaryAddress } = params;
    blindAuction.setProvider(web3.currentProvider);
    const auctionInstance = await blindAuction.new(biddingTime, revealTime, beneficiaryAddress, {
      from: account,
    });
    const blindAuctionDetail = await getAuctionDetail(web3, account, auctionInstance.address);
    return blindAuctionDetail;
}


export async function getAuctionDetail(
    web3: Web3,
    account: string,
    auctionAddress: string
  ): Promise<Auction> {
    blindAuction.setProvider(web3.currentProvider);
    const auctionInstance = await blindAuction.at(auctionAddress);
    const biddingEnd = await auctionInstance.biddingEnd();
    const revealEnd = await auctionInstance.revealEnd();
    debugger
    const beneficiaryAddress = await auctionInstance.beneficiary();
    const bids = await auctionInstance.getListBids(account);
    return {
        biddingEnd:biddingEnd.toNumber(),
        revealEnd:revealEnd.toNumber(),
        beneficiary:beneficiaryAddress,
        address:auctionAddress
    };
  }

export async function bidAuction(
  web3: Web3,
  account: string,
  bid: Bid,
  auctionAddress: string
){
  blindAuction.setProvider(web3.currentProvider);
  const auctionInstance = await blindAuction.at(auctionAddress);
  const secretText = web3.utils.asciiToHex(bid.secret);
  let blindedBid = web3.utils.keccak256(web3.eth.abi.encodeParameters(['uint256', 'bool', 'bytes32'],[bid.value,bid.fake,secretText]))
  const encryptText = await encryptCustom(JSON.stringify(bid),account);
  //bid 
  const bidAuction = await auctionInstance.bid(blindedBid,encryptText, { from: account, value:bid.deposit });
  
}

export async function getListBids( 
  web3: Web3,
  account: string,
  auctionAddress:string){
    blindAuction.setProvider(web3.currentProvider);
    const auctionInstance = await blindAuction.at(auctionAddress);
    let listBidsDecrypt = [];
    const listBids = await auctionInstance.getListBids(account);
    debugger
    for(let i=0; i < listBids.length; ++i){
      let decryptText = await decryptCustom(listBids[i].encrypt, account);
      listBidsDecrypt.push(JSON.parse(decryptText));
    }
    return listBidsDecrypt;
}

export async function reveal(
  web3: Web3,
  account: string,
  bids: Bid[],
  auctionAddress: string
){
  blindAuction.setProvider(web3.currentProvider);
  const auctionInstance = await blindAuction.at(auctionAddress);
  let valueList = [];
  let fakeList = [];
  let secretList = [];
  
  for (let index = 0; index < bids.length; index++) {
    const element = bids[index];
    valueList.push(bids[index].value);
    fakeList.push(bids[index].fake);
    secretList.push(web3.utils.asciiToHex(bids[index].secret));
  }
  await auctionInstance.reveal(valueList, fakeList, secretList,{from:account});
  
}

export async function  auctionEnd(
  web3: Web3,
  account: string,
  auctionAddress: string
):Promise<AuctionEnd>{
  blindAuction.setProvider(web3.currentProvider);
  const auctionInstance = await blindAuction.at(auctionAddress);
  const highestBidder = await auctionInstance.highestBidder();
  const highestBid = await auctionInstance.highestBid();
  const ended = await auctionInstance.ended();
  debugger
  const totalDeposit = await auctionInstance.getTotalDeposit();
  if(!ended){
    await auctionInstance.auctionEnd({from:account});
  }
  return {
    highestBid: highestBid,
    highestBidder: highestBidder,
    totalDeposit: totalDeposit
  }
}

export async function  withDraw(
  web3: Web3,
  account: string,
  auctionAddress: string
){
  blindAuction.setProvider(web3.currentProvider);
  const auctionInstance = await blindAuction.at(auctionAddress);
  await auctionInstance.withdraw({from:account});
}
  



