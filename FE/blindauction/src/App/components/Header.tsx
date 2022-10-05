import React, { useState } from "react";
import { Menu, Segment, Message, Button } from "semantic-ui-react";
import { unlockAccount } from "../../api/web3";
import { useWeb3Context } from "../../contexts/Web3";
import useAsync from "../../components/useAsync";
import "../../css/components/header.css";
import Network from "../Network";
import { useAppContext } from "../../contexts/App";
interface Props {
  backMainDisplay: () => void;
}
const Header: React.FC<Props> = ({ backMainDisplay }) => {
  const {
    state: { account, balance, netId },
    updateAccount,
  } = useWeb3Context();

  const {
    state: { auctions },
    set,
  } = useAppContext();

  const { pending, error, call } = useAsync(unlockAccount);
  async function onClickConnect() {
    const { error, data } = await call(null);

    if (error) {
      console.error(error);
    }
    if (data) {
      const result = localStorage.getItem("wallet");
      if (result) {
        const wallet = JSON.parse(result);
        console.log(wallet);
        set(wallet);
      }
      updateAccount(data);
    }
  }
  const [activeItem, setActiveItem] = useState("wallets");

  function handleItemClick(name: any) {
    setActiveItem(name);
    backMainDisplay();
  }
  return (
    <div className="header">
      <Menu pointing inverted>
        <div className="wallet-icon"></div>
        <Menu.Item
          name="Blind Auction"
          active={activeItem === "wallets"}
          onClick={() => handleItemClick("wallets")}
        />
        {/* <Menu.Item
          name="transactions"
          active={activeItem === "transactions"}
          onClick={() => handleItemClick("transactions")}
        /> */}
        <Menu.Menu position="right" className="infor-account">
          {account ? (
            <>
              <div className="info-item">
                Account: <h4>{account}</h4>
              </div>
            </>
          ) : (
            <div></div>
          )}
          {account ? (
            <>
              <div className="info-item">
                Balance: <h4>{balance} ETH</h4>
              </div>
              <Network netId={netId} />
            </>
          ) : (
            <>
              <Menu.Item
                name="Unlock Metamask"
                active={activeItem === "logout"}
                onClick={() => onClickConnect()}
              />
            </>
          )}
        </Menu.Menu>
      </Menu>

      {/* <Segment>
            <img src='https://react.semantic-ui.com/images/wireframe/media-paragraph.png' />
          </Segment> */}
    </div>
  );
};

export default Header;
