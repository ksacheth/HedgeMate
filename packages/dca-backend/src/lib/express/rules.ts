import { ethers } from 'ethers';
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { jobManager } from '../agenda/jobs/jobManagerInstance';
import { serviceLogger } from '../logger';
import { IProtectionRule, ProtectionRule } from '../mongo/protectionRule.schema';

export const router = Router();

// Rate limiting to prevent abuse
const createRuleLimiter = rateLimit({
  legacyHeaders: false,
  max: 10, // Limit each IP to 10 rule creation requests per windowMs
  message: 'Too many protection rules created from this IP, please try again later.',
  standardHeaders: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

const getRulesLimiter = rateLimit({
  legacyHeaders: false,
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  windowMs: 1 * 60 * 1000, // 1 minute
});

const deleteRuleLimiter = rateLimit({
  legacyHeaders: false,
  max: 20, // Limit each IP to 20 delete requests per windowMs
  message: 'Too many delete requests from this IP, please try again later.',
  standardHeaders: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

router.post('/', createRuleLimiter, async (req: Request, res: Response) => {
  try {
    const ruleData: Partial<IProtectionRule> = req.body;
    serviceLogger.info('[API] Received request to create new rule:', ruleData);

    // Validate required fields
    if (!ruleData.user || !ruleData.triggerPrice || !ruleData.repayAmount) {
      res.status(400).json({ message: 'Missing required fields: user, triggerPrice, repayAmount' });
      return;
    }

    // Validate user is a valid Ethereum address
    if (!ethers.utils.isAddress(ruleData.user)) {
      res.status(400).json({ message: 'Invalid Ethereum address for user field' });
      return;
    }

    // Validate triggerPrice is a valid number
    const triggerPrice = parseFloat(ruleData.triggerPrice);
    if (Number.isNaN(triggerPrice) || triggerPrice <= 0) {
      res.status(400).json({ message: 'Invalid triggerPrice: must be a positive number' });
      return;
    }

    // Validate repayAmount is a valid number
    const repayAmount = parseFloat(ruleData.repayAmount);
    if (Number.isNaN(repayAmount) || repayAmount <= 0) {
      res.status(400).json({ message: 'Invalid repayAmount: must be a positive number' });
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

// Get all rules for a user
router.get('/', getRulesLimiter, async (req: Request, res: Response) => {
  try {
    const { user } = req.query;

    if (!user || typeof user !== 'string') {
      res.status(400).json({ message: 'Missing or invalid user query parameter' });
      return;
    }

    if (!ethers.utils.isAddress(user)) {
      res.status(400).json({ message: 'Invalid Ethereum address' });
      return;
    }

    const rules = await ProtectionRule.find({ user });
    res.status(200).json({ rules });
  } catch (error) {
    serviceLogger.error('[API] Error fetching protection rules:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Delete a rule
router.delete('/:ruleId', deleteRuleLimiter, async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;

    const rule = await ProtectionRule.findById(ruleId);

    if (!rule) {
      res.status(404).json({ message: 'Rule not found' });
      return;
    }

    rule.isActive = false;
    await rule.save();

    serviceLogger.info(`[API] Deactivated rule ${ruleId}`);
    res.status(200).json({ message: 'Rule deactivated successfully' });
  } catch (error) {
    serviceLogger.error('[API] Error deleting protection rule:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
