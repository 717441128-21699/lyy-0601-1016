import { EffectOverview, DailyEffectData, RegionEffectData, AnalysisDetailRecord } from '@/types/analysis';
import dayjs from 'dayjs';

export const mockEffectOverview: EffectOverview = {
  totalSales: 1286500,
  avgOrderValue: 168.5,
  redemptionCount: 8956,
  participationCount: 7634,
  roi: 3.25,
  comparedLastPeriod: {
    salesGrowth: 15.8,
    orderValueGrowth: 8.2,
    redemptionGrowth: 22.4,
  },
};

export const generateDailyData = (days: number = 30): DailyEffectData[] => {
  const data: DailyEffectData[] = [];
  const baseSales = 40000;
  
  for (let i = 0; i < days; i++) {
    const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
    const weekdayFactor = [1.2, 1.0, 0.95, 1.0, 1.1, 1.4, 1.3][dayjs(date).day()];
    const randomFactor = 0.8 + Math.random() * 0.4;
    const sales = Math.floor(baseSales * weekdayFactor * randomFactor);
    const orderCount = Math.floor(sales / (150 + Math.random() * 50));
    const avgOrderValue = Number((sales / orderCount).toFixed(2));
    const redemptionCount = Math.floor(orderCount * (0.6 + Math.random() * 0.3));
    
    data.push({
      date,
      sales,
      orderCount,
      avgOrderValue,
      redemptionCount,
    });
  }
  
  return data;
};

export const mockDailyData: DailyEffectData[] = generateDailyData(30);

const regionNames = [
  { code: '110000', name: '北京市' },
  { code: '310000', name: '上海市' },
  { code: '440000', name: '广东省' },
  { code: '330000', name: '浙江省' },
  { code: '320000', name: '江苏省' },
];

export const mockRegionData: RegionEffectData[] = regionNames.map(region => {
  const baseSales = 200000 + Math.random() * 100000;
  const storeCount = 15 + Math.floor(Math.random() * 15);
  const orderCount = Math.floor(baseSales / 160);
  
  return {
    regionCode: region.code,
    regionName: region.name,
    sales: Math.floor(baseSales),
    orderCount,
    avgOrderValue: Number((baseSales / orderCount).toFixed(2)),
    redemptionCount: Math.floor(orderCount * 0.7),
    storeCount,
  };
});

const storeNames = ['北京朝阳万达广场店', '上海徐汇银泰百货店', '广州天河万象城店', '深圳南山大悦城店', '杭州西湖恒隆广场店'];
const productNames = ['薯片大礼包', '坚果混合装', '巧克力礼盒', '纯牛奶', '果汁饮料', '面霜', '精华液', '洗衣液', '电饭煲', '保温杯'];

export const generateDetailRecords = (count: number = 100): AnalysisDetailRecord[] => {
  const records: AnalysisDetailRecord[] = [];
  const memberLevels = ['普通会员', '银卡会员', '金卡会员', '铂金会员', '钻石会员'];
  const regionNames = ['北京市', '上海市', '广东省', '浙江省', '江苏省'];
  
  for (let i = 0; i < count; i++) {
    const date = dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD');
    const salesAmount = Math.floor(Math.random() * 5000) + 100;
    const orderCount = Math.floor(salesAmount / (150 + Math.random() * 50)) + 1;
    
    records.push({
      date,
      storeName: storeNames[Math.floor(Math.random() * storeNames.length)],
      regionName: regionNames[Math.floor(Math.random() * regionNames.length)],
      productName: productNames[Math.floor(Math.random() * productNames.length)],
      salesAmount,
      orderCount,
      avgOrderValue: Number((salesAmount / orderCount).toFixed(2)),
      redemptionCount: Math.floor(orderCount * (0.5 + Math.random() * 0.4)),
      memberLevel: memberLevels[Math.floor(Math.random() * memberLevels.length)],
    });
  }
  
  return records.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
};

export const mockDetailRecords: AnalysisDetailRecord[] = generateDetailRecords(100);
