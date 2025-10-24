import React from 'react';
import { ethers } from 'ethers';
import { useState,useEffect } from 'react';
import { ChevronDown,ChevronUp } from 'lucide-react';
export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [showDrop,setShowDrop]=useState(false);
  const SEPOLIA_CHAIN_ID = "0xaa36a7";
  useEffect(() => {
    async function getAcc() {
      const address = await window.ethereum.request({ method: 'eth_accounts' });
      if (address != 0) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        setAddress(shortAddress);
        setIsConnected(true);
      }
    }
    getAcc();
  }, []);

  async function disconnect(){
    try{
        setIsConnected(false);
        setAddress("");
        await window.ethereum.request({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]});
        setShowDrop(false);
        window.location.reload();
    }
    catch(err){
        console.log(err);
        setError("Unable to Disconnect");
    }
  }

  async function connect() {
    if (!window.ethereum.isMetaMask) setError('MetaMask is not available');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setIsConnected(true);
      setAddress(address);
      window.location.reload();
    } catch (err) {
      console.log(err);
      setError(err);
    }
  }
      if(isConnected){
        return (
          <>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
              <span onClick={() => setShowDrop(!showDrop)}>
                {showDrop && <ChevronUp />}
                {!showDrop && <ChevronDown />}
              </span>
              {isConnected && showDrop && address && (
                <div className="absolute flex flex-col items-center max-w-xs border-2 rounded-2xl bg-white my-2 mt-30 shadow-lg">
                  <button
                    onClick={disconnect}
                    type="button"
                    className="inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </button>
          </>
        );
      }
  
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={connect}
      >
        Connect to wallet
      </button>
    </>
  );
}
