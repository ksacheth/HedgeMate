import React from 'react';

export const Hero = () => {
	return (
		<section className="bg-transparent py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Left: head */}
					<div>
                        <div className="">
                            <span className="inline-block text-indigo-600 font-extrabold text-2xl sm:text-3xl tracking-tight">
                                HedgeMate
                            </span>
                        </div>

						<h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900">
							Automate Your
							<br />
							DeFi Safety.
						</h1>

						<p className="mt-6 text-lg text-gray-600 max-w-xl">
							Protect your Aave positions and stay safe from liquidations — even when you're
							offline.
						</p>

						<div className="mt-8 flex items-center space-x-4">
							<button className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
								Connect Wallet
							</button>
							<button className="inline-flex items-center px-5 py-3 bg-white border rounded-lg text-gray-700 shadow-sm hover:bg-gray-50">
								Learn More
							</button>
						</div>
					</div>

					{/* Right: illustration / card */}
					<div className="flex justify-center lg:justify-end">
						<div className="w-full max-w-sm space-y-4">
							<div className="bg-white rounded-lg p-4 shadow">
								<div className="text-sm font-semibold text-gray-800">Auto-hedging</div>
								<div className="text-xs text-gray-500">Automatically hedge risky positions</div>
							</div>

							<div className="bg-white rounded-lg p-4 shadow">
								<div className="text-sm font-semibold text-gray-800">Real-time monitoring</div>
								<div className="text-xs text-gray-500">24/7 monitoring and alerts</div>
							</div>

							<div className="bg-white rounded-lg p-4 shadow">
								<div className="text-sm font-semibold text-gray-800">Easy setup</div>
								<div className="text-xs text-gray-500">Set rules in minutes</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;

