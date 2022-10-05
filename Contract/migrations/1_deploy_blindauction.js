var BlindAuction = artifacts.require("BlindAuction");

module.exports = function(deployer, network, accounts) {
  console.log('network: '+ network);
  console.log('ds tai khoan: '+ accounts);
  const blindTime = 86400;
  const revealTime = 16000;
  // deployment steps
  deployer.deploy(BlindAuction,blindTime, revealTime, accounts[0]);
};