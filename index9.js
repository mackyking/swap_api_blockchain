const Web3 = require('web3');
const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const PORT = 4000;
const http = require("http");
const server = http.createServer(app);
app.use(bodyParser.json({ limit: "100mb", type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
  })
);
app.post("/swapf3", async (req, res) => {
  try{
  var privateKey = req.body.privateKey;
  var amount = req.body.inputAmount;
  privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const inputAmount = web3.utils.toWei(amount, 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');
//// approval part
const tokenabi = require('./abif3.json');
const tokencontract = new web3.eth.Contract(tokenabi, inputTokenAddress);
web3.eth.accounts.wallet.add(privateKey);
try{
const approves = await tokencontract.methods
     .approve(
      pancakeSwapAddress,
      inputAmount
    )
   .send({ from: account.address, gasLimit: 66720 });
    console.log(approves.transactionHash)
  }
  catch(err){
   return res.status(401).send("Insufficient funds");

  }
/////
console.log(inputAmount,minOutputAmount)

const swapData = pancakeSwapContract.methods.swapExactTokensForTokens(
    inputAmount,
    minOutputAmount,
    [inputTokenAddress, outputTokenAddress],
    account.address,
    Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
  ).encodeABI();


  var block = await web3.eth.getBlock("latest");

var gasLimit = Math.round(block.gasLimit / block.transactions.length);
// console.log(block,gasLimit)
var tx = {
    gas: gasLimit,
    to: pancakeSwapAddress,
    data: swapData
}
web3.eth.accounts.wallet.add(privateKey);
  try{
   const swapTransaction = await pancakeSwapContract.methods
     .swapExactTokensForTokens(
       inputAmount,
       minOutputAmount,
       [inputTokenAddress,outputTokenAddress],
       account.address,
       Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
    )
   .send({ from: account.address, gasLimit: 275833 });
  console.log(swapTransaction.transactionHash)
    res.status(200).send("Swap Successful")
     }
     catch(error){
      console.log("error hai",error)
      return res.status(401).send("Insufficient Funds")
     }
    }
    catch(err){
      return res.status(400).send("Insufficient Funds")
    }

});
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
app.post("/swapf3gasfee", async (req, res) => {
  try{
  var amount = req.body.inputAmount;
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const inputAmount = web3.utils.toWei(amount, 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');

const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))
const gasPrice = await web3.eth.getGasPrice(); 
// const gasEstimate = await uniswapRouter.methods.swapExactTokensForTokens(
//   inputAmount,
//   minOutputAmount,
//   [inputTokenAddress, outputTokenAddress],
//   '0xDcA8C13A13f7d73b6F82B6b0C9d2A0BB4cfB7C25',
//   deadline
// ).estimateGas({ from: '0xDcA8C13A13f7d73b6F82B6b0C9d2A0BB4cfB7C25', gasPrice });

// const gasEstimate = await pancakeSwapContract.estimateGas.swapExactTokensForTokens(
//   inputAmount,
//   0, // minimum output amount, can be set to 0 for now
//   [inputTokenAddress, outputTokenAddress],
//   '0xDcA8C13A13f7d73b6F82B6b0C9d2A0BB4cfB7C25', // your wallet address
//   deadline,
//   { gasPrice }
// );

const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} USDT`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send(err)
    }

});
//////////////////////////////////////////////////////////
app.post("/swapf3ConversionAmount", async (req, res) => {
  try{
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const inputAmount = web3.utils.toWei('1', 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');

const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))

const gasPrice = await web3.eth.getGasPrice();
const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} USDT`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send("Wrong Input")
    }

});
//////////////////////////////////////////////////////////
app.post("/swapusdt",async (req, res) => {
  try{
  var privateKey = req.body.privateKey;
  var amount = req.body.inputAmount;
  privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const outputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const inputAmount = web3.utils.toWei(amount, 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');
//// approval part
const tokenabi = require('./abif3.json');
const tokencontract = new web3.eth.Contract(tokenabi, inputTokenAddress);
web3.eth.accounts.wallet.add(privateKey);
try{
const approves = await tokencontract.methods
     .approve(
      pancakeSwapAddress,
      inputAmount
    )
   .send({ from: account.address, gasLimit: 66720 });
    console.log(approves.transactionHash)
  }
  catch(err){
    return res.status(401).send("Insufficient funds");

  }
/////
console.log(inputAmount,minOutputAmount)

const swapData = await pancakeSwapContract.methods.swapExactTokensForTokens(
    inputAmount,
    minOutputAmount,
    [inputTokenAddress, outputTokenAddress],
    account.address,
    Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
  ).encodeABI();
  


var block = await web3.eth.getBlock("latest");
var gasLimit = Math.round(block.gasLimit / block.transactions.length);
// console.log(block,gasLimit)
var tx = {
    gas: gasLimit,
    to: pancakeSwapAddress,
    data: swapData
}
web3.eth.accounts.wallet.add(privateKey);
  try{
   const swapTransaction = await pancakeSwapContract.methods
     .swapExactTokensForTokens(
       inputAmount,
       minOutputAmount,
       [inputTokenAddress,outputTokenAddress],
       account.address,
       Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
    )
   .send({ from: account.address, gasLimit: 275833 });
  console.log(swapTransaction.transactionHash)
   res.status(200).send("Swap Successful")
     }
     catch(error){
      console.log("error hai",error)
      return res.status(401).send("Insufficient Funds")
     }
    }
    catch(err){
      return res.status(400).send("Insufficient Funds")
    }
});
//////////////////////////////////////////////////////////


app.post("/swapusdtgasfee", async (req, res) => {
  try{
  // var privateKey = req.body.privateKey;
  var amount = req.body.inputAmount;
  // privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const outputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const inputAmount = web3.utils.toWei(amount, 'ether');
// const minOutputAmount = web3.utils.toWei('0', 'ether');


const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))

const gasPrice = await web3.eth.getGasPrice();
const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} F3`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send("Wrong Input")
    }

});

//////////////////////////////////////////////////////////
app.post("/swapusdtConversionAmount", async (req, res) => {
  try{
  // var privateKey = req.body.privateKey;
  // privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const outputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const inputAmount = web3.utils.toWei('1', 'ether');
// const minOutputAmount = web3.utils.toWei('0', 'ether');

const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))

const gasPrice = await web3.eth.getGasPrice();
const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} F3`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send("Wrong Input")
    }

});
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
app.post("/gasFeeF3Transfer", async (req, res) => {
  try{
const web3 = new Web3('https://bsc-dataseed.binance.org/'); // Replace with your desired network URL

// Define the transaction parameters
const tokenAbi = require('./abif3.json'); // Replace with the ABI of your token contract
const contractAddress = '0xfB265e16e882d3d32639253ffcfC4b0a2E861467';
const contract = new web3.eth.Contract(tokenAbi, contractAddress);
const decimals = 18; // Replace with the number of decimal places for your token
const fromAddress = '0x7157830B5f342F7d927b6CE465C5284B9115b558';
const toAddress = req.body.receiverAddress;
const amount = req.body.token; // Replace with the amount of tokens to transfer

// Calculate the token amount with decimal places
const amountWithDecimals = web3.utils.toBN(amount).mul(web3.utils.toBN(10 ** decimals));

// Get the gas required for the token transfer
const gas = await contract.methods.transfer(toAddress, amountWithDecimals).estimateGas({ from: fromAddress });
console.log("Gas "+gas)
// Get the current gas price
const gasPrice = await web3.eth.getGasPrice();

// Calculate the total gas fee in wei
const gasFee = gas * gasPrice;

// Convert gas fee from wei to Ether
const gasFeeInEth = web3.utils.fromWei(gasFee.toString(), 'ether');
console.log(`Gas fee: ${gasFeeInEth} BNB`);
const result = {
  gasFee : gasFeeInEth

}
return res.status(200).send(result)
}
catch(err){
  return res.status(400).send("Insufficient funds")
}
});
//////////////////////////////////////////////////////////
app.post("/gasFeeUSDTTransfer", async (req, res) => {
  try{
const web3 = new Web3('https://bsc-dataseed.binance.org/'); // Replace with your desired network URL

// Define the transaction parameters
const tokenAbi = require('./abif3.json'); // Replace with the ABI of your token contract
const contractAddress = '0x55d398326f99059fF775485246999027B3197955';
const contract = new web3.eth.Contract(tokenAbi, contractAddress);
const decimals = 18; // Replace with the number of decimal places for your token
const fromAddress = '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3';
const toAddress = req.body.receiverAddress;
const amount = req.body.token; // Replace with the amount of tokens to transfer

// Calculate the token amount with decimal places
const amountWithDecimals = web3.utils.toBN(amount).mul(web3.utils.toBN(10 ** decimals));

// Get the gas required for the token transfer
const gas = await contract.methods.transfer(toAddress, amountWithDecimals).estimateGas({ from: fromAddress });
console.log("Gas "+gas)
// Get the current gas price
const gasPrice = await web3.eth.getGasPrice();

// Calculate the total gas fee in wei
const gasFee = gas * gasPrice;

// Convert gas fee from wei to Ether
const gasFeeInEth = web3.utils.fromWei(gasFee.toString(), 'ether');
console.log(`Gas fee: ${gasFeeInEth} BNB`);
const result = {
  gasFee : gasFeeInEth

}
return res.status(200).send(result)
}
catch(err){
  return res.status(400).send("Insufficient funds")
}
});

