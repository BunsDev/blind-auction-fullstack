import Web3 from "web3";
import BN from "bn.js";
import TruffleContract from "@truffle/contract";
import tokenTruffle from "../build/contracts/W2TCoinERC20.json";
// @ts-ignore
const Token = TruffleContract(tokenTruffle);

interface TokenInformation {
  name: string;
  symbol: string;
  decimals: number;
  balance: number;
  address: string;
}

interface Token {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

export async function importToken(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
) {
  const { address } = params;
  Token.setProvider(web3.currentProvider);
  const token = await Token.at(address);
  return token;
}

export async function getTokenInfo(
  web3: Web3,
  token_address: string,
  account: string
): Promise<TokenInformation> {
  Token.setProvider(web3.currentProvider);
  const token = await Token.at(token_address);
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const balance = await token.balanceOf(account);
  return {
    name,
    symbol,
    decimals: decimals.toNumber(),
    balance: balance.toNumber(),
    address: token_address,
  };
}

export async function getTokenListInfo(
  web3: Web3,
  account: string,
  params: {
    wallet: string;
    tokens: string[];
  }
) {
  const { wallet, tokens } = params;
  const tokenList: TokenInformation[] = [];
  console.log(tokens);
  for (let i = 0; i < tokens.length; i++) {
    const t = await getTokenInfo(web3, tokens[i], wallet);
    tokenList.push(t);
  }
  console.log(tokenList);
  return tokenList;
}

export async function createToken(web3: Web3, account: string, params: Token) {
  const { name, symbol, decimals, totalSupply } = params;

  Token.setProvider(web3.currentProvider);
  const token = await Token.new([name, symbol, decimals, totalSupply], {
    from: account,
  });
}

export async function getBalanceOf(
  web3: Web3,
  account: string,
  params: {
    address: string;
  }
) {
  const { address } = params;

  Token.setProvider(web3.currentProvider);
  return await Token;
}

export async function transferToken(
  web3: Web3,
  account: string,
  params: {
    token: string;
    value: BN;
    destination: string;
  }
) {
  const { token, value, destination } = params;
  Token.setProvider(web3.currentProvider);
  const tk = await Token.at(token);
  await tk.transfer(destination, value, {
    from: account,
  });
  return true;
}
