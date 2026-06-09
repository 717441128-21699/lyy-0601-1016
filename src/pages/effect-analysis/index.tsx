import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Select,
  Spin,
  Table,
  Modal,
  Checkbox,
  Space,
  Tabs,
  Tag,
  Row,
  Col,
  message,
  Dropdown,
  MenuProps,
  Empty
} from 'antd';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  Download,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Calendar,
  MapPin
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import PageHeader from '@/components/ui/PageHeader';
import NumberCard from '@/components/ui/NumberCard';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useActivityStore } from '@/store/useActivityStore';
import { mockRegions } from '@/mock/store';
import { formatMoney, formatNumber, formatDate } from '@/utils/format';
import { exportToExcel, exportToCSV } from '@/utils/export';
import { AnalysisDetailRecord, ExportField } from '@/types/analysis';
import { Region } from '@/types/store';
import { cn } from '@/lib/utils';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const CHART_COLORS = ['#1E3A5F', '#FF6B35', '#36CFC9', '#722ED1', '#F5222D', '#FA8C16'];

const EffectAnalysisPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    overview, 
    dailyData, 
    regionData, 
    detailRecords, 
    exportFields,
    loading, 
    totalRecords,
    fetchOverview, 
    fetchDailyData, 
    fetchRegionData, 
    fetchDetailRecords,
    toggleExportField,
    setExportFields
  } = useAnalysisStore();
  const { list: activities, fetchList: fetchActivities } = useActivityStore();
  
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | undefined>(id);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize] = useState(20);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchActivities({ page: 1, pageSize: 100 });
  }, [fetchActivities]);

  useEffect(() => {
    if (id) {
      setSelectedActivity(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedActivity) {
      const dateRangeStr: [string, string] = [
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      ];
      fetchOverview(selectedActivity, dateRangeStr);
      fetchDailyData(selectedActivity, dateRangeStr);
      fetchRegionData(selectedActivity, selectedRegions);
      fetchDetailRecords(selectedActivity, detailPage, detailPageSize);
    }
  }, [selectedActivity, dateRange, selectedRegions, detailPage, detailPageSize, 
      fetchOverview, fetchDailyData, fetchRegionData, fetchDetailRecords]);

  useEffect(() => {
    document.title = '效果分析 - 智慧零售促销管理平台';
  }, []);

  const handleRefresh = () => {
    if (selectedActivity) {
      const dateRangeStr: [string, string] = [
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      ];
      fetchOverview(selectedActivity, dateRangeStr);
      fetchDailyData(selectedActivity, dateRangeStr);
      fetchRegionData(selectedActivity, selectedRegions);
      fetchDetailRecords(selectedActivity, detailPage, detailPageSize);
      message.success('数据已刷新');
    }
  };

  const handleExport = (type: 'excel' | 'csv') => {
    if (!selectedActivity) {
      message.warning('请先选择活动');
      return;
    }
    
    const selectedFields = exportFields.filter(f => f.selected);
    if (selectedFields.length === 0) {
      message.warning('请至少选择一个导出字段');
      return;
    }

    const activity = activities.find(a => a.id === selectedActivity);
    const activityName = activity?.name || '活动数据';

    if (type === 'excel') {
      exportToExcel(detailRecords, exportFields, activityName);
    } else {
      exportToCSV(detailRecords, exportFields, activityName);
    }
    
    message.success(`已导出 ${type === 'excel' ? 'Excel' : 'CSV'} 文件`);
    setExportModalVisible(false);
  };

  const handleSelectAllFields = () => {
    const allSelected = exportFields.every(f => f.selected);
    setExportFields(exportFields.map(f => ({ ...f, selected: !allSelected })));
  };

  const buildRegionTree = (regions: Region[], level: number = 0): { label: string; value: string }[] => {
    let result: { label: string; value: string }[] = [];
    
    regions.forEach(region => {
      const prefix = level > 0 ? '　'.repeat(level) + '└ ' : '';
      result.push({
        label: `${prefix}${region.name}`,
        value: region.code
      });
      if (region.children) {
        result = [...result, ...buildRegionTree(region.children, level + 1)];
      }
    });
    
    return result;
  };

  const regionOptions = useMemo(() => buildRegionTree(mockRegions), []);

  const pieData = useMemo(() => {
    return regionData.map(item => ({
      name: item.regionName,
      value: item.sales
    }));
  }, [regionData]);

  const detailColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text: string) => formatDate(text),
    },
    {
      title: '门店名称',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 180,
      render: (text: string) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: '所属区域',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 100,
      render: (text: string) => (
        <Tag color="blue" className="m-0">
          <MapPin size={12} className="inline mr-1" />
          {text}
        </Tag>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120,
    },
    {
      title: '销售额',
      dataIndex: 'salesAmount',
      key: 'salesAmount',
      width: 120,
      render: (text: number) => (
        <span className="font-semibold text-orange-600">{formatMoney(text)}</span>
      ),
      sorter: (a: AnalysisDetailRecord, b: AnalysisDetailRecord) => a.salesAmount - b.salesAmount,
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      render: (text: number) => formatNumber(text),
      sorter: (a: AnalysisDetailRecord, b: AnalysisDetailRecord) => a.orderCount - b.orderCount,
    },
    {
      title: '客单价',
      dataIndex: 'avgOrderValue',
      key: 'avgOrderValue',
      width: 100,
      render: (text: number) => formatMoney(text),
      sorter: (a: AnalysisDetailRecord, b: AnalysisDetailRecord) => a.avgOrderValue - b.avgOrderValue,
    },
    {
      title: '核销次数',
      dataIndex: 'redemptionCount',
      key: 'redemptionCount',
      width: 100,
      render: (text: number) => (
        <span className="font-semibold text-blue-600">{formatNumber(text)}</span>
      ),
      sorter: (a: AnalysisDetailRecord, b: AnalysisDetailRecord) => a.redemptionCount - b.redemptionCount,
    },
    {
      title: '会员等级',
      dataIndex: 'memberLevel',
      key: 'memberLevel',
      width: 100,
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          '普通会员': 'default',
          '银卡会员': 'gray',
          '金卡会员': 'gold',
          '铂金会员': 'purple',
          '钻石会员': 'orange',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      },
    },
  ];

  const regionColumns = [
    {
      title: '区域',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 120,
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[regionData.findIndex(r => r.regionName === text) % CHART_COLORS.length] }} />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: '门店数',
      dataIndex: 'storeCount',
      key: 'storeCount',
      width: 100,
      render: (text: number) => `${text} 家`,
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      width: 140,
      render: (text: number) => (
        <span className="font-semibold text-orange-600">{formatMoney(text)}</span>
      ),
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      render: (text: number) => formatNumber(text),
    },
    {
      title: '客单价',
      dataIndex: 'avgOrderValue',
      key: 'avgOrderValue',
      width: 120,
      render: (text: number) => formatMoney(text),
    },
    {
      title: '核销次数',
      dataIndex: 'redemptionCount',
      key: 'redemptionCount',
      width: 120,
      render: (text: number) => (
        <span className="font-semibold text-blue-600">{formatNumber(text)}</span>
      ),
    },
    {
      title: '销售占比',
      key: 'percentage',
      width: 140,
      render: (_: string, record: any) => {
        const total = regionData.reduce((sum, r) => sum + r.sales, 0);
        const percentage = total > 0 ? (record.sales / total) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: CHART_COLORS[regionData.findIndex(r => r.regionCode === record.regionCode) % CHART_COLORS.length]
                }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">{percentage.toFixed(1)}%</span>
          </div>
        );
      },
    },
  ];

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'excel',
      label: (
        <span className="flex items-center gap-2">
          <FileSpreadsheet size={16} />
          导出 Excel
        </span>
      ),
      onClick: () => handleExport('excel'),
    },
    {
      key: 'csv',
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} />
          导出 CSV
        </span>
      ),
      onClick: () => handleExport('csv'),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="效果分析"
        subtitle="查看活动执行效果与数据复盘"
        breadcrumbs={[
          { label: '活动列表', path: '/activity/list' },
          { label: '效果分析' },
        ]}
        extra={
          <Space>
            {id && (
              <Button
                size="large"
                icon={<ArrowLeft size={18} />}
                onClick={() => navigate('/activity/list')}
                className="rounded-full"
              >
                返回列表
              </Button>
            )}
            <Button
              size="large"
              icon={<RefreshCw size={18} />}
              onClick={handleRefresh}
              loading={loading.overview || loading.daily || loading.region || loading.detail}
              className="rounded-full"
              disabled={!selectedActivity}
            >
              刷新数据
            </Button>
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button
                type="primary"
                size="large"
                icon={<Download size={18} />}
                className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
                disabled={!selectedActivity}
              >
                导出复盘明细
              </Button>
            </Dropdown>
          </Space>
        }
      />

      <Card className="rounded-2xl border-0 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">筛选条件</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">选择活动</span>
            <Select
              className="w-64"
              placeholder="请选择活动"
              value={selectedActivity}
              onChange={setSelectedActivity}
              showSearch
              optionFilterProp="children"
            >
              {activities.map(activity => (
                <Option key={activity.id} value={activity.id}>
                  {activity.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              className="w-64"
              disabled={!selectedActivity}
            />
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <Select
              mode="multiple"
              className="min-w-64"
              placeholder="选择区域（可多选）"
              value={selectedRegions}
              onChange={setSelectedRegions}
              maxTagCount={3}
              allowClear
              disabled={!selectedActivity}
            >
              {regionOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {!selectedActivity ? (
        <Card className="rounded-2xl border-0 shadow-sm">
          <Empty
            description={
              <div className="text-center py-8">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">请先选择一个活动查看效果分析</p>
                <p className="text-xs text-gray-400">从上方下拉框选择活动，或从活动列表点击"效果分析"入口</p>
              </div>
            }
          />
        </Card>
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="analysis-tabs">
        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <BarChart3 size={18} />
              数据概览
            </span>
          } 
          key="overview"
        >
          <Spin spinning={loading.overview} tip="加载中...">
            {overview && (
              <div className="space-y-6">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <NumberCard
                      label="总销售额"
                      value={overview.totalSales}
                      format="money"
                      decimals={0}
                      trend={overview.comparedLastPeriod.salesGrowth}
                      prefix={<DollarSign size={24} className="text-blue-600" />}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <NumberCard
                      label="客单价"
                      value={overview.avgOrderValue}
                      format="money"
                      decimals={2}
                      trend={overview.comparedLastPeriod.orderValueGrowth}
                      prefix={<ShoppingCart size={24} className="text-orange-500" />}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <NumberCard
                      label="核销次数"
                      value={overview.redemptionCount}
                      format="number"
                      trend={overview.comparedLastPeriod.redemptionGrowth}
                      prefix={<Target size={24} className="text-green-600" />}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <NumberCard
                      label="投资回报率"
                      value={overview.roi}
                      format="percent"
                      decimals={2}
                      prefix={<TrendingUp size={24} className="text-purple-600" />}
                    />
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <NumberCard
                      label="参与活动会员数"
                      value={overview.participationCount}
                      format="number"
                      prefix={<Users size={24} className="text-cyan-600" />}
                      className="h-full"
                    />
                  </Col>
                </Row>
              </div>
            )}
          </Spin>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <LineChart size={18} />
              趋势分析
            </span>
          } 
          key="trend"
        >
          <Spin spinning={loading.daily} tip="加载中...">
            <Card className="rounded-2xl border-0 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-6">销售与核销趋势（近30天）</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRedemption" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatDate(value, 'MM-DD')}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          sales: '销售额',
                          redemptionCount: '核销次数',
                          avgOrderValue: '客单价'
                        };
                        if (name === 'sales' || name === 'avgOrderValue') {
                          return [formatMoney(value), labels[name] || name];
                        }
                        return [formatNumber(value), labels[name] || name];
                      }}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      name="销售额"
                      stroke="#1E3A5F"
                      fill="url(#colorSales)"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="redemptionCount"
                      name="核销次数"
                      stroke="#FF6B35"
                      fill="url(#colorRedemption)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm mt-6">
              <h3 className="font-semibold text-gray-800 mb-6">客单价与订单数趋势</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatDate(value, 'MM-DD')}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          orderCount: '订单数',
                          avgOrderValue: '客单价'
                        };
                        if (name === 'avgOrderValue') {
                          return [formatMoney(value), labels[name] || name];
                        }
                        return [formatNumber(value), labels[name] || name];
                      }}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orderCount"
                      name="订单数"
                      stroke="#36CFC9"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgOrderValue"
                      name="客单价"
                      stroke="#722ED1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Spin>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <PieChart size={18} />
              区域分析
            </span>
          } 
          key="region"
        >
          <Spin spinning={loading.region} tip="加载中...">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={10}>
                <Card className="rounded-2xl border-0 shadow-sm h-full">
                  <h3 className="font-semibold text-gray-800 mb-6">区域销售占比</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatMoney(value)}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={14}>
                <Card className="rounded-2xl border-0 shadow-sm h-full">
                  <h3 className="font-semibold text-gray-800 mb-6">区域销售额对比</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="regionName" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = {
                              sales: '销售额'
                            };
                            return [formatMoney(value), labels[name] || name];
                          }}
                        />
                        <Bar 
                          dataKey="sales" 
                          name="销售额"
                          radius={[4, 4, 0, 0]}
                        >
                          {regionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card className="rounded-2xl border-0 shadow-sm mt-6">
              <h3 className="font-semibold text-gray-800 mb-6">区域详细数据</h3>
              <Table
                dataSource={regionData}
                columns={regionColumns}
                rowKey="regionCode"
                pagination={false}
              />
            </Card>
          </Spin>
        </TabPane>

        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <FileSpreadsheet size={18} />
              明细数据
            </span>
          } 
          key="detail"
        >
          <Spin spinning={loading.detail} tip="加载中...">
            <Card className="rounded-2xl border-0 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">活动执行明细</h3>
                <Button
                  icon={<Download size={16} />}
                  onClick={() => setExportModalVisible(true)}
                  className="rounded-full"
                >
                  导出设置
                </Button>
              </div>
              <Table
                dataSource={detailRecords}
                columns={detailColumns}
                rowKey={(record, index) => `${record.date}-${record.storeName}-${index}`}
                scroll={{ x: 1200 }}
                pagination={{
                  current: detailPage,
                  pageSize: detailPageSize,
                  total: totalRecords,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                  onChange: setDetailPage,
                }}
              />
            </Card>
          </Spin>
        </TabPane>
      </Tabs>
      )}

      <Modal
        title="导出设置"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setExportModalVisible(false)}>取消</Button>
            <Button
              type="primary"
              onClick={() => handleExport('excel')}
              icon={<FileSpreadsheet size={16} />}
              className="bg-gradient-to-r from-orange-500 to-orange-600 border-0"
            >
              导出 Excel
            </Button>
            <Button
              type="default"
              onClick={() => handleExport('csv')}
              icon={<FileText size={16} />}
            >
              导出 CSV
            </Button>
          </Space>
        }
        width={520}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">选择导出字段</span>
            <Button type="link" size="small" onClick={handleSelectAllFields}>
              {exportFields.every(f => f.selected) ? '取消全选' : '全选'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
            {exportFields.map((field: ExportField) => (
              <div key={field.key} className="flex items-center">
                <Checkbox
                  checked={field.selected}
                  onChange={() => toggleExportField(field.key)}
                >
                  {field.label}
                </Checkbox>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="text-orange-500">*</span> 导出文件将包含当前筛选条件下的所有明细数据
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EffectAnalysisPage;
