// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract BlindAuction {
    struct Bid {
        bytes32 blindedBid;
        uint256 deposit;
        string encrypt;
    }

    address payable public beneficiary;
    uint256 public biddingEnd;
    uint256 public revealEnd;
    bool public ended;

    mapping(address => Bid[]) public bids;
    mapping(address => uint256) public totalDeposit;
    address public highestBidder;
    uint256 public highestBid;

    event AuctionEnded(address winner, uint256 highestBid);

    error TooEarly(uint256 time);

    error TooLate(uint256 time);

    error AuctionEndAlreadyCalled();

    modifier onlyBefore(uint256 time) {
        if (block.timestamp >= time) revert TooLate(time);
        _;
    }
    modifier onlyAfter(uint256 time) {
        if (block.timestamp <= time) revert TooEarly(time);
        _;
    }

    constructor(
        uint256 biddingTime,
        uint256 revealTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        biddingEnd = block.timestamp + biddingTime;
        revealEnd = biddingEnd + revealTime;
    }

    function bid(bytes32 blindedBid, string memory encryptKey)
        external
        payable
        onlyBefore(biddingEnd)
    {
        bids[msg.sender].push(
            Bid({
                blindedBid: blindedBid,
                deposit: msg.value,
                encrypt: encryptKey
            })
        );
        totalDeposit[msg.sender] += msg.value;
    }

    function reveal(
        uint256[] calldata values,
        bool[] calldata fakes,
        bytes32[] calldata secrets
    ) external onlyAfter(biddingEnd) onlyBefore(revealEnd) {
        uint256 length = bids[msg.sender].length;
        require(values.length == length);
        require(fakes.length == length);
        require(secrets.length == length);

        for (uint256 i = 0; i < length; i++) {
            Bid storage bidToCheck = bids[msg.sender][i];
            (uint256 value, bool fake, bytes32 secret) = (
                values[i],
                fakes[i],
                secrets[i]
            );
            if (fake) {
                continue;
            }
            if (
                bidToCheck.blindedBid !=
                keccak256(abi.encode(value, fake, secret))
            ) {
                continue;
            }
            if (bidToCheck.deposit >= value) {
                placeBid(msg.sender, value);
            }
            bidToCheck.blindedBid = bytes32(0);
        }
    }

    function withdraw() external onlyAfter(revealEnd) {
        uint256 amount = totalDeposit[msg.sender];
        if (msg.sender == highestBidder) {
            amount -= highestBid;
        }

        if (amount > 0) {
            totalDeposit[msg.sender] = 0;
            payable(msg.sender).transfer(amount);
        }
    }

    function auctionEnd() external onlyAfter(revealEnd) {
        if (ended) revert AuctionEndAlreadyCalled();
        emit AuctionEnded(highestBidder, highestBid);
        ended = true;
        beneficiary.transfer(highestBid);
    }

    function placeBid(address bidder, uint256 value)
        internal
        returns (bool success)
    {
        if (value <= highestBid) {
            return false;
        }
        highestBid = value;
        highestBidder = bidder;
        return true;
    }

    function getListBids(address bidder) public view returns (Bid[] memory) {
        return bids[bidder];
    }

    function getTotalDeposit() public view returns (uint256) {
        return totalDeposit[msg.sender];
    }
}
