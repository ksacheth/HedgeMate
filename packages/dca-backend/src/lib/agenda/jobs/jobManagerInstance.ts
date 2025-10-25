import { Agenda } from '@whisthub/agenda';

import { LoanProtectionJobManager } from './loanProtectionJobManager';
import { env } from '../../env';
import { serviceLogger } from '../../logger';

const mongoConnectionString = env.MONGODB_URI;
if (!mongoConnectionString) {
  serviceLogger.error('[JobManagerInstance] MONGODB_URI is not set. Job manager cannot start.');
  throw new Error('MONGODB_URI is not set.');
}

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: 'agendaJobs' },
});

export const jobManager = new LoanProtectionJobManager(agenda);

export async function startAgenda() {
  try {
    await agenda.start();
    serviceLogger.info('[JobManagerInstance] Agenda scheduler started successfully.');
  } catch (error) {
    serviceLogger.error('[JobManagerInstance] Error starting Agenda:', error);
    process.exit(1);
  }
}
