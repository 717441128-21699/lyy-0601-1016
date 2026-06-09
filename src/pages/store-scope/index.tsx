import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Input,
  Button,
  Card,
  Checkbox,
  Tree,
  Select,
  Empty,
  Spin,
  Pagination,
  message,
  Tag,
  Space,
  Table,
  Badge
} from 'antd';
import {
  Search,
  Store,
  ArrowLeft,
  Save,
  X,
  Plus,
  Minus,
  Filter,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import type { DataNode } from 'antd/es/tree';
import PageHeader from '@/components/ui/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { useActivityStore } from '@/store/useActivityStore';
import { mockStores, mockRegions } from '@/mock/store';
import { Store as StoreType, Region } from '@/types/store';
import { formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';

const { Option } = Select;
const { Search: SearchInput } = Input;

const StoreScopePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentActivity, fetchDetail, updateActivity } = useActivityStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<StoreType['status'] | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showExcluded, setShowExcluded] = useState(false);
  const [stores] = useState(mockStores);
  const [regions] = useState(mockRegions);

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id, fetchDetail]);

  useEffect(() => {
    if (currentActivity) {
      setSelectedIds(currentActivity.storeIds);
      setExcludedIds(currentActivity.excludedStoreIds);
    }
  }, [currentActivity]);

  useEffect(() => {
    document.title = '门店范围 - 智慧零售促销管理平台';
  }, []);

  const buildTreeData = (regions: Region[]): DataNode[] => {
    return regions.map(region => ({
      title: (
        <span className="flex items-center justify-between w-full">
          <span>{region.name}</span>
          <span className="text-xs text-gray-400">({region.storeCount}家门店)</span>
        </span>
      ),
      key: region.code,
      children: region.children ? buildTreeData(region.children) : undefined,
    }));
  };

  const treeData = useMemo(() => buildTreeData(regions), [regions]);

  const getRegionChildCodes = (regionCode: string): string[] => {
    const codes: string[] = [];
    const findRegion = (regionsList: Region[]): Region | null => {
      for (const region of regionsList) {
        if (region.code === regionCode) return region;
        if (region.children) {
          const found = findRegion(region.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const region = findRegion(regions);
    if (region?.children) {
      for (const child of region.children) {
        codes.push(child.code);
        if (child.children) {
          codes.push(...getRegionChildCodes(child.code));
        }
      }
    }
    
    return codes;
  };

  const filteredStores = useMemo(() => {
    let result = [...stores];
    
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(kw) ||
        s.code.toLowerCase().includes(kw) ||
        s.address.toLowerCase().includes(kw) ||
        s.manager.toLowerCase().includes(kw)
      );
    }
    
    if (selectedRegion) {
      const allChildCodes = getRegionChildCodes(selectedRegion);
      const regionCodes = [selectedRegion, ...allChildCodes];
      result = result.filter(s => 
        regionCodes.includes(s.regionCode) ||
        s.city === selectedRegion ||
        s.province === selectedRegion
      );
    }
    
    if (statusFilter) {
      result = result.filter(s => s.status === statusFilter);
    }
    
    return result;
  }, [stores, keyword, selectedRegion, statusFilter, regions]);

  const paginatedStores = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [filteredStores, page, pageSize]);

  const handleSelectStore = (storeId: string) => {
    if (excludedIds.includes(storeId)) {
      setExcludedIds(excludedIds.filter(id => id !== storeId));
    }
    
    if (selectedIds.includes(storeId)) {
      setSelectedIds(selectedIds.filter(id => id !== storeId));
    } else {
      setSelectedIds([...selectedIds, storeId]);
    }
  };

  const handleExcludeStore = (storeId: string) => {
    if (selectedIds.includes(storeId)) {
      setSelectedIds(selectedIds.filter(id => id !== storeId));
    }
    
    if (excludedIds.includes(storeId)) {
      setExcludedIds(excludedIds.filter(id => id !== storeId));
    } else {
      setExcludedIds([...excludedIds, storeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStores.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStores.map(s => s.id));
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      await updateActivity(id, {
        storeIds: selectedIds,
        excludedStoreIds: excludedIds,
      });
      message.success('门店配置已保存');
      navigate(`/activity/edit/${id}`);
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStores = () => stores.filter(s => selectedIds.includes(s.id));
  const getExcludedStores = () => stores.filter(s => excludedIds.includes(s.id));

  const columns = [
    {
      title: '门店信息',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_: string, record: StoreType) => (
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedIds.includes(record.id)}
            disabled={excludedIds.includes(record.id)}
            onChange={() => handleSelectStore(record.id)}
          />
          <div>
            <p className="font-medium text-gray-800">{record.name}</p>
            <p className="text-xs text-gray-500">{record.code}</p>
          </div>
        </div>
      ),
    },
    {
      title: '所在区域',
      dataIndex: 'region',
      key: 'region',
      width: 200,
      render: (_: string, record: StoreType) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={14} className="text-blue-500" />
          <span>{record.province} {record.city} {record.district}</span>
        </div>
      ),
    },
    {
      title: '详细地址',
      dataIndex: 'address',
      key: 'address',
      className: 'text-sm text-gray-600',
    },
    {
      title: '店长',
      dataIndex: 'manager',
      key: 'manager',
      width: 120,
      render: (text: string, record: StoreType) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={14} className="text-orange-500" />
          <span>{text}</span>
          <Phone size={14} className="text-gray-400 ml-2" />
          <span className="text-xs">{record.phone}</span>
        </div>
      ),
    },
    {
      title: '门店面积',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      render: (text: number) => (
        <span className="text-sm text-gray-600">{formatNumber(text)}㎡</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: StoreType['status']) => (
        <StatusTag status={status} type="store" />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: string, record: StoreType) => {
        const isSelected = selectedIds.includes(record.id);
        const isExcluded = excludedIds.includes(record.id);
        return (
          <Space>
            <Button
              size="small"
              type={isSelected ? 'primary' : 'default'}
              icon={isSelected ? <Minus size={14} /> : <Plus size={14} />}
              onClick={() => handleSelectStore(record.id)}
              disabled={isExcluded}
              className="rounded-full"
            >
              {isSelected ? '取消' : '选择'}
            </Button>
            <Button
              size="small"
              danger={isExcluded}
              type={isExcluded ? 'primary' : 'default'}
              onClick={() => handleExcludeStore(record.id)}
              className="rounded-full"
            >
              {isExcluded ? '取消排除' : '排除'}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="门店范围"
        subtitle="选择参与活动的门店范围"
        breadcrumbs={[
          { label: '活动列表', path: '/activity/list' },
          { label: '编辑活动', path: id ? `/activity/edit/${id}` : '/activity/create' },
          { label: '门店范围' },
        ]}
        extra={
          <Space>
            <Button
              size="large"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate(id ? `/activity/edit/${id}` : '/activity/create')}
              className="rounded-full"
            >
              返回编辑
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Save size={18} />}
              onClick={handleSave}
              loading={loading}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
            >
              保存配置
            </Button>
          </Space>
        }
      />

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <Store size={20} className="text-blue-600" />
          <div>
            <p className="text-xs text-blue-600">已选门店</p>
            <p className="text-xl font-bold text-blue-700">{selectedIds.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-50 border border-red-100">
          <X size={20} className="text-red-600" />
          <div>
            <p className="text-xs text-red-600">排除门店</p>
            <p className="text-xl font-bold text-red-700">{excludedIds.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
          <Filter size={20} className="text-gray-600" />
          <div>
            <p className="text-xs text-gray-600">筛选结果</p>
            <p className="text-xl font-bold text-gray-700">{filteredStores.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Filter size={18} />
              筛选条件
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">区域选择</label>
                <Tree
                  treeData={treeData}
                  defaultExpandAll
                  onSelect={(selectedKeys) => {
                    setSelectedRegion(selectedKeys[0] as string);
                    setPage(1);
                  }}
                  selectedKeys={selectedRegion ? [selectedRegion] : []}
                  className="category-tree"
                />
                {selectedRegion && (
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setSelectedRegion(undefined);
                      setPage(1);
                    }}
                    className="mt-2 text-blue-600"
                  >
                    清除区域筛选
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">门店状态</label>
                <Select
                  className="w-full"
                  placeholder="全部状态"
                  allowClear
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <Option value="open">营业中</Option>
                  <Option value="closed">已关闭</Option>
                  <Option value="renovating">装修中</Option>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">已选门店</h3>
              <Button
                type="text"
                size="small"
                onClick={() => setShowExcluded(!showExcluded)}
                className={showExcluded ? 'text-red-600' : 'text-gray-500'}
              >
                {showExcluded ? '查看已选' : '查看排除'}
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {!showExcluded ? (
                getSelectedStores().length > 0 ? (
                  getSelectedStores().map(store => (
                    <div
                      key={store.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Store size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{store.name}</p>
                        <p className="text-xs text-gray-500 truncate">{store.city} {store.district}</p>
                      </div>
                      <button
                        onClick={() => handleSelectStore(store.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty description="暂无已选门店" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              ) : (
                getExcludedStores().length > 0 ? (
                  getExcludedStores().map(store => (
                    <div
                      key={store.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Store size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{store.name}</p>
                        <p className="text-xs text-red-500">已排除</p>
                      </div>
                      <button
                        onClick={() => handleExcludeStore(store.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty description="暂无排除门店" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-2xl border-0 shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="搜索门店名称、编码、地址、店长"
                  allowClear
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-80"
                  prefix={<Search size={16} className="text-gray-400" />}
                />
                
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {selectedIds.length === filteredStores.length && filteredStores.length > 0 ? (
                    <Badge status="processing" />
                  ) : (
                    <Badge status="default" />
                  )}
                  全选当前筛选
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">共 {filteredStores.length} 家门店</span>
              </div>
            </div>
          </Card>

          <Spin spinning={loading} tip="加载中...">
            <Card className="rounded-2xl border-0 shadow-sm">
              {paginatedStores.length > 0 ? (
                <>
                  <Table
                    dataSource={paginatedStores}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    rowClassName={(record) => cn(
                      'transition-colors',
                      excludedIds.includes(record.id) && 'bg-red-50/50 opacity-60'
                    )}
                  />
                  
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={page}
                      pageSize={pageSize}
                      total={filteredStores.length}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total) => `共 ${total} 家`}
                      onChange={setPage}
                    />
                  </div>
                </>
              ) : (
                <div className="py-16">
                  <Empty description="没有找到符合条件的门店" />
                </div>
              )}
            </Card>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default StoreScopePage;
