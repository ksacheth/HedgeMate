import { Router, Request, Response } from 'express';

import { jobManager } from '../agenda/jobs/jobManagerInstance';
import { serviceLogger } from '../logger';
import { IProtectionRule } from '../mongo/protectionRule.schema';

export const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const ruleData: Partial<IProtectionRule> = req.body;
    serviceLogger.info('[API] Received request to create new rule:', ruleData);

    if (!ruleData.user || !ruleData.triggerPrice || !ruleData.repayAmount) {
      res.status(400).json({ message: 'Missing required rule data.' });
      return;
    }

    const newRule = await jobManager.createRule(ruleData);
    res.status(201).json({
      message: 'Protection rule created and scheduled successfully.',
      rule: newRule,
    });
  } catch (error) {
    serviceLogger.error('[API] Error creating protection rule:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
