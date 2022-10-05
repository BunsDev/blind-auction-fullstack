import React, { useState } from "react";
import {
  Menu,
  Segment,
  Message,
  Button,
  Icon,
  Tab,
  Card,
} from "semantic-ui-react";
import { useMultiSigWalletContext } from "../../contexts/MultiSigWallet";
import { useWeb3Context } from "../../contexts/Web3";
import BN from "bn.js";
import "../../css/components/walletdetail.css";
import useAsync from "../../components/useAsync";
import {
  confirmTransaction,
  executeTransaction,
  getOwnersApi,
  getTokensApi,
  getTransactionsApi,
  submitRequestOwner,
  confirmRequestOwner,
  executeRequestOwner,
} from "../../api/wallet";
import CreateTokenForm from "../Form/CreateToken";
import DepositTokenForm from "../Form/DepositToken";
import WithdrawTokenForm from "../Form/WithDrawToken";
import Swal from "sweetalert2";

import AddUserForm from "../Form/AddUser";

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

interface Props {
  wallet: string;
}

interface ConfirmTransParams {
  wallet: string;
  txIndex: number;
}

interface ExecuteTransParams {
  wallet: string;
  txIndex: number;
}

interface GetOwnerParams {
  address: string;
}

interface GetTokenParams {
  address: string;
}

