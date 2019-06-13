const BN = web3.utils.BN;
const Hasher = artifacts.require('Hasher');
const Remittance = artifacts.require('Remittance');
const truffleAssert = require('truffle-assertions');
const {
  assertBigNumEq,
  getBalance,
  getTransactionCost
} = require('./util');


contract('Remittance', function([owner, exchange, attacker]) {
  describe('withdraw', function() {
    const salt = "123";
    const password = "qwerty";
    const value = new BN(1000000);
    let remittance;

    beforeEach(async function() {
      const hasher = await Hasher.deployed();
      const hashedPwd = await hasher.hash(salt, password);
      const params = { from: owner, value };
      remittance = await Remittance.new(exchange, salt, hashedPwd, params);
    });

    describe('when given a wrong password', function() {
      let result;

      beforeEach(async function() {
        result = remittance.withdraw('wrong password', { from: exchange });
      });

      it('fails', async function() {
        await truffleAssert.fails(
          result,
          truffleAssert.ErrorType.REVERT,
          'Invalid password'
        );
      });
    });

    describe('when not called by the exchange', function() {
      let result;

      beforeEach(async function() {
        result = remittance.withdraw(password, { from: attacker });
      });

      it('fails', async function() {
        await truffleAssert.fails(
          result,
          truffleAssert.ErrorType.REVERT,
          'Unauthorized'
        );
      });
    });

    describe('when called by the exchange with the right password', function() {
      let initialBalance, result;

      beforeEach(async function() {
        initialBalance = await getBalance(exchange);
        result = await remittance.withdraw(password, { from: exchange });
      });

      it('succeeds', async function() {
        const finalBalance = await getBalance(exchange);
        const transactionCost = await getTransactionCost(result);
        const expectedBalance = initialBalance.add(value).sub(transactionCost);
        assertBigNumEq(finalBalance, expectedBalance);
      });

      it('emits LogWithdraw event', async function() {
        truffleAssert.eventEmitted(result, 'LogWithdraw');
      });
    });
  });
});
