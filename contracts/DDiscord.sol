// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DDiscord is ERC721 {
    address public owner;

    using Counters for Counters.Counter;
    Counters.Counter public totalChannels;
    Counters.Counter public totalSupply;

    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

    mapping(uint256 => Channel) public channels;
    mapping(uint256 => mapping(address => bool)) public hasJoined;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    function createChannel(
        string memory _name,
        uint256 _cost
    ) public onlyOwner {
        totalChannels.increment();
        uint256 _channelID = totalChannels.current();
        channels[_channelID] = Channel(_channelID, _name, _cost);
    }

    function getChannel(uint256 _id) public view returns (Channel memory) {
        return channels[_id];
    }

    function mint(uint256 _id) public payable {
        // Join Channel
        //Mint NFT
        require(_id != 0);
        require(_id <= totalChannels.current());
        require(hasJoined[_id][msg.sender] == false);
        require(msg.value >= channels[_id].cost);

        hasJoined[_id][msg.sender] = true;
        totalSupply.increment();
        uint256 _currentSupply = totalSupply.current();

        _safeMint(msg.sender, _currentSupply);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
