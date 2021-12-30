const HdWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
require('dotenv').config();

const MNEMONIC = process.env.MNEMONIC;
const INFURA_URL = process.env.INFURA_URL;
const provider = new HdWalletProvider(MNEMONIC, INFURA_URL);
const web3 = new Web3(provider)

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()
    // console.log(accounts);

    const contract = await new web3.eth.Contract(JSON.parse(interface))
                        .deploy({ data: bytecode })
                        .send({ from: accounts[0], gas: '1000000' });
    console.log("ABI: ", interface, "\n");
    console.log("Successfully deployed: ", contract.options.address);
    provider.engine.stop();
};
deploy();
