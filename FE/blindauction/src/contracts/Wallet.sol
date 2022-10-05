// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./W2TCoinERC20.sol";

contract Wallet {
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);
    event AddOwner(address indexed owner);


    string public name;
    uint public numConfirmationsRequired;
    address[] owners;
    address[] tokens;
    mapping(address => bool) isTokenControl;
    mapping(address => bool) isOwner;
    mapping(uint => mapping(address => bool)) public isConfirmed;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        uint numConfirmations;
        bool executed;
        address token;
    }

    Transaction[] public transactions;

    // modifier
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    // Contract constructor
    constructor(string memory _name, uint _numConfirmationsRequired, address[] memory _owners) payable {
        require(_owners.length > 0, "Owners required");
        require(_numConfirmationsRequired > 0 &&
        _numConfirmationsRequired <= _owners.length, "Invalid number of required confirmations");

        for(uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }

        name = _name;
        numConfirmationsRequired = _numConfirmationsRequired;

    }

    receive() external payable {
       emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function addOwner(address _owner) public onlyOwner {
        require(!isOwner[_owner], "Owner not unique");
        owners.push(_owner);
        emit AddOwner(_owner);
    }

    function withdraw(address payable _destination, uint _amount) external onlyOwner {
        require(_amount < address(this).balance, "Ether not enough");
        (bool success, ) = _destination.call{value: _amount}("withdraw eth to {_destination}");
        require(success, "tx failed");
    }
    function submitTransaction(
        address _destination,
        uint _value,
        bytes memory _data,
        address _token
    ) public onlyOwner {
        uint txIndex = transactions.length;
        transactions.push(
            Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 1,
            token: _token
        }));
        isConfirmed[txIndex][msg.sender] = true;
        emit SubmitTransaction(msg.sender, txIndex, _destination, _value, _data);
    }

    function confirmTransaction(uint _txIndex)
     public
     onlyOwner
     txExists(_txIndex)
     notExecuted(_txIndex)
     notConfirmed(_txIndex)
     {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
     }

    function executeTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );

        transaction.executed = true;
        if(transaction.token != address(0)) {
            W2TCoinERC20(transaction.token).transfer(transaction.destination, transaction.value);
        } else {
        (bool success, ) = transaction.destination.call{value: transaction.value}(
            transaction.data
        );
        require(success, "tx failed");
        }
        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }

    function getTokens() public view returns (address[] memory) {
        return tokens;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint _txId) public view returns (
            address destination,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations,
            address token) {
         Transaction storage transaction = transactions[_txId];

         return (
             transaction.destination,
             transaction.value,
             transaction.data,
             transaction.executed,
             transaction.numConfirmations,
             transaction.token
         );
    }

    // Token Controls

    function addTokenManage(address _address) public onlyOwner {
        require(!isTokenControl[_address], "Token not unique");
        isTokenControl[_address] = true;
        tokens.push(_address);
    }
    function createToken(string memory _name,
     string memory _symbol, uint8 _decimals, uint256 _total) public onlyOwner returns(W2TCoinERC20) {
         W2TCoinERC20 coin = new W2TCoinERC20(_name, _symbol, _decimals, _total);
         tokens.push(address(coin));
         return coin;
    }
    function getBalanceOfToken(address _addressToken, address _addrWallet) public view returns(uint256) {
        return W2TCoinERC20(_addressToken).balanceOf(_addrWallet);
    }
}