pragma solidity 0.5.0;

library Hasher {
  function hash(
    string calldata salt,
    string calldata password
  ) external pure returns (bytes32) {
    return keccak256(abi.encodePacked(salt, password));
  }
}
