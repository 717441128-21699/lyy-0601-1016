export interface EffectOverview {
  totalSales: number;
  avgOrderValue: number;
  redemptionCount: number;
  participationCount: number;
  roi: number;
  comparedLastPeriod: {
    salesGrowth: number;
    orderValueGrowth: number;
    redemptionGrowth: number;
  };
}

export interface DailyEffectData {
  date: string;
  sales: number;
  orderCount: number;
  avgOrderValue: number;
  redemptionCount: number;
}

export interface RegionEffectData {
  regionCode: string;
  regionName: string;
  sales: number;
  orderCount: number;
  avgOrderValue: number;
  redemptionCount: number;
  storeCount: number;
}

export interface ExportField {
  key: string;
  label: string;
  selected: boolean;
}

export interface AnalysisDetailRecord {
  date: string;
  storeName: string;
  regionName: string;
  productName: string;
  salesAmount: number;
  orderCount: number;
  avgOrderValue: number;
  redemptionCount: number;
  memberLevel: string;
}

export const DEFAULT_EXPORT_FIELDS: ExportField[] = [
  { key: 'date', label: '日期', selected: true },
  { key: 'storeName', label: '门店名称', selected: true },
  { key: 'regionName', label: '所属区域', selected: true },
  { key: 'productName', label: '商品名称', selected: true },
  { key: 'salesAmount', label: '销售额', selected: true },
  { key: 'orderCount', label: '订单数', selected: true },
  { key: 'avgOrderValue', label: '客单价', selected: true },
  { key: 'redemptionCount', label: '核销次数', selected: true },
  { key: 'memberLevel', label: '会员等级', selected: false },
];
