import React, { Component } from 'react'
import Web3 from 'web3'
import OrangeToken from '../abis/OrangeToken.json'
import OrangeStake from '../abis/OrangeStake.json'
import OrangeFarm from '../abis/OrangeFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load DaiToken
    const orangeTokenData = OrangeToken.networks[networkId]
    if(orangeTokenData) {
      const orangeToken = new web3.eth.Contract(OrangeToken.abi, orangeTokenData.address)
      this.setState({ orangeToken })
      let orangeTokenBalance = await orangeToken.methods.balanceOf(this.state.account).call()
      this.setState({ orangeTokenBalance: orangeTokenBalance.toString() })
    } else {
      window.alert('OrangeToken contract not deployed to detected network.')
    }

    // Load DappToken
    const orangeStakeData = OrangeStake.networks[networkId]
    if(orangeStakeData) {
      const OrangeStake = new web3.eth.Contract(OrangeStake.abi, OrangeStakeData.address)
      this.setState({ OrangeStake })
      let OrangeStakeBalance = await OrangeStake.methods.balanceOf(this.state.account).call()
      this.setState({ OrangeStakeBalance: OrangeStakeBalance.toString() })
    } else {
      window.alert('OrangeStake contract not deployed to detected network.')
    }

    // Load TokenFarm
    const orangeFarmData = OrangeFarm.networks[networkId]
    if(orangeFarmData) {
      const orangeFarm = new web3.eth.Contract(OrangeFarm.abi, orangeFarmData.address)
      this.setState({ orangeFarm })
      let stakingBalance = await orangeFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('orangeFarm contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.orangeToken.methods.approve(this.state.orangeFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.OrangeFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.OrangeFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      orangeToken: {},
      orangeStake: {},
      OrangeFarm: {},
      orangeTokenBalance: '0',
      orangeStakeBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        orangeTokenBalance={this.state.orangeTokenBalance}
        orangeStakeBalance={this.state.orangeStakeBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
