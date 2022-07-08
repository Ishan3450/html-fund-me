import { ethers } from "../../ethers-5.6.esm.min.js"
import { fundMeAbi, fundMeAddress } from "./constants.js"

const connectWalletButton = document.getElementById("connectWalletButton")
const fundButton = document.getElementById("fundButton")
const getBalanceButton = document.getElementById("getBalanceButton")
const withdrawButton = document.getElementById("withdrawButton")

// on click events
connectWalletButton.onclick = connect_wallet
fundButton.onclick = fund
getBalanceButton.onclick = getBalance
withdrawButton.onclick = withdraw



// functions
function setElement(elementId, classes, message) {
    document.getElementById(elementId).className = classes
    document.getElementById(elementId).innerHTML = message
}

function setTransactionDetails(transactionReceipt){
    document.getElementById("trFrom").innerHTML = `<b>From : </b> ${transactionReceipt.from}`
    document.getElementById("trTo").innerHTML = `<b>To : </b> ${transactionReceipt.to}`
    document.getElementById("trConfirmations").innerHTML = `<b>Total Confirmations : </b> ${transactionReceipt.confirmations}`
    const gasUsedConverted = (transactionReceipt.gasUsed).toString()
    document.getElementById("trGasUsed").innerHTML = `<b>Total Gas Used : </b> ${gasUsedConverted}`
    document.getElementById("trTxHash").innerHTML = `<b>Transaction Hash : </b> ${transactionReceipt.transactionHash}`
}


function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`)
    // listen for the transaction to be mined

    // events
    // take 2 arguements 1 is hash and 2 is a listener
    // it will work as once hash of transactionResponse happens then perform the code in the listener

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(transactionReceipt)
            setTransactionDetails(transactionReceipt)
        })
        resolve()
    })
}

// to connect metamsk wallet
async function connect_wallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            window.ethereum.request({ method: "eth_requestAccounts" })

            // prints number of accounts connected to our site
            const accounts = await ethereum.request({ method: "eth_accounts" })
            console.log(accounts)
        } catch (error) {
            console.log(error)
            setElement(
                "connectWalletButton",
                "btn btn-danger",
                "Something went wrong !!"
            )
        }
        setElement("connectWalletButton", "btn btn-success", "Connected")
    } else {
        setElement("connectWalletButton", "btn btn-danger", "No MetaMask Found")
    }
}

async function fund() {
    // to ge the value of the input textbox
    const ethAmount = document.getElementById("ethAmountInput").value
    console.log(`Funding with ${ethAmount} ETHs...`)

    if (typeof window.ethereum !== "undefined") {
        setElement("connectWalletButton", "btn btn-success", "Connected")

        //* To basically interact with the smart contract we need :
        // 1. provider / connection to the blockchain
        // 2. singer / wallet with eths and gas
        // 3. smart contract in solidity
        // 4. ABI and Address of the deployed contract

        // Web3Provider basically wraps various browser functions like metamask and all
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const fundMeInstance = new ethers.Contract(
            fundMeAddress,
            fundMeAbi,
            signer
        )

        //* below three lines are only the new change to connect to our contract
        //* from now on we can interact with our smart contract as we do earlier

        try {
            const transactionResponse = await fundMeInstance.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done !!")
        } catch (error) {
            console.log(error)
        }
    } else {
        setElement("connectWalletButton", "btn btn-danger", "No MetaMask Found")
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined"){
        setElement("connectWalletButton", "btn btn-success", "Connected")

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(fundMeAddress)
        

        document.getElementById("ethBalance").innerHTML = "Total Amount Raised : " + ethers.utils.formatEther(balance) + " Ethers"

    }
}

async function withdraw() {
    if (typeof window.ethereum != "undefined"){
        console.log("Withdrawing....")

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const fundMeInstance = new ethers.Contract(fundMeAddress, fundMeAbi, signer)

        try {
            const transactionResponse = await fundMeInstance.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            document.getElementById("withdrawAck").innerHTML = "Successfully withdrawed the amount !!"
        }catch(error){
            console.log(error)
        }
    }
}


