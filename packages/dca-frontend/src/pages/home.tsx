import React, { useState } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreateHealthGuard } from '@/components/create-dca';
import { ActiveDcas } from '@/components/active-dcas';
import { Info } from '@/components/info';

enum Tab {
  CreateHealthGuard = 'create-guard',
  ActiveGuards = 'active-guards',
  Wallet = 'wallet',
}

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CreateHealthGuard);

  return (
    <div
      className={'flex flex-col items-center justify-center min-h-screen min-w-screen bg-gray-100'}
    >
      <Tabs
        data-testid="guard-tabs"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as Tab)}
        className="bg-white p-6 shadow-sm w-full xl:max-w-4xl h-full"
      >
        <TabsList className="mb-4 flex space-x-2 rounded-md bg-gray-200 p-2 w-full">
          <TabsTrigger value={Tab.CreateHealthGuard}>Create Guard</TabsTrigger>
          <TabsTrigger value={Tab.ActiveGuards}>Active Guards</TabsTrigger>
          {/* <TabsTrigger value={Tab.Wallet}>Wallet</TabsTrigger> */}
        </TabsList>

        <TabsContent value={Tab.CreateHealthGuard}>
          <CreateHealthGuard onCreate={() => setActiveTab(Tab.ActiveGuards)} />
        </TabsContent>
        <TabsContent value={Tab.ActiveGuards}>
          <ActiveDcas />
        </TabsContent>
        {/* <TabsContent value={Tab.Wallet}>
          <Wallet />
        </TabsContent> */}
      </Tabs>

      <Info />
    </div>
  );
};
