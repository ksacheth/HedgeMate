import { Types } from 'mongoose';
import { z } from 'zod';

export const ScheduleParamsSchema = z.object({
  app: z.object({
    id: z.number(),
    version: z.number(),
  }),
  chainId: z.number(),
  collateralAsset: z
    .string()
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), { message: 'Invalid token address' }),
  debtAsset: z
    .string()
    .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), { message: 'Invalid token address' }),
  pkpInfo: z.object({
    ethAddress: z
      .string()
      .refine((val) => /^0x[a-fA-F0-9]{40}$/.test(val), { message: 'Invalid Ethereum address' }),
    publicKey: z.string(),
    tokenId: z.string(),
  }),
  protocol: z.string().default('AaveV3'),
  repayAmount: z.string().refine((val) => /^\d+(\.\d+)?$/.test(val), {
    message: 'Must be a valid decimal number',
  }),
  triggerPrice: z.string().refine((val) => /^\d+(\.\d+)?$/.test(val), {
    message: 'Must be a valid price number',
  }),
});
export const ScheduleIdentitySchema = z.object({
  scheduleId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid ObjectId' }),
});
