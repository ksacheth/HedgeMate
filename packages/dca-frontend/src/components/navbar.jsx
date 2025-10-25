import { ConnectKitButton } from 'connectkit';
import React from 'react';
// import WalletConnect from './WalletConnect';
import { useNavigate } from 'react-router-dom';
export const Navbar = () => {
  const navigate=useNavigate();
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <img src="/HedgeMate-logo.svg" alt="HedgeMate" className="h-8 w-auto" />
              <span className="font-semibold text-lg text-gray-800">HedgeMate</span>
            </a>
          </div>
          <div className="flex items-center">
            <div
              className="font-semibold hover:scale-110 text-gray-800 cursor-pointer mx-5"
              onClick={() => navigate('/')}
            >
              Home
            </div>
            <div
              className="font-semibold hover:scale-110 text-gray-800 cursor-pointer mr-8"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </div>
            <ConnectKitButton />
            {/* <WalletConnect/> */}
            {/* <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect to wallet
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};
