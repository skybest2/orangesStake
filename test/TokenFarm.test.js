const Orangetoken = artifacts.require('Orangetoken')
const OrangeStake = artifacts.require('ORANGESTAKE')
const OrangeFarm = artifacts.require('OrangeFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('OrangeFarm', ([owner, investor]) => {
  let orangetoken, orangeStake, orangeFarm

  before(async () => {
    // Load Contracts
    orangetoken = await Orangetoken.new()
    orangeStake = await OrangeStake.new()
    orangeFarm = await OrangeFarm.new(orangeStake.address, orangetoken.address)

    // Transfer all Dapp tokens to farm (1 million)
    await orangetoken.transfer(orangeFarm.address, tokens('100000000000000000'))

    // Send tokens to investor
    await orangetoken.transfer(investor, tokens('100000'), { from: owner })
  })

  describe('Mock DAI deployment', async () => {
    it('has a name', async () => {
      const name = await orangetoken.name()
      assert.equal(name, 'Mock Orange Token')
    })
  })

  describe('Dapp Token deployment', async () => {
    it('has a name', async () => {
      const name = await orangeStake.name()
      assert.equal(name, 'OrangeStake')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await orangeFarm.name()
      assert.equal(name, 'Dapp Orange Farm')
    })

    it('contract has tokens', async () => {
      let balance = await OrangeStake.balanceOf(orangeFarm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming tokens', async () => {

    it('rewards investors for staking mDai tokens', async () => {
      let result

      // Check investor balance before staking
      result = await orangetoken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

      // Stake Mock DAI Tokens
      await orangetoken.approve(orangeFarm.address, tokens('100'), { from: investor })
      await orangeFarm.stakeTokens(tokens('100'), { from: investor })

      // Check staking result
      result = await orangetoken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

      result = await orangetoken.balanceOf(orangeFarm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

      result = await orangetoken.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

      result = await orangeFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      // Issue Tokens
      await orangeFarm.issueTokens({ from: owner })

      // Check balances after issuance
      result = await orangeStake.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct affter issuance')

      // Ensure that only onwer can issue tokens
      await orangeFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake tokens
      await orangeFarm.unstakeTokens({ from: investor })

      // Check results after unstaking
      result = await orangetoken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

      result = await orangetoken.balanceOf(orangeFarm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

      result = await orangeFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

      result = await orangeFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})
