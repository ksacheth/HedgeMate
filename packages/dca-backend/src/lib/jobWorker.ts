import { createAgenda, getAgenda } from './agenda/agendaClient';
import { executeLoanProtection } from './agenda/jobs/executeDCASwap/executeLoanProtection';

const LOAN_PROTECTION_JOB_NAME = 'execute-loan-protection';

// Function to create and configure a new agenda instance
export async function startWorker() {
  await createAgenda();

  const agenda = getAgenda();

  // Define the loan protection job for health guard
  agenda.define(LOAN_PROTECTION_JOB_NAME, executeLoanProtection);

  return agenda;
}
