import Web3 from "web3";
import BN from "bn.js";
import TruffleContract from "@truffle/contract";
import walletTruffle from "../build/contracts/Wallet.json";
import { getTokenInfo, getTokenListInfo } from "./token";

// @ts-ignore
const Wallet = TruffleContract(walletTruffle);

interface Transaction {
  txIndex: number;
  destination: string;
  value: BN;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isConfirmedByCurrentAccount: boolean;
  token: string;
}

interface Token {
  name: string;
  balance: number;
  decimals: number;
  symbol: string;
  address: string;
}

interface RequestOwner {
  reqIndex: number;
  owner: string;
  numberConfirmations: number;
  data: string;
  executed: boolean;
  addOwner: boolean;
  isConfirmedByCurrentAccount: boolean;
}

interface GetResponse {
  name: string;
  address: string;
  balance: string;
  owners: string[];
  tokens: string[];
  numConfirmationsRequired: number;
  transactionCount: number;
  transactions: Transaction[];
  detailTokens: Token[];
}

interface OwnerResponse {
  owners: string[];
  requests: RequestOwner[];
}

interface TokenResponse {
  tokens: string[];
  detailTokens: Token[];
}

interface TransResponse {
  transactions: Transaction[];
}

export async function get(
  web3: Web3,
  account: string,
  wallet: string
): Promise<GetResponse> {
  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(wallet);
  const balance = web3.utils.fromWei(
    await web3.eth.getBalance(multiSig.address),
    "ether"
  );

  const owners = await multiSig.getOwners();
  const name = await multiSig.name();
  const tokens = await multiSig.getTokens();
  const numConfirmationsRequired = await multiSig.numConfirmationsRequired();
  let detailTokens: Token[] = [];

  return {
    name,
    address: multiSig.address,
    balance: Number(balance).toFixed(4),
    owners,
    tokens,
    numConfirmationsRequired: numConfirmationsRequired.toNumber(),
    transactionCount: 1,
    transactions: [],
    detailTokens,
  };
}

export async function deposit(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    value: BN;
  }
) {
  const { wallet, value } = params;
  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(wallet);

  await multiSig.sendTransaction({ from: account, value });
}

export async function createWallet(
  web3: Web3,
  account: string,
  params: {
    name: string;
    numConfirmationsRequired: number;
    owners: string[];
  }
) {
  const { name, numConfirmationsRequired, owners } = params;
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.new(name, numConfirmationsRequired, owners, {
    from: account,
  });
  const walletDetail = await get(web3, account, wallet.address);
  return walletDetail;
}

export async function importWallet(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
) {
  const { address } = params;
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(address);
  return wallet;
}

export async function addUserToWallet(
  web3: Web3,
  account: string,
  params: {
    address: string;
    wallet: string;
  }
) {
  Wallet.setProvider(web3.currentProvider);
  debugger;
  const wallet = await Wallet.at(params.wallet);
  //TODO: cần check lại
  await wallet.addOwner(params.address, {
    from: account,
  });
  const owners = await wallet.getOwners();
  return owners;
}

export async function getTokensApi(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
): Promise<TokenResponse> {
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(params.address);

  const tokens = await wallet.getTokens();
  let detailTokens: Token[] = [];
  if (tokens.length != 0) console.log(tokens);
  detailTokens = await getTokenListInfo(web3, account, {
    wallet: params.address,
    tokens,
  });

  return {
    tokens,
    detailTokens,
  };
}

export async function getTransactionsApi(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
): Promise<TransResponse> {
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(params.address);
  const transactionCount = await wallet.getTransactionCount();
  const count = transactionCount.toNumber();
  const transactions: Transaction[] = [];
  for (let i = 1; i <= 10; i++) {
    const txIndex = count - i;
    if (txIndex < 0) {
      break;
    }

    const tx = await wallet.getTransaction(txIndex);
    const isConfirmed = await wallet.isConfirmed(txIndex, account);
    transactions.push({
      txIndex,
      destination: tx.destination,
      value: tx.value,
      data: tx.data,
      token: tx.token,
      executed: tx.executed,
      numConfirmations: tx.numConfirmations.toNumber(),
      isConfirmedByCurrentAccount: isConfirmed,
    });
  }
  return {
    transactions,
  };
}

export async function getOwnersApi(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
): Promise<OwnerResponse> {
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(params.address);
  const owners = await wallet.getOwners();
  const reqCount = await wallet.getRequestOwnerCount();
  const count = reqCount.toNumber();
  const requests: RequestOwner[] = [];

  if (count !== 0) {
    for (let i = 1; i <= 10; i++) {
      const reqIndex = count - i;
      if (reqIndex < 0) {
        break;
      }

      const req = await wallet.getRequestOwner(reqIndex);
      const isConfirmed = await wallet.reqConfirmed(reqIndex, account);
      console.log(req.numConfirmations);
      requests.push({
        reqIndex,
        owner: req.owner,
        numberConfirmations: req.numConfirmations.toNumber(),
        data: req.data,
        executed: req.executed,
        addOwner: req.addOwner,
        isConfirmedByCurrentAccount: isConfirmed,
      });
    }
  }
  return {
    owners,
    requests,
  };
}

