const OrangeFarm = artifacts.require('OrangeFarm')

module.exports = async function(callback) {
  let orangeFarm = await OrangeFarm.deployed()
  await orangeFarm.issueTokens()
  // Code goes here...
  console.log("Tokens issued!")
  callback()
}
