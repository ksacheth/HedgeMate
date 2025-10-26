import { LoanProtectionJobManager } from './loanProtectionJobManager';
import { serviceLogger } from '../../logger';
import { getAgenda } from '../agendaClient';

// Get the shared agenda instance
let jobManagerInstance: LoanProtectionJobManager | null = null;

export function getJobManager(): LoanProtectionJobManager {
  if (!jobManagerInstance) {
    const agenda = getAgenda();
    jobManagerInstance = new LoanProtectionJobManager(agenda);
    serviceLogger.info(
      '[JobManagerInstance] LoanProtectionJobManager initialized with shared Agenda'
    );
  }
  return jobManagerInstance;
}

// Export for backward compatibility
export const jobManager = new Proxy({} as LoanProtectionJobManager, {
  get(_target, prop) {
    return getJobManager()[prop as keyof LoanProtectionJobManager];
  },
});
