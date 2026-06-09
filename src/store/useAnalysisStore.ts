import { create } from 'zustand';
import { 
  EffectOverview, 
  DailyEffectData, 
  RegionEffectData, 
  AnalysisDetailRecord,
  ExportField,
  DEFAULT_EXPORT_FIELDS 
} from '@/types/analysis';
import { 
  mockEffectOverview, 
  mockRegionData, 
  generateDailyData,
  generateDetailRecords 
} from '@/mock/analysis';

interface AnalysisState {
  overview: EffectOverview | null;
  dailyData: DailyEffectData[];
  regionData: RegionEffectData[];
  detailRecords: AnalysisDetailRecord[];
  exportFields: ExportField[];
  loading: {
    overview: boolean;
    daily: boolean;
    region: boolean;
    detail: boolean;
  };
  filter: {
    dateRange?: [string, string];
    regions: string[];
    activityId?: string;
  };
  totalRecords: number;
  
  fetchOverview: (activityId: string, dateRange?: [string, string]) => Promise<void>;
  fetchDailyData: (activityId: string, dateRange?: [string, string]) => Promise<void>;
  fetchRegionData: (activityId: string, regions?: string[]) => Promise<void>;
  fetchDetailRecords: (activityId: string, page?: number, pageSize?: number) => Promise<void>;
  setExportFields: (fields: ExportField[]) => void;
  toggleExportField: (key: string) => void;
  setFilter: (filter: Partial<AnalysisState['filter']>) => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  overview: null,
  dailyData: [],
  regionData: [],
  detailRecords: [],
  exportFields: [...DEFAULT_EXPORT_FIELDS],
  loading: {
    overview: false,
    daily: false,
    region: false,
    detail: false,
  },
  filter: {
    regions: [],
  },
  totalRecords: 0,

  fetchOverview: async (activityId, dateRange) => {
    set({ loading: { ...get().loading, overview: true } });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const growth = 5 + Math.random() * 20;
    const overview: EffectOverview = {
      ...mockEffectOverview,
      totalSales: mockEffectOverview.totalSales * (0.8 + Math.random() * 0.4),
      comparedLastPeriod: {
        salesGrowth: growth,
        orderValueGrowth: growth * 0.5,
        redemptionGrowth: growth * 1.2,
      },
    };
    
    set({ 
      overview, 
      loading: { ...get().loading, overview: false },
      filter: { ...get().filter, activityId, dateRange },
    });
  },

  fetchDailyData: async (activityId, dateRange) => {
    set({ loading: { ...get().loading, daily: true } });
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const days = dateRange ? 
      Math.ceil(Math.abs(new Date(dateRange[1]).getTime() - new Date(dateRange[0]).getTime()) / (1000 * 60 * 60 * 24)) : 
      30;
    
    const dailyData = generateDailyData(Math.min(days, 90));
    
    set({ 
      dailyData, 
      loading: { ...get().loading, daily: false },
    });
  },

  fetchRegionData: async (activityId, regions = []) => {
    set({ loading: { ...get().loading, region: true } });
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let regionData = [...mockRegionData];
    if (regions.length > 0) {
      regionData = regionData.filter(item => regions.includes(item.regionCode));
    }
    
    set({ 
      regionData, 
      loading: { ...get().loading, region: false },
      filter: { ...get().filter, regions },
    });
  },

  fetchDetailRecords: async (activityId, page = 1, pageSize = 20) => {
    set({ loading: { ...get().loading, detail: true } });
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const allRecords = generateDetailRecords(100);
    const totalRecords = allRecords.length;
    const start = (page - 1) * pageSize;
    const detailRecords = allRecords.slice(start, start + pageSize);
    
    set({ 
      detailRecords, 
      totalRecords,
      loading: { ...get().loading, detail: false },
    });
  },

  setExportFields: (fields) => {
    set({ exportFields: fields });
  },

  toggleExportField: (key) => {
    set(state => ({
      exportFields: state.exportFields.map(f => 
        f.key === key ? { ...f, selected: !f.selected } : f
      ),
    }));
  },

  setFilter: (filter) => {
    set(state => ({
      filter: { ...state.filter, ...filter },
    }));
  },
}));
