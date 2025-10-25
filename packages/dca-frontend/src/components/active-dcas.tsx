import React, { useCallback, useEffect, useState } from 'react';
import { Delete, Pause, Play } from 'lucide-react';

import { useBackend, Guard } from '@/hooks/useBackend';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DialogueEditGuard } from '@/components/dialogue-edit-dca';
import { FREQUENCIES } from '@/components/select-frequency';
import { Spinner } from '@/components/ui/spinner';
import { DialogueGuardFailedDetails } from '@/components/dialogue-dca-failed-details';

import { cn } from '@/lib/utils';

function renderGuardSchedulesTable(
  activeGuards: Guard[],
  handleUpdatedGuard: (updatedGuard: Guard) => Promise<void>,
  handleDisableGuard: (guardId: string) => Promise<void>,
  handleEnableGuard: (guardId: string) => Promise<void>,
  handleDeleteGuard: (guardId: string) => Promise<void>
) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount (USD)</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {activeGuards.map((guard) => {
          const {
            disabled,
            lastFinishedAt,
            failedAt,
            _id: uniqueKey,
            data: { repayAmount, triggerPrice, updatedAt },
          } = guard;

          const failedAfterLastRun =
            failedAt && lastFinishedAt ? new Date(lastFinishedAt) <= new Date(failedAt) : false;

          const active = !disabled;
          return (
            <TableRow key={uniqueKey}>
              <TableCell>${repayAmount}</TableCell>
              <TableCell>
                {FREQUENCIES.find((freq) => freq.value === triggerPrice)?.label || triggerPrice}
              </TableCell>
              <TableCell>{new Date(updatedAt).toLocaleString()}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    active && !failedAfterLastRun && 'text-green-500',
                    active && failedAfterLastRun && 'text-red-500'
                  )}
                >
                  {!active ? 'Inactive' : failedAfterLastRun ? 'Failed' : 'Active'}
                  {failedAfterLastRun && <DialogueGuardFailedDetails guard={guard} />}
                </span>
              </TableCell>
              <TableCell>
                <Box className="flex flex-row items-center justify-end gap-2 p-1">
                  <DialogueEditGuard guard={guard} onUpdate={handleUpdatedGuard} />
                  {active ? (
                    <Button variant="destructive" onClick={() => handleDisableGuard(guard._id)}>
                      <Pause />
                    </Button>
                  ) : (
                    <Button variant="default" onClick={() => handleEnableGuard(guard._id)}>
                      <Play />
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => handleDeleteGuard(guard._id)}>
                    <Delete />
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function renderSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Spinner />
    </div>
  );
}

function renderContent(
  activeGuards: Guard[],
  isLoading: boolean,
  handleUpdatedGuard: (updatedGuard: Guard) => Promise<void>,
  handleDisableGuard: (guardId: string) => Promise<void>,
  handleEnableGuard: (guardId: string) => Promise<void>,
  handleDeleteGuard: (guardId: string) => Promise<void>
) {
  console.log('activeGuards', activeGuards);
  if (!activeGuards.length && isLoading) {
    return renderSpinner();
  } else if (activeGuards.length) {
    return renderGuardSchedulesTable(
      activeGuards,
      handleUpdatedGuard,
      handleDisableGuard,
      handleEnableGuard,
      handleDeleteGuard
    );
  } else {
    return <div className="flex justify-center">No active Guards</div>;
  }
}

export const ActiveGuards: React.FC = () => {
  const [activeGuards, setActiveGuards] = useState<Guard[]>([]);
  const { deleteGuard, disableGuard, enableGuard, getGuards } = useBackend();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuards = async () => {
      try {
        const guards = await getGuards();

        setActiveGuards(guards);
      } catch (error) {
        console.error('Error fetching active Guards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuards();
  }, [getGuards]);

  const handleDisableGuard = useCallback(
    async (guardId: string) => {
      try {
        await disableGuard(guardId);

        const updatedGuards = [...activeGuards];
        const index = updatedGuards.findIndex((guard) => guard._id === guardId);
        if (index !== -1) {
          updatedGuards[index].disabled = true;
          setActiveGuards(updatedGuards);
        }
      } catch (error) {
        console.error('Error disabling Guard:', error);
      }
    },
    [activeGuards, disableGuard]
  );

  const handleEnableGuard = useCallback(
    async (guardId: string) => {
      try {
        await enableGuard(guardId);

        const updatedGuards = [...activeGuards];
        const index = updatedGuards.findIndex((guard) => guard._id === guardId);
        if (index !== -1) {
          updatedGuards[index].disabled = false;
          setActiveGuards(updatedGuards);
        }
      } catch (error) {
        console.error('Error enabling Guard:', error);
      }
    },
    [activeGuards, enableGuard]
  );

  const handleUpdatedGuard = useCallback(
    async (updatedGuard: Guard) => {
      try {
        const updatedGuards = [...activeGuards];
        const index = updatedGuards.findIndex((guard) => guard._id === updatedGuard._id);
        if (index !== -1) {
          updatedGuards[index] = updatedGuard;
          setActiveGuards(updatedGuards);
        }
      } catch (error) {
        console.error('Error updating Guard:', error);
      }
    },
    [activeGuards]
  );

  const handleDeleteGuard = useCallback(
    async (guardId: string) => {
      try {
        await deleteGuard(guardId);

        const updatedGuards = [...activeGuards.filter((guard) => guard._id !== guardId)];
        setActiveGuards(updatedGuards);
      } catch (error) {
        console.error('Error deleting Guard:', error);
      }
    },
    [activeGuards, deleteGuard]
  );

  return (
    <Card data-test-id="active-dcas" className="w-full bg-white p-6 shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Active Guard Schedules</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent>
        {renderContent(
          activeGuards,
          isLoading,
          handleUpdatedGuard,
          handleDisableGuard,
          handleEnableGuard,
          handleDeleteGuard
        )}
      </CardContent>
    </Card>
  );
};
