// import React from "react";
import { Navbar } from '@/components/navbar';
import { useEffect, useState } from 'react';
import { useHealthFactor } from '@/components/health-factor';
import { Web3Provider } from '@/components/web3-provider';
import { ethers } from 'ethers';
// import { string } from "zod";
export default function Dashboard() {
  const [balance, setBalance] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { healthFactor, loading: hfLoading, error: hfError } = useHealthFactor();
  useEffect(() => {
    async function getAccountDetails() {
      try {
        // Check if MetaMask is available
        //   if (!window.ethereum) {
        //     setError("MetaMask not installed");
        //     return;
        //   }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length != 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await provider.getSigner();
          const addr = await signer.getAddress();
          //converting wei to eth
          const amt = await provider.getBalance(addr);
          const formatData = Number(ethers.utils.formatEther(amt)).toFixed(3);
          console.log(formatData);
          setBalance(formatData);
          // setAddress(addr);
        } else {
          console.log('Not connected');
          setError('MetaMask not connected');
        }
      } catch (err) {
        console.error('Error in getAccountDetails:', err);
        setError('Failed to load account details. Make sure MetaMask is installed and connected.');
      }
    }
    getAccountDetails();
  }, []);
  return (
    <Web3Provider>
      <Navbar />
      <div className="py-8 ">
        <div className="pl-10 md:pl-44">
          <span className="inline-block text-indigo-600 font-extrabold text-3xl sm:text-4xl tracking-tight">
            Dashboard
          </span>
        </div>

        {error && (
          <div className="mx-10 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-6 mt-10 justify-center px-10 pt-10">
          <div className="flex flex-col items-start border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6  shadow-md min-h-[180px]">
            <span className="font-semibold text-xl text-gray-900 inline-block">
              MetaMask Balance
            </span>
            <span className="font-bold  text-3xl md:text-5xl text-blue-900 mt-10">
              {balance} <span className="text-2xl md:text-3xl">ETH</span>
            </span>
          </div>

          <div className="flex flex-row items-start justify-between border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6 shadow-md min-h-[180px]">
            <div className="flex flex-col ">
              <span className="font-semibold text-xl text-gray-900">Health Meter</span>
              <span className="font-bold  text-3xl md:text-5xl text-blue-900 mt-10">
                {hfLoading ? 'Loading...' : healthFactor ? healthFactor.toFixed(2) : 'N/A'}
              </span>
            </div>
            {hfError && <div className="text-sm text-red-600">{hfError}</div>}
          </div>

          <div className="flex flex-col items-start border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6 shadow-md min-h-[180px]">
            <span className="font-semibold text-xl text-gray-900">LitWallet Balance</span>
          </div>
        </div>
      </div>
    </Web3Provider>
  );
}
