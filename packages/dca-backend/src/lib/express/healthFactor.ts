import { Response } from 'express';

import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';

import { VincentAuthenticatedRequest } from './types';
import { checkHealthFactor } from '../agenda/jobs/executeDCASwap/utils/aaveUtils';

export const handleGetHealthFactorRoute = async (
  req: VincentAuthenticatedRequest,
  res: Response
) => {
  try {
    const { ethAddress } = getPKPInfo(req.user.decodedJWT);

    const healthFactor = await checkHealthFactor(ethAddress);

    res.json({ data: { healthFactor }, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health factor', success: false });
  }
};
