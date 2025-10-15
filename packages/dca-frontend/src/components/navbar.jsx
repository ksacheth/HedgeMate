import React from 'react';

export const Navbar = () => {
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
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Connect to wallet
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};