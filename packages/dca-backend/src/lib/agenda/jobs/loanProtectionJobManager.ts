import { Agenda } from '@whisthub/agenda';

import { serviceLogger } from '../../logger';
import { executeLoanProtection } from './executeDCASwap/executeLoanProtection';
import { ProtectionRule, IProtectionRule } from '../../mongo/protectionRule.schema';
import { TIME } from './executeDCASwap/utils/constants';

const JOB_NAME = 'execute-loan-protection';

export class LoanProtectionJobManager {
  private agenda: Agenda;

  constructor(agendaInstance: Agenda) {
    this.agenda = agendaInstance;
    this.agenda.define(JOB_NAME, executeLoanProtection);
  }

  public async createRule(ruleData: Partial<IProtectionRule>): Promise<IProtectionRule> {
    const newRule = await ProtectionRule.create(ruleData);
    serviceLogger.info(`[Manager] New rule created in DB with ID: ${newRule._id}`);

    const job = this.agenda.create(JOB_NAME, { ruleId: newRule._id });
    await job.repeatEvery(TIME).save();

    serviceLogger.info(`[Manager] Scheduled new protection job for rule ID: ${newRule._id}`);
    return newRule;
  }
}
