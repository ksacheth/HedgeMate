import React from 'react';

const Feature = ({ index, title, children }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm text-center">
    <div className="h-12 w-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-3 text-indigo-700 font-semibold">
      {index}
    </div>
    <div className="font-semibold text-gray-800">{title}</div>
    <div className="text-xs text-gray-500 mt-2">{children}</div>
  </div>
);

export const HowItWorks = () => {
  return (
  <section className="py-6 bg-transparent">
      <div className="max-w-5xl mx-auto px-4">
  <h2 className="text-center text-2xl font-bold mb-4">How It Works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Feature index={1} title="Connect your wallet">Connect securely to start protecting positions</Feature>
          <Feature index={2} title="Set defensive rules">Create simple rules for liquidation protection</Feature>
          <Feature index={3} title="Stay protected automatically">Our service monitors and acts for you</Feature>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
