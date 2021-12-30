pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] private players;

    function Lottery () public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > 0.0001 ether);
        players.push(msg.sender);
    }

    function pickWinner() public managerOnly {
        uint index = random() % players.length;
        players[index].transfer(this.balance);

        players = new address[](0);
    }

    function getPlayers() public view returns(address[]) {
        return players;
    }

    function random() private view returns(uint) {
        return uint(keccak256(block.difficulty, now, players));
    }

    modifier managerOnly() {
        require(msg.sender == manager);
        _;
    }
}