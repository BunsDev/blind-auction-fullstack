import React, { useState } from "react";
import Web3 from "web3";
import BN from "bn.js";
import { Button, Form } from "semantic-ui-react";
import { useWeb3Context } from "../../contexts/Web3";
import { submitRequestOwner } from "../../api/wallet";
import useAsync from "../../components/useAsync";
import "../../css/form/depositform.css";
import Swal from "sweetalert2";
import { useMultiSigWalletContext } from "../../contexts/MultiSigWallet";

interface Props {
  closeAddUserForm: () => void;
  wallet: string;
}

interface addOwnerParams {
  address: string;
  owner: string;
  data: string;
  addOwner: boolean;
}

const AddUserForm: React.FC<Props> = ({ closeAddUserForm, wallet }) => {
  const {
    state: { web3, account },
  } = useWeb3Context();

  const { addOwner } = useMultiSigWalletContext();
  const [owner, setOwner] = useState("");
  function changeOwner(e: React.ChangeEvent<HTMLInputElement>) {
    setOwner(e.target.value);
  }

  const { pending: addOwnerPending, call: addOwnerCall } = useAsync<
    addOwnerParams,
    void
  >(async (params) => {
    if (!web3) {
      throw new Error("No web3");
    }
    return await submitRequestOwner(web3, account, params);
  });

  async function addUser() {
    if (addOwnerPending) {
      return;
    }

    if (!web3) {
      Swal.fire("You must unlock Metamask", "", "warning");
      return;
    }
    const { error, data } = await addOwnerCall({
      address: wallet,
      owner,
      data: "Add new request owner",
      addOwner: true,
    });
    if (error) {
      Swal.fire(`Error: ${error.message}`, "", "error");
    } else {
      addOwner({ address: owner });
      closeAddUserForm();
      Swal.fire("Add owner successfully", "", "success");
    }
  }

  return (
    <div className="base-form-mask">
      <div className="deposit-form">
        <div className="form-header">
          <h1>Add Owner</h1>
        </div>
        <div className="form-body">
          <Form>
            <Form.Field>
              <label>Address</label>
              <Form.Input
                placeholder=""
                type="text"
                value={owner}
                onChange={changeOwner}
              />
            </Form.Field>
          </Form>
        </div>

        <div className="form-footer">
          <Button
            color="blue"
            disabled={addOwnerPending}
            loading={addOwnerPending}
            onClick={addUser}
          >
            Add
          </Button>
          <Button
            color="red"
            disabled={addOwnerPending}
            loading={addOwnerPending}
            onClick={closeAddUserForm}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
