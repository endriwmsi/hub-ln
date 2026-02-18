export interface ReferralNode {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy: string | null;
  createdAt: Date;
  approved: boolean;
  children: ReferralNode[];
}

export interface ReferralStats {
  totalReferrals: number;
  directReferrals: number;
  indirectReferrals: number;
  approvedReferrals: number;
}