export async function submitRequestOwner(
  web3: Web3,
  account: string,
  params: {
    address: string;
    owner: string;
    data: string;
    addOwner: boolean;
  }
) {
  const { address, owner, data, addOwner } = params;
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(address);
  await wallet.submitRequestOwner(
    owner,
    new TextEncoder().encode(data),
    addOwner,
    {
      from: account,
    }
  );
}

export async function confirmRequestOwner(
  web3: Web3,
  account: string,
  params: {
    address: string;
    reqIndex: number;
  }
) {
  const { address, reqIndex } = params;
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(address);

  await wallet.confirmRequestOwner(reqIndex, {
    from: account,
  });
}

export async function executeRequestOwner(
  web3: Web3,
  account: string,
  params: {
    address: string;
    reqIndex: number;
  }
) {
  const { address, reqIndex } = params;
  Wallet.setProvider(web3.currentProvider);
  const wallet = await Wallet.at(address);

  await wallet.executeRequestOwner(reqIndex, {
    from: account,
  });
}

export async function getWalletAtAddress(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
) {
  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(params.address);
  return multiSig;
}

export async function submitTransaction(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    destination: string;
    // NOTE: error when passing BN type, so pass string
    value: string;
    data: string;
    token: string;
  }
) {
  const { destination, value, data, token, wallet } = params;

  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(wallet);

  await multiSig.submitTransaction(
    destination,
    value,
    new TextEncoder().encode(data),
    token,
    {
      from: account,
    }
  );
}

export async function confirmTransaction(
  web3: Web3 | null,
  account: string,
  params: {
    wallet: string;
    txIndex: number;
  }
) {
  const { txIndex, wallet } = params;
  if (web3) {
    Wallet.setProvider(web3.currentProvider);
    const multiSig = await Wallet.at(wallet);

    await multiSig.confirmTransaction(txIndex, {
      from: account,
    });
  }
}

export async function revokeConfirmation(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    txIndex: number;
  }
) {
  const { txIndex, wallet } = params;

  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(wallet);

  await multiSig.revokeConfirmation(txIndex, {
    from: account,
  });
}

export async function executeTransaction(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    txIndex: number;
  }
) {
  /*
    Exercise
    Write code that will call executeTransaction on MultiSigWallet contract
    */
  const { txIndex, wallet } = params;

  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(wallet);

  await multiSig.executeTransaction(txIndex, {
    from: account,
  });
}

export async function createToken(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    name: string;
    symbol: string;
    decimals: number;
    total: number;
  }
) {
  const { name, symbol, decimals, total, wallet } = params;

  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.at(wallet);

  const tokenAddress = await multiSig.createToken(
    name,
    symbol,
    decimals,
    total,
    {
      from: account,
    }
  );
  const tokens = await multiSig.getTokens();
  const tokenInfo = await getTokenInfo(web3, tokens[tokens.length - 1], wallet);
  return tokenInfo;
}

export async function getBalanceOfToken(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    addressToken: string;
    addrWallet: string;
  }
) {
  const { addrWallet, addressToken, wallet } = params;

  Wallet.setProvider(web3.currentProvider);
  const multiSig = await Wallet.deployed();

  await multiSig.getBalanceOfToken(addressToken, addrWallet, {
    from: account,
  });
}

export function subscribe(
  web3: Web3,
  address: string,
  callback: (error: Error | null, log: Log | null) => void
) {
  const multiSig = new web3.eth.Contract(Wallet.abi, address);

  const res = multiSig.events.allEvents((error: Error, log: Log) => {
    if (error) {
      callback(error, null);
    } else if (log) {
      callback(null, log);
    }
  });

  return () => res.unsubscribe();
}

interface Deposit {
  event: "Deposit";
  returnValues: {
    sender: string;
    amount: string;
    balance: string;
  };
}

interface SubmitTransaction {
  event: "SubmitTransaction";
  returnValues: {
    owner: string;
    txIndex: string;
    destination: string;
    value: string;
    data: string;
    token: string;
  };
}

interface ConfirmTransaction {
  event: "ConfirmTransaction";
  returnValues: {
    owner: string;
    txIndex: string;
  };
}

interface RevokeConfirmation {
  event: "RevokeConfirmation";
  returnValues: {
    owner: string;
    txIndex: string;
  };
}

/*
Exercise
Define an interface ExecuteTransaction.
The shape of the interface should be the following:
 
{
  event: "ExecuteTransaction";
  returnValues: {
    owner: string;
    txIndex: string;
  };
}
*/
interface ExecuteTransaction {
  event: "ExecuteTransaction";
  returnValues: {
    owner: string;
    txIndex: string;
  };
}

/*
Exercise - Add ExecuteTransaction to Log type
*/
type Log =
  | Deposit
  | SubmitTransaction
  | ConfirmTransaction
  | RevokeConfirmation
  | ExecuteTransaction;
