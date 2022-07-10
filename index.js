import { ethers } from "./ethers-5.6.esm.min.js"
import { abi } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("getBalanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

const contractAddress = "0x8bd3025776Ae62676d5B98a33FAfcb9d2710a1BE"

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connected"
        console.log("connect!")
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please install Metamask!"
        console.log("No Metamask!")
    }
    getBalance()
}

// fund function
async function getBalance() {
    if (window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        const contractBalance = ethers.utils.formatEther(balance)
        console.log(contractBalance)
        document.getElementById(
            "balanceDisplay"
        ).innerHTML = `Contract Balance : ${contractBalance} Eth`
    }
}

async function fund(ethAmount) {
    const ethAmmount = document.getElementById("ethAmmount").value
    console.log("Finding with ${ethAmount}")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (e) {
            console.log(e)
        }

        document.getElementById("ethAmmount").value = ""
        getBalance()
    }
}

async function withdraw() {
    console.log("Withdrawing...")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (e) {
            console.log(e)
        }

        getBalance()
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log("Mining ${transactionResponse.hash}...")
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                "Complete with ${transactionReceipt.confirmations} confirmmations"
            )
            resolve()
        })
    })
}
