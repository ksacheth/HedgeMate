import { useState } from 'react';
import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/config/env';

export function RepayTest() {
  const { authInfo } = useJwtContext();
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleRepay = async () => {
    if (!authInfo?.pkp.ethAddress || !repayAmount) {
      setError('Please enter an amount and connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Get the JWT token
      const jwtToken = authInfo.jwt;

      // Call the backend repay endpoint
      const response = await fetch(`${env.VITE_BACKEND_URL}/test-repay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: authInfo.pkp.ethAddress,
          repayAmount: repayAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Repay failed');
      }

      setSuccess(`Repay successful! Tx Hash: ${data.data?.txHash || 'N/A'}`);
      setRepayAmount('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error: ${errorMessage}`);
      console.error('Repay error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start border-2 border-amber-100 rounded-2xl w-full md:w-xl p-6 shadow-md bg-amber-50">
      <span className="font-semibold text-xl text-gray-900 mb-4">Test Repay (PKP Wallet)</span>

      <div className="w-full space-y-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Repay Amount (USDC)</label>
          <Input
            type="number"
            placeholder="Enter amount to repay"
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.target.value)}
            disabled={isLoading}
            step="0.01"
          />
        </div>

        <Button
          onClick={handleRepay}
          disabled={isLoading || !repayAmount}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {isLoading ? 'Processing...' : 'Repay USDC'}
        </Button>

        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
