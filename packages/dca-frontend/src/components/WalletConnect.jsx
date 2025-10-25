import * as React from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
export default function WalletConnect() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const [click, setClick] = useState(false);
  async function handleConnect() {
    console.log(address);
    setClick(() => !click);
  }
  //to disconnect
  if (address) {
    return (
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => disconnect()}
      >
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </button>
    );
  }
  if (!click) {
    return (
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleConnect}
      >
        Connect to wallet
      </button>
    );
  }
  if (click) {
    return (
      <>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={setClick(false)}
        >
          Connect
          <ChevronDown />
        </button>
        <div className="flex flex-col z-100 mt-50 border-2 rounded-2xl p-2.5 ">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 my-2"
            >
              {connector.name}
            </button>
          ))}
        </div>
      </>
    );
  }
}
