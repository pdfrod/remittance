const Migrations = artifacts.require('Migrations');
const Hasher = artifacts.require('Hasher');
const Remittance = artifacts.require('Remittance');
const { randomHex } = require('web3').utils;

module.exports = function(deployer, network, accounts) {
  const salt = randomHex(4);
  const password = randomHex(32);

  console.log('Salt:', salt);
  console.log('Password:', password);

  deployer.deploy(Migrations);
  deployer.deploy(Hasher);
  deployer.link(Hasher, Remittance);
  deployer.then(() =>
    Hasher.deployed()
  ).then(hasher =>
    hasher.hash(salt, password)
  ).then(hashedPwd =>
    deployer.deploy(Remittance, accounts[1], salt, hashedPwd)
  );
};
