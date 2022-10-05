import Web3 from "web3";
import BN from "bn.js";
import React, {
  useReducer,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useWeb3Context } from "./Web3";
import { get as getMultiSigWallet, subscribe } from "../api/wallet";

interface State {
  name: string;
  tokens: string[];
  address: string;
  balance: string;
  owners: string[];
  numConfirmationsRequired: number;
  transactionCount: number;
  transactions: Transaction[];
  detailTokens: Token[];
  requestOwners: RequestOwner[];
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

interface Token {
  name: string;
  balance: number;
  decimals: number;
  symbol: string;
  address: string;
}

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

const INITIAL_STATE: State = {
  name: "",
  tokens: [],
  address: "",
  balance: "0",
  owners: [],
  numConfirmationsRequired: 0,
  transactionCount: 0,
  transactions: [],
  detailTokens: [],
  requestOwners: [],
};

const SET = "SET";
const UPDATE_BALANCE = "UPDATE_BALANCE";
const ADD_TX = "ADD_TX";
const UPDATE_TX = "UPDATE_TX";
const ADD_OWNER = "ADD_OWNER";
const UPDATE_TOKEN_DETAIL = "UPDATE_TOKEN_DETAIL";
const ADD_TOKEN = "ADD_TOKEN";
const GET_TOKENS = "GET_TOKENS";
const GET_TRANS = "GET_TRANS";
const GET_OWNERS = "GET_OWNERS";

interface Set {
  type: "SET";
  data: {
    address: string;
    balance: string;
    owners: string[];
    numConfirmationsRequired: number;
    transactionCount: number;
    transactions: Transaction[];
    detailTokens: Token[];
    requestOwners: RequestOwner[];
  };
}

interface addToken {
  type: "ADD_TOKEN";
  data: {
    token: Token;
  };
}

interface UpdateBalance {
  type: "UPDATE_BALANCE";
  data: {
    balance: string;
  };
}

interface AddOwner {
  type: "ADD_OWNER";
  data: {
    address: string;
  };
}
interface UpdateTokenDetail {
  type: "UPDATE_TOKEN_DETAIL";
  data: {
    detailTokens: Token[];
  };
}

interface AddTx {
  type: "ADD_TX";
  data: {
    txIndex: string;
    destination: string;
    value: string;
    data: string;
    token: string;
  };
}

interface UpdateTx {
  type: "UPDATE_TX";
  data: {
    account: string;
    txIndex: string;
    owner: string;
    executed?: boolean;
    confirmed?: boolean;
  };
}

interface GetTokens {
  type: "GET_TOKENS";
  data: {
    tokens: string[];
    detailTokens: Token[];
  };
}

interface GetTrans {
  type: "GET_TRANS";
  data: {
    transactions: Transaction[];
  };
}

interface GetOwners {
  type: "GET_OWNERS";
  data: {
    owners: string[];
    requests: RequestOwner[];
  };
}

type Action =
  | Set
  | UpdateBalance
  | AddTx
  | UpdateTx
  | UpdateTokenDetail
  | addToken
  | AddOwner
  | GetTokens
  | GetTrans
  | GetOwners;
function reducer(state: State = INITIAL_STATE, action: Action) {
  switch (action.type) {
    case SET: {
      return {
        ...state,
        ...action.data,
      };
    }
    case ADD_OWNER: {
      return {
        ...state,
        owners: [...state.owners, action.data.address],
      };
    }
    case UPDATE_BALANCE: {
      return {
        ...state,
        balance: action.data.balance,
      };
    }
    case UPDATE_TOKEN_DETAIL: {
      return {
        ...state,
        detailTokens: action.data.detailTokens,
      };
    }
    case ADD_TOKEN: {
      return {
        ...state,
        detailTokens: [...state.detailTokens, action.data.token],
      };
    }
    case ADD_TX: {
      const {
        data: { txIndex, destination, value, data, token },
      } = action;

      const transactions = [
        {
          txIndex: parseInt(txIndex),
          destination,
          value: Web3.utils.toBN(value),
          data,
          executed: false,
          numConfirmations: 0,
          isConfirmedByCurrentAccount: false,
          token: token,
        },
        ...state.transactions,
      ];

      return {
        ...state,
        transactionCount: state.transactionCount + 1,
        transactions,
      };
    }
    case UPDATE_TX: {
      const { data } = action;

      const txIndex = parseInt(data.txIndex);

      const transactions = state.transactions.map((tx) => {
        if (tx.txIndex === txIndex) {
          const updatedTx = {
            ...tx,
          };

          if (data.executed) {
            /*
            Exercise
            Complete the if statement
            Set updatedTx.executed to true
            */
            updatedTx.executed = true;
          }
          if (data.confirmed !== undefined) {
            if (data.confirmed) {
              updatedTx.numConfirmations += 1;
              updatedTx.isConfirmedByCurrentAccount =
                data.owner === data.account;
            } else {
              updatedTx.numConfirmations -= 1;
              if (data.owner === data.account) {
                updatedTx.isConfirmedByCurrentAccount = false;
              }
            }
          }

          return updatedTx;
        }
        return tx;
      });

      return {
        ...state,
        transactions,
      };
    }

    case GET_TOKENS: {
      return {
        ...state,
        tokens: [...action.data.tokens],
        detailTokens: [...action.data.detailTokens],
      };
    }

    case GET_OWNERS: {
      return {
        ...state,
        owners: [...action.data.owners],
        requestOwners: [...action.data.requests],
      };
    }

    case GET_TRANS: {
      return {
        ...state,
        transactions: action.data.transactions,
      };
    }

    default:
      return state;
  }
}

interface SetInputs {
  address: string;
  balance: string;
  owners: string[];
  numConfirmationsRequired: number;
  transactionCount: number;
  transactions: Transaction[];
  detailTokens: Token[];
  requestOwners: RequestOwner[];
}

interface UpdateBalanceInputs {
  balance: string;
}

interface AddOwnerInputs {
  address: string;
}

interface AddTxInputs {
  txIndex: string;
  destination: string;
  value: string;
  data: string;
  token: string;
}

interface AddTokenInputs {
  token: Token;
}

interface UpdateTxInputs {
  account: string;
  txIndex: string;
  owner: string;
  confirmed?: boolean;
  executed?: boolean;
}
interface UpdateTokenDetailInputs {
  detailTokens: Token[];
}

interface OwnerResponseInputs {
  owners: string[];
  requests: RequestOwner[];
}

interface TokenResponseInputs {
  tokens: string[];
  detailTokens: Token[];
}

interface TransResponseInputs {
  transactions: Transaction[];
}

const MultiSigWalletContext = createContext({
  state: INITIAL_STATE,
  set: (_data: SetInputs) => {},
  updateBalance: (_data: UpdateBalanceInputs) => {},
  addTokenCoin: (_data: AddTokenInputs) => {},
  addTx: (_data: AddTxInputs) => {},
  updateTx: (_data: UpdateTxInputs) => {},
  addOwner: (_data: AddOwnerInputs) => {},
  getTokens: (_data: TokenResponseInputs) => {},
  getOwners: (_data: OwnerResponseInputs) => {},
  getTransactions: (_data: TransResponseInputs) => {},
  updateTokenDetailList: (_data: UpdateTokenDetailInputs) => {},
});

export function useMultiSigWalletContext() {
  return useContext(MultiSigWalletContext);
}

interface ProviderProps {}

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  function set(data: SetInputs) {
    dispatch({
      type: SET,
      data,
    });
  }

