import mongoose, { Schema, Document } from 'mongoose';

export interface IProtectionRule extends Document {
  chainId: number;
  collateralAsset: string;
  debtAsset: string;
  isActive: boolean;
  jobId: string;
  protocol: string;
  repayAmount: string;
  triggerPrice: string;
  user: mongoose.Schema.Types.ObjectId;
}

const ProtectionRuleSchema: Schema = new Schema(
  {
    chainId: { required: true, type: Number },
    collateralAsset: { required: true, type: String },
    debtAsset: { required: true, type: String },
    isActive: { default: true, type: Boolean },
    jobId: { type: String },
    protocol: { default: 'AaveV3', required: true, type: String },
    repayAmount: { required: true, type: String },
    triggerPrice: { required: true, type: String },
    user: { ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId }, // this is smthing optional
  },
  { timestamps: true }
);

export const ProtectionRule = mongoose.model<IProtectionRule>(
  'ProtectionRule',
  ProtectionRuleSchema
);
