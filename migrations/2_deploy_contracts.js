const OrangeStake = artifacts.require('OrangeStake')
const OrangeToken = artifacts.require('OrangeToken')
const OrangeFarm = artifacts.require('OrangeFarm')

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(OrangeToken)
  const orangeToken = await OrangeToken.deployed()

  // Deploy Dapp Token
  await deployer.deploy(OrangeStake, 0)
  const orangeStake = await OrangeStake.deployed()

  // Deploy TokenFarm
  await deployer.deploy(OrangeFarm, orangeStake.address, orangeToken.address)
  const orangeFarm = await OrangeFarm.deployed()

  // Transfer all tokens to TokenFarm (1 million)
  await orangeStake.transfer(orangeFarm.address, '100000000000000')

  // Transfer 100 Mock DAI tokens to investor
  await orangeToken.transfer(accounts[0], '100000000000000000000')
}
