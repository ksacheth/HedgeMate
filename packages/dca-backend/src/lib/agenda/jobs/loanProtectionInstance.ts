import { Agenda } from '@whisthub/agenda';

import { LoanProtectionJobManager } from './loanProtectionJobManager';
import { serviceLogger } from '../../logger';

const mongoConnectionString = process.env.MONGO_URI;
if (!mongoConnectionString) {
  serviceLogger.error('[JobManagerInstance] MONGO_URI is not set. Job manager cannot start.');
  throw new Error('MONGO_URI is not set.');
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
