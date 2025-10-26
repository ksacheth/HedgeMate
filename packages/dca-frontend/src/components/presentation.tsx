import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBackend } from '@/hooks/useBackend';

export const Presentation: React.FC = () => {
  const { getJwt } = useBackend();

  return (
    <div className="w-full max-w-2xl">
      <Card
        data-testid="presentation"
        className="w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm"
      >
        <CardHeader className="text-center space-y-2">
          <CardTitle
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: '30px',
              fontWeight: 500,
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            AAVE Health Guardian
          </CardTitle>
          <CardDescription
            className="uppercase tracking-widest"
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              color: '#FF4205',
            }}
          >
            Automated Loan Protection
          </CardDescription>
        </CardHeader>

        <Separator className="my-3" />

        <CardContent className="space-y-5">
          <p
            className="text-center text-base"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Protect your AAVE loans from liquidation with automated debt repayment.
          </p>

          <p
            className="text-sm text-center"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            This application monitors your AAVE positions and automatically repays debt when
            collateral prices drop to your trigger level, keeping your health factor safe.
          </p>

          <p
            className="text-sm text-center"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            To get started, connect with Vincent to manage your health guards.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-3 pt-4">
          <Button onClick={getJwt} variant="default" size="lg">
            Connect with Vincent
          </Button>
          <a
            href="https://docs.heyvincent.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-80 underline"
            style={{
              color: '#FF4205',
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}
          >
            Learn more about Vincent →
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};
