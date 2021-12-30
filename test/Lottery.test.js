const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const { interface, bytecode } = require('../compile');

const web3 = new Web3(ganache.provider())

let manager;
let lottery;
beforeEach(async () => {
    const accounts = await web3.eth.getAccounts();
    manager = accounts[0]
    players = [accounts[1], accounts[2], accounts[3]];
    // console.log(accounts);

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [] })
        .send({ from: manager, gas: '1000000'});
});

describe('Lottery', () => {

    it('should initialize properly', async () => {
        assert.equal(manager, await lottery.methods.manager().call());
    });

    describe('enter', () => {
        it('should allow one player to enter', async () => {
            await lottery.methods.enter().send({
                from: players[0],
                value: web3.utils.toWei('0.00012', 'ether')
            });
            const currentPlayers = await lottery.methods.getPlayers().call();

            assert.equal(1, currentPlayers.length);
            assert.equal(players[0], currentPlayers[0])
        });

        it('should allow multiple players to enter', async () => {
            await lottery.methods.enter().send({
                from: players[0],
                value: web3.utils.toWei('0.00012', 'ether')
            });

            await lottery.methods.enter().send({
                from: players[1],
                value: web3.utils.toWei('0.000105', 'ether')
            });

            await lottery.methods.enter().send({
                from: players[2],
                value: web3.utils.toWei('0.0001000695541', 'ether')
            });
            const currentPlayers = await lottery.methods.getPlayers().call();

            assert.equal(3, currentPlayers.length);
            assert.equal(players[0], currentPlayers[0])
            assert.equal(players[1], currentPlayers[1])
            assert.equal(players[2], currentPlayers[2])
        });

        it('should NOT allow player to enter with less payment', async () => {
            try {
                await lottery.methods.enter().send({
                    from: players[0],
                    value: web3.utils.toWei('0.00009999', 'ether')
                });
                assert(false)
            } catch(err){
                assert(err)

                const currentPlayers = await lottery.methods.getPlayers().call();
                assert.equal(0, currentPlayers.length);
            }
        });
    });

    describe('pickWinner', () => {
        it('should pick and transfer all the balance to the winner', async() => {
            await lottery.methods.enter().send({
                from: players[1],
                value: web3.utils.toWei('0.005', 'ether')
            });
            const balanceAfterBet = await web3.eth.getBalance(players[1])
            // console.log(balanceAfterBet)

            await lottery.methods.pickWinner().send({ from: manager });
            const balanceAfterWin = await web3.eth.getBalance(players[1])
            // console.log(balanceAfterWin)

            const prizeWon = (balanceAfterWin - balanceAfterBet);
            assert(prizeWon > web3.utils.toWei('0.0045', 'ether'))
        });

        it('should reset the lottery after picking the winner', async() => {
            await lottery.methods.enter().send({
                from: players[1],
                value: web3.utils.toWei('0.5', 'ether')
            });

            await lottery.methods.pickWinner().send({ from: manager });

            assert.equal(0, (await lottery.methods.getPlayers().call()).length);
        });

        it('should NOT be called by a non-manager', async() => {
            try {
                await lottery.methods.pickWinner().send({ from: players[0] });
                assert(false);
            } catch(err) {
                assert(err);
            }
        });
    });
});