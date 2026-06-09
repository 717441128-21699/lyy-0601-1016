import { create } from 'zustand';
import { Activity, ActivityFilter, ActivityStatus, ActivityType } from '@/types/activity';
import { mockActivities, mockCurrentActivity } from '@/mock/activity';
import dayjs from 'dayjs';

interface ActivityState {
  list: Activity[];
  currentActivity: Activity | null;
  filter: ActivityFilter;
  loading: boolean;
  total: number;
  selectedIds: string[];
  allModifiedActivities: Map<string, Activity>;
  
  fetchList: (filter?: ActivityFilter) => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createActivity: (data: Partial<Activity>) => Promise<string>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  updateStatus: (id: string, status: ActivityStatus) => Promise<void>;
  copyActivity: (id: string) => Promise<string>;
  batchUpdateStatus: (ids: string[], status: ActivityStatus) => Promise<void>;
  setFilter: (filter: Partial<ActivityFilter>) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useActivityStore = create<ActivityState>((set, get) => ({
  list: [],
  currentActivity: null,
  filter: {
    page: 1,
    pageSize: 10,
  },
  loading: false,
  total: 0,
  selectedIds: [],
  allModifiedActivities: new Map<string, Activity>(),

  fetchList: async (filter) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentFilter = { ...get().filter, ...filter };
    const modifiedMap = get().allModifiedActivities;
    
    const mockMap = new Map(mockActivities.map(item => [item.id, item]));
    const storeMap = new Map(modifiedMap);
    
    const allData: Activity[] = [];
    
    mockMap.forEach((item, id) => {
      if (storeMap.has(id)) {
        allData.push(storeMap.get(id)!);
      } else {
        allData.push(item);
      }
    });
    
    storeMap.forEach((item, id) => {
      if (!mockMap.has(id)) {
        allData.push(item);
      }
    });
    
    let data = allData;
    
    if (currentFilter.keyword) {
      const keyword = currentFilter.keyword.toLowerCase();
      data = data.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      );
    }
    
    if (currentFilter.type) {
      data = data.filter(item => item.type === currentFilter.type);
    }
    
    if (currentFilter.status) {
      data = data.filter(item => item.status === currentFilter.status);
    }
    
    if (currentFilter.dateRange) {
      const [start, end] = currentFilter.dateRange;
      data = data.filter(item => 
        dayjs(item.startTime).isAfter(dayjs(start)) &&
        dayjs(item.endTime).isBefore(dayjs(end))
      );
    }
    
    data.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
    
    const total = data.length;
    const page = currentFilter.page || 1;
    const pageSize = currentFilter.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = data.slice(start, start + pageSize);
    
    set({ list, total, filter: currentFilter, loading: false });
  },

  fetchDetail: async (id) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let activity = get().list.find(item => item.id === id);
    
    if (!activity) {
      activity = mockActivities.find(item => item.id === id);
    }
    
    if (!activity) {
      activity = mockCurrentActivity;
    }
    
    set({ currentActivity: activity, loading: false });
  },

  createActivity: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newActivity: Activity = {
      id: generateId(),
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'full_reduction',
      status: data.status || 'draft',
      startTime: data.startTime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
      endTime: data.endTime || dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
      priority: data.priority || 5,
      memberLevels: data.memberLevels || [],
      rules: data.rules || [],
      productIds: data.productIds || [],
      excludedProductIds: data.excludedProductIds || [],
      storeIds: data.storeIds || [],
      excludedStoreIds: data.excludedStoreIds || [],
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      createdBy: '当前用户',
    };
    
    set(state => {
      const newModifiedMap = new Map(state.allModifiedActivities);
      newModifiedMap.set(newActivity.id, newActivity);
      
      return {
        list: [newActivity, ...state.list],
        total: state.total + 1,
        allModifiedActivities: newModifiedMap,
      };
    });
    
    return newActivity.id;
  },

  updateActivity: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    set(state => {
      const updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newList = state.list.map(item => 
        item.id === id 
          ? { ...item, ...data, updatedAt }
          : item
      );
      const newCurrentActivity = state.currentActivity?.id === id
        ? { ...state.currentActivity, ...data, updatedAt }
        : state.currentActivity;
      
      const newModifiedMap = new Map(state.allModifiedActivities);
      const existingActivity = newModifiedMap.get(id) || state.list.find(item => item.id === id) || mockActivities.find(item => item.id === id) || mockCurrentActivity;
      newModifiedMap.set(id, { ...existingActivity, ...data, updatedAt });
      
      return {
        list: newList,
        currentActivity: newCurrentActivity,
        allModifiedActivities: newModifiedMap,
      };
    });
  },

  updateStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    set(state => {
      const updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newList = state.list.map(item => 
        item.id === id 
          ? { ...item, status, updatedAt }
          : item
      );
      
      const newModifiedMap = new Map(state.allModifiedActivities);
      const existingActivity = newModifiedMap.get(id) || state.list.find(item => item.id === id) || mockActivities.find(item => item.id === id) || mockCurrentActivity;
      newModifiedMap.set(id, { ...existingActivity, status, updatedAt });
      
      return {
        list: newList,
        allModifiedActivities: newModifiedMap,
      };
    });
  },

  copyActivity: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const modifiedMap = get().allModifiedActivities;
    let original = modifiedMap.get(id) || get().list.find(item => item.id === id);
    
    if (!original) {
      original = mockActivities.find(item => item.id === id);
    }
    
    if (!original) {
      original = mockCurrentActivity;
    }
    
    const newActivity: Activity = {
      ...original,
      id: generateId(),
      name: `${original.name} - 副本`,
      status: 'draft',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    
    set(state => {
      const newModifiedMap = new Map(state.allModifiedActivities);
      newModifiedMap.set(newActivity.id, newActivity);
      
      return {
        list: [newActivity, ...state.list],
        total: state.total + 1,
        allModifiedActivities: newModifiedMap,
      };
    });
    
    return newActivity.id;
  },

  batchUpdateStatus: async (ids, status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => {
      const updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newList = state.list.map(item => 
        ids.includes(item.id)
          ? { ...item, status, updatedAt }
          : item
      );
      
      const newModifiedMap = new Map(state.allModifiedActivities);
      ids.forEach(id => {
        const existingActivity = newModifiedMap.get(id) || state.list.find(item => item.id === id) || mockActivities.find(item => item.id === id) || mockCurrentActivity;
        newModifiedMap.set(id, { ...existingActivity, status, updatedAt });
      });
      
      return {
        list: newList,
        selectedIds: [],
        allModifiedActivities: newModifiedMap,
      };
    });
  },

  setFilter: (filter) => {
    set(state => ({
      filter: { ...state.filter, ...filter },
    }));
  },

  setSelectedIds: (ids) => {
    set({ selectedIds: ids });
  },

  toggleSelected: (id) => {
    set(state => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter(item => item !== id)
        : [...state.selectedIds, id],
    }));
  },

  clearSelected: () => {
    set({ selectedIds: [] });
  },
}));