  function updateBalance(data: UpdateBalanceInputs) {
    dispatch({
      type: UPDATE_BALANCE,
      data,
    });
  }
  function addOwner(data: AddOwnerInputs) {
    dispatch({
      type: ADD_OWNER,
      data,
    });
  }

  function addTokenCoin(data: AddTokenInputs) {
    dispatch({
      type: ADD_TOKEN,
      data,
    });
  }

  function updateTokenDetailList(data: UpdateTokenDetailInputs) {
    dispatch({
      type: UPDATE_TOKEN_DETAIL,
      data,
    });
  }

  function addTx(data: AddTxInputs) {
    dispatch({
      type: ADD_TX,
      data,
    });
  }

  function updateTx(data: UpdateTxInputs) {
    dispatch({
      type: UPDATE_TX,
      data,
    });
  }

  function getTokens(data: TokenResponseInputs) {
    dispatch({
      type: GET_TOKENS,
      data,
    });
  }

  function getTransactions(data: TransResponseInputs) {
    dispatch({
      type: GET_TRANS,
      data,
    });
  }

  function getOwners(data: OwnerResponseInputs) {
    dispatch({
      type: GET_OWNERS,
      data,
    });
  }

  return (
    <MultiSigWalletContext.Provider
      value={useMemo(
        () => ({
          state,
          set,
          updateBalance,
          addTx,
          updateTx,
          addOwner,
          getOwners,
          getTransactions,
          getTokens,
          addTokenCoin,
          updateTokenDetailList,
        }),
        [state]
      )}
    >
      {children}
    </MultiSigWalletContext.Provider>
  );
};

export function Updater() {
  const {
    state: { web3, account },
  } = useWeb3Context();
  const { state, set, updateBalance, updateTokenDetailList, addTx, updateTx } =
    useMultiSigWalletContext();
  // useEffect(() => {
  //   async function get(web3: Web3, account: string, wallet: string) {
  //     try {
  //       const data = await getMultiSigWallet(web3, account, wallet);
  //       set(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }

  //   if (web3) {
  //     get(web3, account, "addd");
  //   }
  // }, [state.address]);

  // useEffect(() => {
  //   async function get(
  //     web3: Web3,
  //     account: string,
  //     wallet: string,
  //     tokens: string[]
  //   ) {
  //     try {
  //       const tokenList = await getTokenListInfo(web3, account, {
  //         wallet,
  //         tokens: tokens,
  //       });
  //       console.log(tokenList);
  //       updateTokenDetailList({ detailTokens: tokenList });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  //   if (web3) {
  //     get(web3, account, state.address, state.tokens);
  //   }
  // }, [state.address]);

  useEffect(() => {
    if (web3 && state.address) {
      return subscribe(web3, state.address, (error, log) => {
        if (error) {
          console.error(error);
        } else if (log) {
          switch (log.event) {
            case "Deposit":
              updateBalance(log.returnValues);
              break;
            case "SubmitTransaction":
              addTx(log.returnValues);
              break;
            case "ConfirmTransaction":
              updateTx({
                ...log.returnValues,
                confirmed: true,
                account,
              });
              break;
            case "RevokeConfirmation":
              updateTx({
                ...log.returnValues,
                confirmed: false,
                account,
              });
              break;
            /*
            Exercise
            Create a case statement for "ExecuteTransaction"
            Call updateTx with the following input
            {
              ...log.returnValues,
              executed: true,
              account,
            }
            */
            case "ExecuteTransaction":
              updateTx({
                ...log.returnValues,
                executed: true,
                account,
              });
              break;
            default:
              console.log(log);
          }
        }
      });
    }
  }, [web3, state.address]);
  return null;
}
