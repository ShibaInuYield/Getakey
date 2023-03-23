// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract SimpleStorage {
  uint256 value;

  function getNumber() external view returns (uint256) {
    return value;
  }

  function setNumber(uint256 newValue) external {
    value = newValue;
  }
}
