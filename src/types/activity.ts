export type ActivityType = 'full_reduction' | 'discount' | 'gift';

export type ActivityStatus = 'draft' | 'pending' | 'approved' | 'active' | 'paused' | 'ended' | 'rejected';

export type MemberLevel = 'normal' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface FullReductionRule {
  threshold: number;
  discount: number;
}

export interface DiscountRule {
  discount: number;
  memberLevel?: MemberLevel[];
}

export interface GiftRule {
  threshold: number;
  giftProductId: string;
  giftProductName: string;
  giftQuantity: number;
}

export interface ActivityFilter {
  keyword?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  type: ActivityType;
  status: ActivityStatus;
  startTime: string;
  endTime: string;
  priority: number;
  memberLevels: MemberLevel[];
  rules: FullReductionRule[] | DiscountRule | GiftRule;
  productIds: string[];
  excludedProductIds: string[];
  storeIds: string[];
  excludedStoreIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvalRemark?: string;
}

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  full_reduction: '满减活动',
  discount: '折扣活动',
  gift: '赠品活动',
};

export const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  approved: '已通过',
  active: '进行中',
  paused: '已暂停',
  ended: '已结束',
  rejected: '已拒绝',
};

export const ACTIVITY_STATUS_COLOR: Record<ActivityStatus, string> = {
  draft: 'default',
  pending: 'warning',
  approved: 'processing',
  active: 'success',
  paused: 'default',
  ended: 'default',
  rejected: 'error',
};

export const MEMBER_LEVEL_LABEL: Record<MemberLevel, string> = {
  normal: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员',
  platinum: '铂金会员',
  diamond: '钻石会员',
};

export const MEMBER_LEVEL_COLOR: Record<MemberLevel, string> = {
  normal: '#9CA3AF',
  silver: '#C0C0C0',
  gold: '#D4AF37',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};