// async function api(){
// const web3 = new Web3('https://bsc-dataseed.binance.org/');
// const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account.address);
// const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
// const pancakeSwapABI = require('./abi.json');
// const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
// const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
// const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
// const inputAmount = web3.utils.toWei('1', 'ether');
// const minOutputAmount = web3.utils.toWei('0', 'ether');
// //// approval part
// const tokenabi = require('./abif3.json');
// const tokencontract = new web3.eth.Contract(tokenabi, inputTokenAddress);
// web3.eth.accounts.wallet.add(privateKey);
// const approves = await tokencontract.methods
//      .approve(
//       pancakeSwapAddress,
//       inputAmount
//     )
//    .send({ from: account.address, gasLimit: 275833 });
//     console.log(approves.transactionHash)

// /////
// console.log(inputAmount,minOutputAmount)
// const swapData = pancakeSwapContract.methods.swapExactTokensForTokens(
//     inputAmount,
//     minOutputAmount,
//     [inputTokenAddress, outputTokenAddress],
//     account.address,
//     Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
//   ).encodeABI();
//   var block = await web3.eth.getBlock("latest");

// var gasLimit = Math.round(block.gasLimit / block.transactions.length);
// // console.log(block,gasLimit)
// var tx = {
//     gas: gasLimit,
//     to: pancakeSwapAddress,
//     data: swapData
// }
// web3.eth.accounts.wallet.add(privateKey);
//   try{
//    const swapTransaction = await pancakeSwapContract.methods
//      .swapExactTokensForTokens(
//        inputAmount,
//        minOutputAmount,
//        [inputTokenAddress,outputTokenAddress],
//        account.address,
//        Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
//     )
//    .send({ from: account.address, gasLimit: 275833 });
//   console.log(swapTransaction.transactionHash)
//      }
//      catch(error){
//       console.log("error hai",error)
//      }
// }
// api();

server.listen(PORT, () => console.log(`running on port ${PORT}`));


