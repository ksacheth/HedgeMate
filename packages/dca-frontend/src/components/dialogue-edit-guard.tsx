import React, { FormEvent, useCallback, useState } from 'react';
import { Pencil } from 'lucide-react';

import { InputAmount } from '@/components/input-amount';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Guard, useBackend } from '@/hooks/useBackend';

export interface EditDialogProps {
  guard: Guard;
  onUpdate?: (updatedGuard: Guard) => void;
}

export const DialogueEditGuard: React.FC<EditDialogProps> = ({ guard, onUpdate }) => {
  const { data } = guard;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [repayAmount, setrepayAmount] = useState<string>(String(data.repayAmount));
  const [triggerPrice, setTriggerPrice] = useState<string>(String(data.triggerPrice));

  const { editGuard } = useBackend();

  const handleEditGuard = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!repayAmount || Number(repayAmount) <= 0) {
        alert('Please enter a positive repay amount.');
        return;
      }
      if (!triggerPrice || Number(triggerPrice) <= 0) {
        alert('Please enter a positive trigger price.');
        return;
      }
      try {
        setLoading(true);
        const updatedGuard = await editGuard(guard._id, {
          chainId: 11155111, // Sepolia testnet
          collateralAsset: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH on Sepolia
          debtAsset: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // USDC on Sepolia
          protocol: 'AaveV3',
          repayAmount,
          triggerPrice,
        });
        onUpdate?.(updatedGuard);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [guard, editGuard, triggerPrice, onUpdate, repayAmount]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleEditGuard}>
          <DialogHeader>
            <DialogTitle>Edit Guard Schedule</DialogTitle>
            <DialogDescription>
              Make changes to your Guard Schedule here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Box className="grid gap-4 py-4">
            <InputAmount
              required
              label="Repay Amount"
              value={repayAmount}
              onChange={setrepayAmount}
              disabled={loading}
            />

            <Separator />

            <InputAmount
              required
              label="Trigger Price (ETH)"
              value={triggerPrice}
              onChange={setTriggerPrice}
              disabled={loading}
            />
          </Box>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