interface GetTransParams {
  address: string;
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

interface KickOwnerParams {
  address: string;
  owner: string;
  data: string;
  addOwner: boolean;
}

interface ConfirmRequestParams {
  address: string;
  reqIndex: number;
}

interface ExeRequestParams {
  address: string;
  reqIndex: number;
}

const WalletDetail: React.FC<Props> = ({ wallet }) => {
  const {
    state: { web3, account, balance, netId },
    updateAccount,
  } = useWeb3Context();

  const {
    state: { address },
    getOwners,
    getTokens,
    getTransactions,
  } = useMultiSigWalletContext();
  const { state } = useMultiSigWalletContext();
  const [showRegionOwner, setShowRegionOwners] = useState(false);
  const [showRegionToken, setShowRegionToken] = useState(false);
  const [showRegionTrans, setShowRegionTrans] = useState(false);
  const [createTokenFormOpen, setCreateTokenForm] = useState(false);
  const [depositTokenFormOpen, setDepositTokenForm] = useState(false);
  const [withdrawTokenFormOpen, setWithdrawTokenForm] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [tokenSelect, setTokenSelect] = useState("");

  const { pending: confirmPending, call: confirmCall } = useAsync<
    ConfirmTransParams,
    void
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await confirmTransaction(web3, account, params);
  });

  const { pending: executePending, call: executeCall } = useAsync<
    ExecuteTransParams,
    void
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await executeTransaction(web3, account, params);
  });

  const { pending: getOwnerPending, call: getOwnerCall } = useAsync<
    GetOwnerParams,
    OwnerResponse
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await getOwnersApi(web3, account, params);
  });

  const { pending: getTransPending, call: getTransCall } = useAsync<
    GetTransParams,
    TransResponse
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await getTransactionsApi(web3, account, params);
  });

  const { pending: getTokenPending, call: getTokenCall } = useAsync<
    GetTokenParams,
    TokenResponse
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await getTokensApi(web3, account, params);
  });

  const { pending: kickOwnerPending, call: kickOwnerCall } = useAsync<
    KickOwnerParams,
    void
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await submitRequestOwner(web3, account, params);
  });

  const { pending: confirmReqPending, call: confirmReqCall } = useAsync<
    ConfirmRequestParams,
    void
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await confirmRequestOwner(web3, account, params);
  });

  const { pending: executeReqPending, call: executeReqCall } = useAsync<
    ExeRequestParams,
    void
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await executeRequestOwner(web3, account, params);
  });

  async function confirmTransaction1(txIndex: number) {
    if (confirmPending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unclock Metamask", "", "error");
      return;
    }
    const { error, data } = await confirmCall({
      txIndex,
      wallet: address,
    });
    if (error) {
      Swal.fire(`Error: ${error.message}`, "", "error");
    } else {
      Swal.fire(`Confirm successfully`, "", "success");
    }
  }

  async function executeTransaction1(txIndex: number) {
    if (executePending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unclock Metamask", "", "error");
      return;
    }
    const { error, data } = await executeCall({
      txIndex,
      wallet: address,
    });
    if (error) {
      Swal.fire(`Error: ${error.message}`, "", "error");
    } else {
      Swal.fire(`Execute successfully`, "", "success");
    }
  }

  function depositTokenWallet(token: string) {
    setTokenSelect(token);
    setDepositTokenForm(true);
  }

  function withdrawTokenWallet(token: string) {
    setTokenSelect(token);
    setWithdrawTokenForm(true);
  }

  async function openRegionOwner() {
    if (!showRegionOwner) {
      if (getOwnerPending) {
        return;
      }

      if (!web3) {
        Swal.fire("You must unlock Metamask", "", "error");
        return;
      }
      const { error, data } = await getOwnerCall({
        address,
      });
      if (error) {
        Swal.fire(`Error: ${error.message}`, "", "error");
      } else {
        if (data) {
          getOwners(data);
        }
        setShowRegionOwners(true);
      }
    } else {
      setShowRegionOwners(false);
    }
  }

  async function openRegionToken() {
    if (!showRegionToken) {
      if (getTokenPending) {
        return;
      }

      if (!web3) {
        Swal.fire("You must unlock Metamask", "", "error");
        return;
      }
      const { error, data } = await getTokenCall({
        address,
      });
      if (error) {
        Swal.fire(`Error: ${error.message}`, "", "error");
      } else {
        if (data) {
          getTokens(data);
        }
        setShowRegionToken(true);
      }
    } else {
      setShowRegionToken(false);
    }
  }

  async function openRegionTransaction() {
    if (!showRegionTrans) {
      if (getTransPending) {
        return;
      }

      if (!web3) {
        Swal.fire("You must unlock Metamask", "", "error");
        return;
      }
      const { error, data } = await getTransCall({
        address,
      });
      if (error) {
        Swal.fire(`Error: ${error.message}`, "", "error");
      } else {
        if (data) {
          getTransactions(data);
        }
        setShowRegionTrans(true);
      }
    } else {
      setShowRegionTrans(false);
    }
  }

  async function revokeOwner(owner: string) {
    if (kickOwnerPending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unlock Metamask", "", "error");
      return;
    }
    const { error, data } = await kickOwnerCall({
      address,
      owner,
      data: "Kick Owner",
      addOwner: false,
    });
    if (error) {
      Swal.fire(`Error: ${error.message}`, "", "error");
    } else {
      Swal.fire(`Create request kick successfully`, "", "success");
    }
  }

  async function confirmRequestOwnerHandler(reqIndex: number) {
    if (confirmReqPending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unlock Metamask", "", "error");
      return;
    }
    const { error, data } = await confirmReqCall({
      address,
      reqIndex,
    });
    if (error) {
      Swal.fire(`Error: ${error.message}`, "", "error");
    } else {
      Swal.fire(`Confirm Request Owner successfully`, "", "success");
    }
  }

  async function executeRequestOwnerHandler(reqIndex: number) {
    if (executeReqPending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unlock Metamask", "", "error");
      return;
    }
    const { error, data } = await executeReqCall({
      address,
      reqIndex,
    });
    if (error) {
      Swal.fire(`Error: ${error.message}`, "", "error");
    } else {
      Swal.fire(`execute Request Owner successfully`, "", "success");
    }
  }

  return (
    <div className="wallet-detail">
      <div className="wallet-detail-header">
        <h1>
          Name: {state.name}
          <Tab />
          Balance: {state.balance} ETH
        </h1>
        <div className="address"> Address Wallet: {state.address}</div>
      </div>
      <div className="wallet-detail-body">
        <div className="wallet-detail-region">
          <div className="wallet-detail-section">
            <div className="section-left">
              <Icon name="users" circular />
              <b>Owners</b>
            </div>
            <div className="section-right">
              <Button
                color="blue"
                content="Owner"
                icon="add"
                labelPosition="left"
                inverted
                onClick={() => setUserOpen(true)}
              />
              <Button
                inverted
                color="blue"
                className="button-down"
                onClick={openRegionOwner}
              >
                <Icon name="angle down" size="large" />
              </Button>
            </div>
          </div>
          {showRegionOwner ? (
            <>
              <div className="region-content">
                <table className="ui selectable table wallet-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.owners.map((owner, i) => (
                      <tr>
                        <td>Account {i}</td>
                        <td>{owner}</td>
                        <td>
                          <Button
                            color="blue"
                            onClick={() => revokeOwner(owner)}
                            size="tiny"
                          >
                            Kick
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="region-content">
                <table className="ui selectable table wallet-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Confirmed</th>
                      <th>Data</th>
                      <th>Executed</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.requestOwners.length ? (
                      state.requestOwners.map((request, i) => (
                        <tr>
                          <td>{request.reqIndex}</td>
                          <td>{request.owner}</td>
                          <td>{request.numberConfirmations}</td>
                          <td>{request.data}</td>
                          <td>{request.executed ? "success" : "pending"}</td>
                          <td>{request.addOwner ? "Add new" : "Kick owner"}</td>
                          <td>
                            {!request.isConfirmedByCurrentAccount ? (
                              <Button
                                color="blue"
                                onClick={() =>
                                  confirmRequestOwnerHandler(request.reqIndex)
                                }
                                size="tiny"
                              >
                                Confirm
                              </Button>
                            ) : null}

                            {request.numberConfirmations ==
                              state.owners.length && !request.executed ? (
                              <Button
                                color="grey"
                                onClick={() =>
                                  executeRequestOwnerHandler(request.reqIndex)
                                }
                                size="tiny"
                              >
                                execute
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center" }}>
                          Chua co yeu cau owner nao!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        <div className="wallet-detail-region">
          <div className="wallet-detail-section">
            <div className="section-left">
              <Icon name="money bill alternate" circular />
              Tokens
            </div>
            <div className="section-right">
              <Button
                color="blue"
                content="Token"
                icon="add"
                labelPosition="left"
                inverted
                onClick={() => setCreateTokenForm(true)}
              />
              <Button
                inverted
                color="blue"
                className="button-down"
                onClick={openRegionToken}
              >
                <Icon name="angle down" size="large" />
              </Button>
            </div>
          </div>
          {showRegionToken ? (
            <div className="region-content">
              <table className="ui selectable table wallet-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Balance</th>
                    <th>Symbol</th>
                    <th>Decimals</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.detailTokens.length ? (
                    state.detailTokens.map((token) => {
                      return (
                        <tr key={token.address}>
                          <td>{token.name}</td>
                          <td>{token.address}</td>
                          <td>{token.balance}</td>
                          <td>{token.symbol}</td>
                          <td>{token.decimals}</td>
                          <td>
                            <Button
                              color="blue"
                              onClick={() => depositTokenWallet(token.address)}
                              size="tiny"
                            >
                              Deposit
                            </Button>
                            <Button
                              color="grey"
                              onClick={() => withdrawTokenWallet(token.address)}
                              size="tiny"
                            >
                              Withdraw
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        Ví chưa quản lý token nào!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
          {createTokenFormOpen ? (
            <CreateTokenForm
              closeCreateTokenForm={() => setCreateTokenForm(false)}
              wallet={address}
            />
          ) : null}
          {depositTokenFormOpen ? (
            <DepositTokenForm
              closeDepositTokenForm={() => setDepositTokenForm(false)}
              wallet={address}
              token={tokenSelect}
            />
          ) : null}
          {withdrawTokenFormOpen ? (
            <WithdrawTokenForm
              closeWithDrawTokenForm={() => setWithdrawTokenForm(false)}
              wallet={address}
              token={tokenSelect}
            />
          ) : null}
        </div>
        <div className="wallet-detail-region">
          <div className="wallet-detail-section">
            <div className="section-left">
              <Icon name="dollar sign" circular />
              Transactions
            </div>
            <div className="section-right">
              <Button
                color="blue"
                content="Trans"
                icon="add"
                labelPosition="left"
                inverted
              />
              <Button
                inverted
                color="blue"
                className="button-down"
                onClick={openRegionTransaction}
              >
                <Icon name="angle down" size="large" />
              </Button>
            </div>
          </div>
          {showRegionTrans ? (
            <div className="region-content">
              <table className="ui selectable table wallet-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Destination</th>
                    <th>Value</th>
                    <th>Token</th>
                    <th>Data/Subject</th>
                    <th>Confirmations</th>
                    <th>Executed</th>
                  </tr>
                </thead>
                <tbody>
                  {state.transactions.length ? (
                    state.transactions.map((transaction, i) => (
                      <tr key={transaction.txIndex}>
                        <td>{i + 1}</td>
                        <td>{transaction.destination}</td>
                        <td>
                          {web3
                            ? Number(
                                web3.utils.fromWei(
                                  Number(transaction.value).toString(),
                                  "ether"
                                )
                              ).toFixed(4)
                            : 0}
                          ETH
                        </td>
                        <td>{transaction.token}</td>
                        <td>{transaction.data}</td>
                        <td>
                          <div className="confirm-cell">
                            <div>{transaction.numConfirmations}</div>
                            <div>
                              {!transaction.isConfirmedByCurrentAccount &&
                              !transaction.executed ? (
                                <Button
                                  color="blue"
                                  onClick={() =>
                                    confirmTransaction1(transaction.txIndex)
                                  }
                                  size="tiny"
                                >
                                  Confirm
                                </Button>
                              ) : null}
                              {transaction.numConfirmations >=
                                state.numConfirmationsRequired &&
                              !transaction.executed ? (
                                <Button
                                  color="blue"
                                  onClick={() =>
                                    executeTransaction1(transaction.txIndex)
                                  }
                                  size="tiny"
                                >
                                  Execute
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td>{transaction.executed ? "Executed" : "Pending"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        Chưa có giao dịch nào được thực hiện!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
      {userOpen ? (
        <AddUserForm
          closeAddUserForm={() => setUserOpen(false)}
          wallet={wallet}
        />
      ) : null}
    </div>
  );
};

export default WalletDetail;
