const SocialNetwork = artifacts.require('./SocialNetwork.sol')

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Web3 from 'web3'

chai.use(chaiAsPromised).should()

contract('SocialNetwork', async ([deployer, author, tipper]) => {
  let socialNetwork

  before(async () => {
    socialNetwork = await SocialNetwork.deployed()
  })

  describe('deployment', async () => {
    it('deploys succesfully', async () => {
      const address = await socialNetwork.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await socialNetwork.name()
      assert.notEqual(name, '')
      assert.notEqual(name, null)
      assert.equal(name, 'Derick | Social Network')
    })
  })

  describe('posts', async () => {
    let result, postCount

    before(async () => {
      result = await socialNetwork.createPosts(
        'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
        { from: author }
      )
      postCount = await socialNetwork.postCount()
    })

    it('create posts', async () => {
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(
        event.content,
        'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
        'content is correct'
      )
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // INVALID POST
      await socialNetwork.createPosts('', { from: author }).should.be.rejected
    })

    it('list posts', async () => {
      const post = await socialNetwork.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(
        post.content,
        'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
        'content is correct'
      )
      assert.equal(post.tipAmount, '0', 'tip amount is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('tip posts', async () => {
      // Track the author's balance before
      let oldBalanceValue
      oldBalanceValue = await web3.eth.getBalance(author)
      oldBalanceValue = new web3.utils.BN(oldBalanceValue)

      result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(
        event.content,
        'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
        'content is correct'
      )
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      
      // Track the author's new balance
      let newBalanceValue
      newBalanceValue = await web3.eth.getBalance(author)
      newBalanceValue = new web3.utils.BN(newBalanceValue)

     
      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const expectedBalance = oldBalanceValue.add(tipAmount)

      assert.equal(newBalanceValue.toString(), expectedBalance.toString())


      // Failure test: tries to tip a post that doesn't exist
      await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;

    })
  })
})
