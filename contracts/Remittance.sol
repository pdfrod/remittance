pragma solidity 0.5.0;

import "./Hasher.sol";

contract Remittance {
  address payable private exchange;
  string private salt;
  bytes32 private hashed_pwd;

  event LogWithdraw(address indexed requester, uint amount);

  constructor(
    address payable _exchange,
    string memory _salt,
    bytes32 _hashed_pwd
  ) public payable {
    exchange = _exchange;
    salt = _salt;
    hashed_pwd = _hashed_pwd;
  }

  function withdraw(string calldata password) external returns (uint) {
    uint amount = address(this).balance;
    require(msg.sender == exchange, "Unauthorized");
    require(amount > 0, "Nothing to withdraw");
    bytes32 hashed = Hasher.hash(salt, password);
    require(hashed_pwd == hashed, "Invalid password");
    emit LogWithdraw(msg.sender, amount);
    exchange.transfer(amount);
    return amount;
  }
}
