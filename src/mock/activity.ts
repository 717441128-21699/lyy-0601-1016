import { Activity, ActivityType, ActivityStatus, MemberLevel } from '@/types/activity';
import dayjs from 'dayjs';

const generateId = () => Math.random().toString(36).substring(2, 10);

const activityNames: Record<ActivityType, string[]> = {
  full_reduction: [
    '618年中大促满减活动',
    '双11狂欢购物节满减',
    '春季新品满减优惠',
    '会员专享满减活动',
    '周末特惠满减',
    '开学季满减活动',
  ],
  discount: [
    '新品上市折扣促销',
    '会员专属折扣活动',
    '清仓大甩卖折扣',
    '节日特惠折扣',
    '限时折扣活动',
    '品牌日折扣专场',
  ],
  gift: [
    '买满赠好礼活动',
    '新品上市赠品活动',
    '会员积分换购赠品',
    '节日限定赠品',
    '满额赠豪礼',
    '周年庆赠品活动',
  ],
};

const generateRules = (type: ActivityType) => {
  switch (type) {
    case 'full_reduction':
      return [
        { threshold: 100, discount: 20 },
        { threshold: 200, discount: 50 },
        { threshold: 500, discount: 150 },
      ];
    case 'discount':
      return { discount: Math.floor(Math.random() * 30 + 70) / 10 };
    case 'gift':
      return {
        threshold: 200 + Math.floor(Math.random() * 300),
        giftProductId: generateId(),
        giftProductName: ['精美礼品盒', '品牌定制水杯', '高端护肤套装', '电子产品配件'][Math.floor(Math.random() * 4)],
        giftQuantity: 1,
      };
  }
};

const statuses: ActivityStatus[] = ['draft', 'pending', 'approved', 'active', 'paused', 'ended', 'rejected'];
const types: ActivityType[] = ['full_reduction', 'discount', 'gift'];
const memberLevels: MemberLevel[] = ['normal', 'silver', 'gold', 'platinum', 'diamond'];

export const mockActivities: Activity[] = Array.from({ length: 25 }, (_, i) => {
  const type = types[Math.floor(Math.random() * types.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const nameList = activityNames[type];
  const startTime = dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss');
  const endTime = dayjs(startTime).add(7 + Math.floor(Math.random() * 14), 'day').format('YYYY-MM-DD HH:mm:ss');
  
  return {
    id: generateId(),
    name: nameList[i % nameList.length] + (i > 5 ? ` #${i}` : ''),
    description: `这是一个${type === 'full_reduction' ? '满减' : type === 'discount' ? '折扣' : '赠品'}促销活动，旨在提升门店销售额和客户满意度。`,
    type,
    status,
    startTime,
    endTime,
    priority: Math.floor(Math.random() * 10) + 1,
    memberLevels: memberLevels.slice(0, Math.floor(Math.random() * 3) + 2),
    rules: generateRules(type),
    productIds: Array.from({ length: 10 + Math.floor(Math.random() * 20) }, () => generateId()),
    excludedProductIds: Array.from({ length: Math.floor(Math.random() * 5) }, () => generateId()),
    storeIds: Array.from({ length: 5 + Math.floor(Math.random() * 15) }, () => generateId()),
    excludedStoreIds: Array.from({ length: Math.floor(Math.random() * 3) }, () => generateId()),
    createdAt: dayjs().subtract(30 + Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(Math.floor(Math.random() * 10), 'day').format('YYYY-MM-DD HH:mm:ss'),
    createdBy: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
    approvalRemark: status === 'rejected' ? '活动规则设置不合理，请调整后重新提交' : undefined,
  };
});

export const mockCurrentActivity: Activity = {
  id: 'act-current-001',
  name: '618年中大促满减活动',
  description: '618年中大促，全场满减优惠，多买多省！',
  type: 'full_reduction',
  status: 'active',
  startTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD 00:00:00'),
  endTime: dayjs().add(7, 'day').format('YYYY-MM-DD 23:59:59'),
  priority: 10,
  memberLevels: ['silver', 'gold', 'platinum', 'diamond'],
  rules: [
    { threshold: 100, discount: 20 },
    { threshold: 200, discount: 50 },
    { threshold: 500, discount: 150 },
  ],
  productIds: ['prod-001', 'prod-002', 'prod-003'],
  excludedProductIds: ['prod-004'],
  storeIds: ['store-001', 'store-002', 'store-003'],
  excludedStoreIds: ['store-004'],
  createdAt: dayjs().subtract(15, 'day').format('YYYY-MM-DD HH:mm:ss'),
  updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
  createdBy: '张三',
};
