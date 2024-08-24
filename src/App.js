import React, { useEffect, useState } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import './index.css'; 


function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [betAmount, setBetAmount] = useState(0);
  const [selectedChain, setSelectedChain] = useState('solana');
  const [balance, setBalance] = useState('');
  const [result, setResult] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const solanaConnection = new Connection(clusterApiUrl('devnet'));


  const connectSolanaWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        setWalletAddress(address);

        // Connect to the Solana devnet
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const pubkey = new PublicKey(address);

        // Get the balance in SOL
        const walletBalance = await connection.getBalance(pubkey);
        setBalance((walletBalance / 1e9).toFixed(2)); // Convert lamports to SOL
      } catch (err) {
        console.error('Error connecting to Solana wallet:', err);
        setError('Failed to connect Solana wallet. ' + err.message);
      }
    } else {
      setError('Phantom wallet not installed. Please install Phantom.');
    }
  };

  // Function to connect to Ethereum/Polygon Wallet

   const connectEthereumWallet = async () => {
    if (window.ethereum) {
      setLoading(true);
      setError('');
      try {
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        const provider = new ethers.BrowserProvider(window.ethereum);
      
        await provider.send('eth_requestAccounts', []);
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        // Get ETH balance
        const balance = await provider.getBalance(address);
        const balanceInEth = ethers.formatEther(balance);
        // const balanceInEth = hre.ethers.utils.formatEther(balance)
        setBalance(`${balanceInEth} ETH`);
      } catch (err) {
        setError('Failed to connect Ethereum wallet: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('MetaMask is not installed');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setSelectedChain('');
    setWalletAddress('');
    setBalance('');
    setError('');

  };

  // Handle wallet connection based on selected chain
  const connectWallet = async () => {
    setError(''); // Clear any previous errors
    setLoading(true);

    if (selectedChain === 'solana') {
      await connectSolanaWallet();
    } else if (selectedChain === 'ethereum' || selectedChain === 'polygon') {
      await connectEthereumWallet();
    } 

    setLoading(false);
  };


   // Handle changes in selected blockchain
   
   useEffect(() => {
    if (walletAddress) {
      connectWallet(); // Reconnect with the new selected chain
    }
  }, [selectedChain]);

  // Flip Coin Functionality
  const flipCoin = () => {
    const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
    if (outcome === selectedSide) {
      setResult('You win! 🎉');
      updateBalance(betAmount * 2); // Add double the bet amount
    } else {
      setResult('You lose 😢');
    }
  };

    // Update balance based on the outcome
    const updateBalance = (amount) => {
      if (selectedChain === 'solana') {
        // For Solana, convert SOL back to balance
        setBalance((parseFloat(balance) + amount).toFixed(2));
      } else if (selectedChain === 'ethereum' || selectedChain === 'polygon') {
        // For Ethereum/Polygon, convert ETH/MATIC back to balance
        const currentBalance = parseFloat(balance.split(' ')[0]);
        setBalance(`${(currentBalance + ethers.parseEther(amount.toString())).toString()} ${selectedChain === 'ethereum' ? 'ETH' : 'MATIC'}`);
      }
    };

  const handleBet = async () => {
    console.log(betAmount)
    if (betAmount<=0) {
      setError('Please enter a bet amount.');
      return;
    }

    if (betAmount > parseFloat(balance)) {
      setError('Insufficient funds');
      return;
    }

    
    // Handle blockchain bet transaction (mock for now)
    flipCoin();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b bg-[#141618] ">
      <div className="w-full max-w-lg p-6 bg-[#24272a] text-white rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-6">Multi-Blockchain Coinflip Game</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">Select Blockchain</label>

          
          <select
            onChange={(e) => {
              setSelectedChain(e.target.value);
             
            }}
            value={selectedChain}
            className="block w-full px-4 py-2 bg-[#24272a] border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-indigo-300"
          >
            <option value="solana">Solana</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        {!walletAddress ? (
          <button
            onClick={connectWallet}
            disabled={loading}
            className={`w-full py-2 text-white font-bold rounded-lg ${
              loading ? 'bg-[#24272a] cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div>
            <p className="text-lg mb-4">Wallet: {walletAddress}</p>
            <p className="text-lg mb-4">Balance: {balance} {selectedChain === 'solana' ? 'SOL' : selectedChain === 'bitcoin' ? 'BTC' : ''}</p>

            <div className="flex flex-col mb-4">
              <label className="mb-2 font-semibold">Enter Bet Amount</label>
              <input
                type="number"
                value={betAmount}
               
                onChange={(e) => setBetAmount(e.target.value)}
                className="px-4 py-2 border rounded-md text-white  bg-[#24272a]"
              />
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => setSelectedSide('heads')}
                className={`px-4 py-2 rounded-md ${
                  selectedSide === 'heads' ? 'bg-indigo-700 text-white' : 'bg-[#24272a]'
                }`}
              >
                Heads
              </button>
              <button
                onClick={() => setSelectedSide('tails')}
                className={`px-4 py-2 rounded-md ${
                  selectedSide === 'tails' ? 'bg-indigo-700 text-white' : 'bg-[#24272a]'
                }`}
              >
                Tails
              </button>
            </div>

            <button
              onClick={handleBet}
              className="w-full py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
            
            >
              Flip Coin
            </button>

         
            {result && (
              <div className="mt-4 p-4 text-lg font-semibold">
                {result}
              </div>
            )}

            {walletAddress && (
              <button
                onClick={disconnectWallet}
                className="w-full mt-4 py-2 text-white font-bold rounded-lg bg-red-600 hover:bg-red-700"
              >
                Disconnect Wallet
              </button>
            )}

            {error && (
              <p className="mt-4 text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;