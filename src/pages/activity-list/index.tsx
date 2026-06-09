import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Pagination, 
  Modal, 
  message,
  Empty,
  Spin
} from 'antd';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Pause, 
  Play,
  Copy,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import dayjs from 'dayjs';
import PageHeader from '@/components/ui/PageHeader';
import ActivityCard from '@/components/business/ActivityCard';
import NumberCard from '@/components/ui/NumberCard';
import { useActivityStore } from '@/store/useActivityStore';
import { ActivityType, ActivityStatus, ACTIVITY_TYPE_LABEL, ACTIVITY_STATUS_LABEL } from '@/types/activity';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ActivityListPage = () => {
  const navigate = useNavigate();
  const { 
    list, 
    filter, 
    loading, 
    total, 
    selectedIds,
    fetchList, 
    setFilter, 
    updateStatus,
    copyActivity,
    batchUpdateStatus,
    toggleSelected,
    setSelectedIds,
    clearSelected
  } = useActivityStore();
  
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState<'pause' | 'resume' | 'copy' | null>(null);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    document.title = '活动列表 - 智慧零售促销管理平台';
  }, []);

  const handleSearch = (value: string) => {
    setFilter({ keyword: value, page: 1 });
    fetchList({ ...filter, keyword: value, page: 1 });
  };

  const handleTypeChange = (value: ActivityType | undefined) => {
    setFilter({ type: value, page: 1 });
    fetchList({ ...filter, type: value, page: 1 });
  };

  const handleStatusChange = (value: ActivityStatus | undefined) => {
    setFilter({ status: value, page: 1 });
    fetchList({ ...filter, status: value, page: 1 });
  };

  const handleDateChange = (dates: any) => {
    if (dates) {
      const dateRange: [string, string] = [
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD'),
      ];
      setFilter({ dateRange, page: 1 });
      fetchList({ ...filter, dateRange, page: 1 });
    } else {
      setFilter({ dateRange: undefined, page: 1 });
      fetchList({ ...filter, dateRange: undefined, page: 1 });
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter({ page, pageSize });
    fetchList({ ...filter, page, pageSize });
  };

  const handleRefresh = () => {
    fetchList();
    message.success('刷新成功');
  };

  const handleEdit = (id: string) => {
    navigate(`/activity/edit/${id}`);
  };

  const handlePause = (id: string) => {
    Modal.confirm({
      title: '确认暂停活动',
      content: '暂停后活动将立即停止生效，确定要暂停吗？',
      okText: '确认暂停',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await updateStatus(id, 'paused');
        message.success('活动已暂停');
        fetchList();
      },
    });
  };

  const handleResume = (id: string) => {
    Modal.confirm({
      title: '确认恢复活动',
      content: '恢复后活动将立即生效，确定要恢复吗？',
      okText: '确认恢复',
      cancelText: '取消',
      onOk: async () => {
        await updateStatus(id, 'active');
        message.success('活动已恢复');
        fetchList();
      },
    });
  };

  const handleCopy = async (id: string) => {
    const newId = await copyActivity(id);
    message.success('活动复制成功');
    navigate(`/activity/edit/${newId}`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除活动',
      content: '删除后无法恢复，确定要删除该活动吗？',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await updateStatus(id, 'ended');
        message.success('活动已删除');
        fetchList();
      },
    });
  };

  const handleViewAnalysis = (id: string) => {
    navigate(`/activity/${id}/analysis`);
  };

  const handleBatchAction = (action: 'pause' | 'resume' | 'copy') => {
    setBatchAction(action);
    setShowBatchModal(true);
  };

  const confirmBatchAction = async () => {
    if (!batchAction) return;
    
    if (batchAction === 'pause') {
      await batchUpdateStatus(selectedIds, 'paused');
      message.success(`已批量暂停 ${selectedIds.length} 个活动`);
    } else if (batchAction === 'resume') {
      await batchUpdateStatus(selectedIds, 'active');
      message.success(`已批量恢复 ${selectedIds.length} 个活动`);
    } else if (batchAction === 'copy') {
      for (const id of selectedIds) {
        await copyActivity(id);
      }
      message.success(`已批量复制 ${selectedIds.length} 个活动`);
    }
    
    setShowBatchModal(false);
    clearSelected();
    fetchList();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.length) {
      clearSelected();
    } else {
      setSelectedIds(list.map(item => item.id));
    }
  };

  const statCards = [
    { label: '总销售额', value: 1286500, trend: 15.8, icon: <DollarSign size={24} className="text-blue-500" />, format: 'money' as const },
    { label: '进行中活动', value: 8, trend: 2.5, icon: <ShoppingCart size={24} className="text-green-500" />, format: 'number' as const },
    { label: '参与门店', value: 86, trend: 12.3, icon: <Users size={24} className="text-purple-500" />, format: 'number' as const },
    { label: '核销次数', value: 8956, trend: 22.4, icon: <TrendingUp size={24} className="text-orange-500" />, format: 'number' as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="活动列表"
        subtitle="管理和监控所有促销活动"
        breadcrumbs={[{ label: '活动列表' }]}
        extra={
          <Button
            type="primary"
            size="large"
            icon={<Plus size={18} />}
            onClick={() => navigate('/activity/create')}
            className="rounded-full px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg hover:shadow-xl transition-all"
          >
            新建活动
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <NumberCard
            key={index}
            label={card.label}
            value={card.value}
            trend={card.trend}
            prefix={card.icon}
            format={card.format}
            decimals={card.format === 'money' ? 0 : 0}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索活动名称"
                className="w-64 pl-10 pr-4 rounded-full border-gray-200 focus:border-blue-500"
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select
              placeholder="活动类型"
              className="w-40"
              allowClear
              onChange={handleTypeChange}
            >
              {Object.entries(ACTIVITY_TYPE_LABEL).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>

            <Select
              placeholder="活动状态"
              className="w-40"
              allowClear
              onChange={handleStatusChange}
            >
              {Object.entries(ACTIVITY_STATUS_LABEL).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>

            <RangePicker
              className="w-72"
              placeholder={['开始时间', '结束时间']}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />

            <Button
              icon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              className="rounded-full"
            >
              刷新
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {selectedIds.length === list.length && list.length > 0 ? (
                <CheckSquare size={18} className="text-blue-500" />
              ) : (
                <Square size={18} />
              )}
              全选
            </button>
            {selectedIds.length > 0 && (
              <span className="text-sm text-gray-500">
                已选 {selectedIds.length} 项
              </span>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-blue-50 border border-blue-100">
            <span className="text-sm text-blue-700 font-medium">批量操作：</span>
            <Button
              size="small"
              icon={<Pause size={14} />}
              onClick={() => handleBatchAction('pause')}
            >
              批量暂停
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<Play size={14} />}
              onClick={() => handleBatchAction('resume')}
            >
              批量恢复
            </Button>
            <Button
              size="small"
              icon={<Copy size={14} />}
              onClick={() => handleBatchAction('copy')}
            >
              批量复制
            </Button>
            <Button
              size="small"
              danger
              icon={<Trash2 size={14} />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: `确定要删除选中的 ${selectedIds.length} 个活动吗？`,
                  onOk: async () => {
                    await batchUpdateStatus(selectedIds, 'ended');
                    clearSelected();
                    fetchList();
                    message.success('删除成功');
                  },
                });
              }}
            >
              批量删除
            </Button>
          </div>
        )}

        <Spin spinning={loading} tip="加载中...">
          {list.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                  >
                    <ActivityCard
                      activity={activity}
                      onEdit={handleEdit}
                      onPause={handlePause}
                      onResume={handleResume}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                      onViewAnalysis={handleViewAnalysis}
                      selected={selectedIds.includes(activity.id)}
                      onSelect={toggleSelected}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Pagination
                  current={filter.page || 1}
                  pageSize={filter.pageSize || 10}
                  total={total}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条`}
                  onChange={handlePageChange}
                />
              </div>
            </>
          ) : (
            <div className="py-20">
              <Empty
                description={
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">暂无活动数据</p>
                    <Button
                      type="primary"
                      icon={<Plus size={16} />}
                      onClick={() => navigate('/activity/create')}
                    >
                      创建第一个活动
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </Spin>
      </div>

      <Modal
        title={
          batchAction === 'pause' ? '批量暂停活动' :
          batchAction === 'resume' ? '批量恢复活动' :
          '批量复制活动'
        }
        open={showBatchModal}
        onOk={confirmBatchAction}
        onCancel={() => setShowBatchModal(false)}
        okText="确认"
        cancelText="取消"
        okButtonProps={{
          danger: batchAction === 'pause',
        }}
      >
        <p className="text-gray-600">
          确定要{batchAction === 'pause' ? '暂停' : batchAction === 'resume' ? '恢复' : '复制'}选中的{' '}
          <span className="font-semibold text-blue-600">{selectedIds.length}</span>{' '}
          个活动吗？
        </p>
      </Modal>
    </div>
  );
};

export default ActivityListPage;
