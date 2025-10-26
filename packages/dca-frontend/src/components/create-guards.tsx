import React, { useState, FormEvent } from 'react';

import { useBackend } from '@/hooks/useBackend';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_VALUE, InputAmount } from '@/components/input-amount';

export interface CreateHealthGuardProps {
  onCreate?: () => void;
}

export const CreateHealthGuard: React.FC<CreateHealthGuardProps> = ({ onCreate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [triggerPrice, setTriggerPrice] = useState<string>(DEFAULT_VALUE);
  const [repayAmount, setRepayAmount] = useState<string>(DEFAULT_VALUE);
  const { createGuard } = useBackend();

  const handleCreateHealthGuard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!triggerPrice || Number(triggerPrice) <= 0) {
      alert('Please enter a positive trigger price.');
      return;
    }
    if (!repayAmount || Number(repayAmount) <= 0) {
      alert('Please enter a positive repay amount.');
      return;
    }

    try {
      setLoading(true);
      await createGuard({
        chainId: 11155111, // Sepolia testnet
        collateralAsset: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH on Sepolia
        debtAsset: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // USDC on Sepolia
        protocol: 'AaveV3',
        repayAmount: repayAmount,
        triggerPrice: triggerPrice,
      });
      onCreate?.();
    } catch (error) {
      console.error('Error creating health guard:', error);
      alert('Error creating health guard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between bg-white p-6 shadow-sm">
      <form onSubmit={handleCreateHealthGuard}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AAVE Health Guardian</CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            Protect your AAVE position from liquidation by automatically repaying debt when
            collateral prices drop.
            <br />
            <br />
            <strong>How It Works:</strong>
            <br />
            Set a trigger price for your collateral (e.g., ETH). When the price drops to your
            trigger level, our bot automatically repays a portion of your debt, improving your
            health factor and protecting you from liquidation.
            <br />
            <br />
            The agent operates using permissions securely delegated by you, following strict rules
            you establish during setup—such as authorized spending limits. These onchain rules are
            cryptographically enforced by{' '}
            <a
              href="https://litprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Lit Protocol
            </a>
            , ensuring every action stays within your guardrails. With Vincent, you achieve powerful
            automation combined with secure, permissioned execution.
            <br />
            <br />
            <strong>Note:</strong> Ensure your wallet has sufficient stablecoins approved for
            repayment.
          </CardDescription>
        </CardHeader>

        <Separator className="my-8" />

        <CardContent className="my-8">
          <Box className="space-y-4">
            <InputAmount
              required
              label="Trigger Price (ETH)"
              value={triggerPrice}
              onChange={setTriggerPrice}
              disabled={loading}
            />

            <Separator />

            <InputAmount
              required
              label="Repay Amount"
              value={repayAmount}
              onChange={setRepayAmount}
              disabled={loading}
            />
          </Box>
        </CardContent>

        <Separator className="my-8" />

        <CardFooter className="flex justify-center">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Creating Guard...' : 'Create Health Guard'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
