import { Job } from '@whisthub/agenda';

import { checkHealthFactor, executeAaveRepay } from './utils/aaveUtils';
import { executeOnChainPriceUpdate } from './utils/pythUtils';
import { serviceLogger } from '../../../logger';
import { ProtectionRule } from '../../../mongo/protectionRule.schema';

export const executeLoanProtection = async (job: Job): Promise<void> => {
  const { ruleId } = job.attrs.data as { ruleId: string };
  serviceLogger.info(`[Job] Starting check for rule: ${ruleId}`);

  const rule = await ProtectionRule.findById(ruleId);

  if (!rule || !rule.isActive) {
    serviceLogger.info(`[Job] Rule ${ruleId} is inactive or deleted. Removing job.`);
    await job.remove();
    return;
  }

  try {
    // Update on-chain price and get current price
    const currentPrice = await executeOnChainPriceUpdate();
    const healthFactor = await checkHealthFactor(rule.user);
    const triggerPrice = parseFloat(rule.triggerPrice);

    serviceLogger.info(
      `[Job] On-Chain Data for ${ruleId}: HF=${healthFactor.toFixed(4)}, Price=$${currentPrice.toFixed(2)}, Trigger=$${triggerPrice}`
    );

    // Trigger conditions:
    // 1. Primary: Price has dropped below user's trigger price
    // 2. Safety check: Health factor is concerning (< 1.5) to avoid unnecessary repayments
    //    when user is not at risk (AAVE liquidates at HF < 1.0)
    if (currentPrice < triggerPrice && healthFactor < 1.5) {
      serviceLogger.info(`[Job] CONDITION MET for rule ${ruleId}. Initiating repayment.`);

      await executeAaveRepay(rule.user, rule.repayAmount);

      rule.isActive = false;
      await rule.save();
      await job.remove();
      serviceLogger.info(`[Job] Repayment successful. Rule ${ruleId} deactivated and job removed.`);
    } else {
      serviceLogger.info(
        `[Job] Conditions not met for rule ${ruleId}. ` +
          `Price condition: ${currentPrice < triggerPrice}, HF condition: ${healthFactor < 1.5}`
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    serviceLogger.error(
      `[Job] Error executing job for rule ${ruleId}: ${errorMessage}`,
      error instanceof Error ? error.stack : undefined
    );
    // Re-throw to mark job as failed in Agenda, which will trigger retries
    throw new Error(`Failed to execute protection job for rule ${ruleId}: ${errorMessage}`);
  }
};
