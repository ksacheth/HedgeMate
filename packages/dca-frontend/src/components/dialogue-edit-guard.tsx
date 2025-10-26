import React, { FormEvent, useCallback, useState } from 'react';
import { Pencil } from 'lucide-react';

import { InputAmount } from '@/components/input-amount';
import { SelectFrequency } from '@/components/select-frequency';
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
  const [frequency, setFrequency] = useState<string>(data.triggerPrice);

  const { editGuard } = useBackend();

  const handleEditGuard = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!repayAmount || Number(repayAmount) <= 0) {
        alert('Please enter a positive Guard amount.');
        return;
      }
      if (!frequency) {
        alert('Please select a frequency.');
        return;
      }
      try {
        setLoading(true);
        const updatedGuard = await editGuard(guard._id, {
          name: data.name,
          repayAmount,
          triggerPrice: frequency,
        });
        onUpdate?.(updatedGuard);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [guard, editGuard, frequency, onUpdate, repayAmount, data.name]
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
              value={repayAmount}
              onChange={setrepayAmount}
              disabled={loading}
            />

            <Separator />

            <SelectFrequency
              required
              value={frequency}
              onChange={setFrequency}
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
