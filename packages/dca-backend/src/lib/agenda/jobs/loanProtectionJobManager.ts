import { Agenda, Job } from '@whisthub/agenda';
import { Types } from 'mongoose';

import { serviceLogger } from '../../logger';
import { IProtectionRule, ProtectionRule } from '../../mongo/protectionRule.schema';
import { TIME } from './executeDCASwap/utils/constants';

const JOB_NAME = 'execute-loan-protection';

export type ProtectionJobParams = {
  ruleId: string;
};

export type ProtectionJobType = Job<ProtectionJobParams>;

interface FindSpecificJobParams {
  ethAddress: string;
  mustExist?: boolean;
  scheduleId: string;
}

export class LoanProtectionJobManager {
  private agenda: Agenda;

  constructor(agendaInstance: Agenda) {
    this.agenda = agendaInstance;
    // Note: Job definition is handled in jobWorker.ts to ensure proper initialization
  }

  public async createRule(
    ruleData: Partial<IProtectionRule>
  ): Promise<{ job: ProtectionJobType; rule: IProtectionRule }> {
    const newRule = await ProtectionRule.create(ruleData);
    serviceLogger.info(`[Manager] New rule created in DB with ID: ${String(newRule._id)}`);

    const job = this.agenda.create(JOB_NAME, { ruleId: String(newRule._id) }) as ProtectionJobType;
    await job.repeatEvery(TIME).save();

    newRule.jobId = job.attrs._id?.toString() || '';
    await newRule.save();

    serviceLogger.info(
      `[Manager] Scheduled new protection job for rule ID: ${String(newRule._id)}`
    );
    return { job, rule: newRule };
  }

  public async listJobsByEthAddress(ethAddress: string): Promise<ProtectionJobType[]> {
    const rules = await ProtectionRule.find({ user: ethAddress });
    const ruleIds = rules.map((rule) => String(rule._id));

    const jobs = (await this.agenda.jobs({
      'data.ruleId': { $in: ruleIds },
    })) as ProtectionJobType[];

    serviceLogger.info(`[Manager] Found ${jobs.length} jobs for address ${ethAddress}`);
    return jobs;
  }

  public async findJob({
    ethAddress,
    mustExist,
    scheduleId,
  }: FindSpecificJobParams): Promise<ProtectionJobType | undefined> {
    const rule = await ProtectionRule.findOne({
      jobId: scheduleId,
      user: ethAddress,
    });

    if (!rule) {
      if (mustExist) {
        throw new Error(
          `No protection rule found with job ID ${scheduleId} for user ${ethAddress}`
        );
      }
      return undefined;
    }

    const jobs = (await this.agenda.jobs({
      _id: new Types.ObjectId(scheduleId),
    })) as ProtectionJobType[];

    if (mustExist && !jobs.length) {
      throw new Error(`No protection job found with ID ${scheduleId}`);
    }

    return jobs[0];
  }

  public async editRule(
    scheduleId: string,
    ruleData: Partial<IProtectionRule>
  ): Promise<IProtectionRule> {
    const rule = await ProtectionRule.findOne({ jobId: scheduleId });

    if (!rule) {
      throw new Error(`No protection rule found with job ID ${scheduleId}`);
    }

    Object.assign(rule, ruleData);
    await rule.save();

    serviceLogger.info(`[Manager] Updated rule ${rule._id}`);
    return rule;
  }

  public async disableJob({
    ethAddress,
    scheduleId,
  }: Omit<FindSpecificJobParams, 'mustExist'>): Promise<ProtectionJobType | null> {
    const job = await this.findJob({ ethAddress, scheduleId, mustExist: false });

    if (!job) return null;

    const rule = await ProtectionRule.findOne({ jobId: scheduleId });
    if (rule) {
      rule.isActive = false;
      await rule.save();
    }

    job.disable();
    await job.save();

    serviceLogger.info(`[Manager] Disabled protection job ${scheduleId}`);
    return job;
  }

  public async enableJob({
    ethAddress,
    scheduleId,
  }: Omit<FindSpecificJobParams, 'mustExist'>): Promise<ProtectionJobType> {
    const job = await this.findJob({ ethAddress, scheduleId, mustExist: true });

    if (!job) {
      throw new Error(`Job ${scheduleId} not found`);
    }

    const rule = await ProtectionRule.findOne({ jobId: scheduleId });
    if (rule) {
      rule.isActive = true;
      await rule.save();
    }

    job.enable();
    await job.save();

    serviceLogger.info(`[Manager] Enabled protection job ${scheduleId}`);
    return job;
  }

  public async cancelJob({
    ethAddress,
    scheduleId,
  }: Omit<FindSpecificJobParams, 'mustExist'>): Promise<void> {
    const rule = await ProtectionRule.findOne({
      jobId: scheduleId,
      user: ethAddress,
    });

    if (rule) {
      await rule.deleteOne();
    }

    await this.agenda.cancel({
      _id: new Types.ObjectId(scheduleId),
    });

    serviceLogger.info(`[Manager] Cancelled protection job ${scheduleId} and deleted rule`);
  }
}
