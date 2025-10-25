import { useAccount, useBalance } from 'wagmi';
import { Navbar } from '@/components/navbar';
import { useHealthFactor } from '@/components/health-factor';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const {
    data: balanceData,
    isLoading: balanceLoading,
    isError: balanceError,
    refetch,
  } = useBalance({
    address: address,
  });
  const { healthFactor, loading: hfLoading, error: hfError } = useHealthFactor();
  return (
    <>
      <Navbar />
      <div className="py-8 ">
        <div className="pl-10 md:pl-44">
          <span className="inline-block text-indigo-600 font-extrabold text-3xl sm:text-4xl tracking-tight">
            Dashboard
          </span>
        </div>

        {!isConnected && (
          <div className="mx-10 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Please connect your wallet to view dashboard
          </div>
        )}

        <div className="flex flex-wrap gap-6 mt-10 justify-center px-10 pt-10">
          <div className="flex flex-col items-start border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6  shadow-md min-h-[180px]">
            <span className="font-semibold text-xl text-gray-900 inline-block">
              MetaMask Balance
            </span>
            {balanceLoading && (
              <span className="font-bold text-3xl md:text-5xl text-blue-900 mt-10">Loading...</span>
            )}
            {balanceError && (
              <span className="font-bold text-3xl md:text-5xl text-red-600 mt-10">Error</span>
            )}
            {!balanceLoading && !balanceError && (
              <span className="font-bold  text-3xl md:text-5xl text-blue-900 mt-10">
                {balanceData?.formatted
                  ? Math.floor(parseFloat(balanceData.formatted) * 100) / 100
                  : '0.00'}{' '}
                <span className="text-2xl md:text-3xl">{balanceData?.symbol}</span>
              </span>
            )}
            {!balanceLoading && !balanceError && (
              <button
                onClick={() => refetch()}
                className="mt-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                Refresh
              </button>
            )}
          </div>

          <div className="flex flex-row items-start justify-between border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6 shadow-md min-h-[180px]">
            <div className="flex flex-col ">
              <span className="font-semibold text-xl text-gray-900">Health Factor</span>
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
    </>
  );
}
