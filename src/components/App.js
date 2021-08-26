import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'

import Identicon from 'identicon.js'
import SocialNetwork from '../abis/SocialNetwork.json'
import NavBar from './NavBar'
import Main from './Main'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true,
    }
    this.createPost = this.createPost.bind(this)
    this.setLoading = this.setLoading.bind(this)
    this.tipPost = this.tipPost.bind(this)
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  setLoading() {
    this.setState({ loading: !this.state.loading })
  }

  createPost(content) {
    this.setLoading()
    this.state.socialNetwork.methods
      .createPosts(content)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.state({loading: false})
      })
  }

  tipPost(id, tipAmount) {
    this.setLoading()
    this.state.socialNetwork.methods
      .tipPost(id)
      .send({ from: this.state.account, value: tipAmount })
      .once('receipt', (receipt) => {
        this.state({loading: false})
      })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      )
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    //load networkId
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId]
    if (networkData) {
      const socialNetwork = web3.eth.Contract(
        SocialNetwork.abi,
        networkData.address
      )
      this.setState({ socialNetwork })
      const postCount = await socialNetwork.methods.postCount().call()
      this.setState({ postCount })
      for (let index = 1; index <= postCount; index++) {
        const post = await socialNetwork.methods.posts(index).call()
        this.setState({
          posts: [...this.state.posts, post],
        })
      }
      this.setState({
        posts: this.state.posts.sort((a,b) =>  b.tipAmount - a.tipAmount)
      })
      this.setLoading()
    } else {
      window.alert('SocialNetwork contract not deployed to current network.')
    }
  }

  render() {
    return (
      <div>
        <NavBar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
          posts={this.state.posts}
          createPost={this.createPost} 
          tipPost={this.tipPost} 
          />
        )}
      </div>
    )
  }
}

export default App
