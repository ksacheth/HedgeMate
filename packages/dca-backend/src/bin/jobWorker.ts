import { startWorker } from '../lib/jobWorker';
import { serviceLogger } from '../lib/logger';

async function gogo() {
  try {
    await startWorker();
    serviceLogger.info('✅ Job worker started and connected to Agenda.');
  } catch (error) {
    serviceLogger.error('!!! Failed to initialize service', error);
    throw error;
  }
}

gogo();
