import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Radio,
  Checkbox,
  Button,
  Card,
  Tabs,
  message,
  Steps,
  Modal,
  Space,
  Divider
} from 'antd';
import {
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import dayjs from 'dayjs';
import PageHeader from '@/components/ui/PageHeader';
import RulePreview from '@/components/business/RulePreview';
import { useActivityStore } from '@/store/useActivityStore';
import {
  ActivityType,
  Activity,
  MemberLevel,
  FullReductionRule,
  DiscountRule,
  GiftRule,
  MEMBER_LEVEL_LABEL,
  ACTIVITY_TYPE_LABEL,
} from '@/types/activity';
import { cn } from '@/lib/utils';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Step } = Steps;

const formatTimeSafe = (value: any): string => {
  if (!value) return '';
  let timeStr = String(value).replace(/\"/g, '');
  if (typeof timeStr === 'string') {
    return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
  }
  if (typeof value.format === 'function') {
    return value.format('YYYY-MM-DD HH:mm:ss');
  }
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss');
};

const parseTimeSafe = (value: any): any => {
  if (!value) return null;
  let timeStr = String(value).replace(/\"/g, '');
  return dayjs(timeStr);
};

type FormValues = {
  name: string;
  description: string;
  type: ActivityType;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  priority: number;
  memberLevels: MemberLevel[];
  fullReductionRules?: FullReductionRule[];
  discountRule?: DiscountRule;
  giftRule?: GiftRule;
};

const ActivityEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm<FormValues>();
  const { createActivity, updateActivity, fetchDetail, currentActivity, loading } = useActivityStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [fullReductionRules, setFullReductionRules] = useState<FullReductionRule[]>([
    { threshold: 100, discount: 20 },
    { threshold: 200, discount: 50 },
  ]);
  const [activityType, setActivityType] = useState<ActivityType>('full_reduction');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approvalRemark, setApprovalRemark] = useState('');
  const [formData, setFormData] = useState<Partial<Activity>>({});

  useEffect(() => {
    if (isEdit && id) {
      fetchDetail(id);
    }
  }, [isEdit, id, fetchDetail]);

  useEffect(() => {
    if (currentActivity && isEdit) {
      const formValues: any = {
        name: currentActivity.name,
        description: currentActivity.description,
        type: currentActivity.type,
        startTime: parseTimeSafe(currentActivity.startTime),
        endTime: parseTimeSafe(currentActivity.endTime),
        priority: currentActivity.priority,
        memberLevels: currentActivity.memberLevels,
      };
      
      if (currentActivity.type === 'discount' && !Array.isArray(currentActivity.rules)) {
        formValues.discountRule = {
          discount: (currentActivity.rules as any).discount || 9,
        };
      }
      
      if (currentActivity.type === 'gift' && !Array.isArray(currentActivity.rules)) {
        formValues.giftRule = {
          threshold: (currentActivity.rules as any).threshold || 200,
          giftProductName: (currentActivity.rules as any).giftProductName || '精美礼品',
          giftQuantity: (currentActivity.rules as any).giftQuantity || 1,
        };
      }
      
      form.setFieldsValue(formValues);
      setActivityType(currentActivity.type);
      
      if (currentActivity.type === 'full_reduction' && Array.isArray(currentActivity.rules)) {
        setFullReductionRules(currentActivity.rules);
      }
    }
  }, [currentActivity, isEdit, form]);

  useEffect(() => {
    document.title = isEdit ? '编辑活动 - 智慧零售促销管理平台' : '新建活动 - 智慧零售促销管理平台';
  }, [isEdit]);

  const handleTypeChange = (e: any) => {
    const type = e.target.value as ActivityType;
    setActivityType(type);
    form.setFieldValue('type', type);
  };

  const addFullReductionRule = () => {
    setFullReductionRules([...fullReductionRules, { threshold: 0, discount: 0 }]);
  };

  const removeFullReductionRule = (index: number) => {
    setFullReductionRules(fullReductionRules.filter((_, i) => i !== index));
  };

  const updateFullReductionRule = (index: number, field: keyof FullReductionRule, value: number) => {
    const newRules = [...fullReductionRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFullReductionRules(newRules);
  };

  const getActivityRules = (values: FormValues) => {
    switch (activityType) {
      case 'full_reduction':
        return fullReductionRules.filter(r => r.threshold > 0 && r.discount > 0);
      case 'discount':
        return { discount: values.discountRule?.discount || 9 };
      case 'gift':
        return {
          threshold: values.giftRule?.threshold || 200,
          giftProductId: 'gift-001',
          giftProductName: values.giftRule?.giftProductName || '精美礼品',
          giftQuantity: values.giftRule?.giftQuantity || 1,
        };
      default:
        return [];
    }
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      const rules = getActivityRules(values);
      
      const activityData: Partial<Activity> = {
        ...values,
        startTime: formatTimeSafe(values.startTime),
        endTime: formatTimeSafe(values.endTime),
        rules,
        status: 'draft',
      };

      if (isEdit && id) {
        await updateActivity(id, activityData);
        message.success('草稿已保存');
      } else {
        const newId = await createActivity(activityData);
        message.success('草稿已保存');
        navigate(`/activity/edit/${newId}`);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleNextStep = async () => {
    try {
      const values = await form.validateFields();
      const rules = getActivityRules(values);
      
      const activityData: Partial<Activity> = {
        ...values,
        startTime: formatTimeSafe(values.startTime),
        endTime: formatTimeSafe(values.endTime),
        rules,
        status: 'draft',
      };
      
      setFormData(activityData);
      
      if (currentStep === 0) {
        if (isEdit && id) {
          await updateActivity(id, activityData);
          message.success('已保存，进入下一步');
          setCurrentStep(1);
        } else {
          const newId = await createActivity(activityData);
          message.success('已保存，进入下一步');
          navigate(`/activity/edit/${newId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(0);
  };

  const handleGoToProducts = async () => {
    if (isEdit && id) {
      try {
        const values = await form.validateFields();
        const rules = getActivityRules(values);
        const activityData: Partial<Activity> = {
          ...values,
          startTime: formatTimeSafe(values.startTime),
          endTime: formatTimeSafe(values.endTime),
          rules,
        };
        await updateActivity(id, activityData);
        navigate(`/activity/${id}/products`);
      } catch (error) {
        navigate(`/activity/${id}/products`);
      }
    } else {
      const newId = await handleSaveDraftAndReturnId();
      if (newId) {
        navigate(`/activity/${newId}/products`);
      }
    }
  };

  const handleGoToStores = async () => {
    if (isEdit && id) {
      try {
        const values = await form.validateFields();
        const rules = getActivityRules(values);
        const activityData: Partial<Activity> = {
          ...values,
          startTime: formatTimeSafe(values.startTime),
          endTime: formatTimeSafe(values.endTime),
          rules,
        };
        await updateActivity(id, activityData);
        navigate(`/activity/${id}/stores`);
      } catch (error) {
        navigate(`/activity/${id}/stores`);
      }
    } else {
      const newId = await handleSaveDraftAndReturnId();
      if (newId) {
        navigate(`/activity/${newId}/stores`);
      }
    }
  };

  const handleSaveDraftAndReturnId = async (): Promise<string | null> => {
    try {
      const values = await form.validateFields();
      const rules = getActivityRules(values);
      
      const activityData: Partial<Activity> = {
        ...values,
        startTime: formatTimeSafe(values.startTime),
        endTime: formatTimeSafe(values.endTime),
        rules,
        status: 'draft',
      };

      if (isEdit && id) {
        await updateActivity(id, activityData);
        return id;
      } else {
        const newId = await createActivity(activityData);
        return newId;
      }
    } catch (error) {
      console.error('Validation failed:', error);
      return null;
    }
  };

  const handleSubmitApproval = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmitApproval = async () => {
    try {
      const values = await form.validateFields();
      const rules = getActivityRules(values);
      
      const activityData: Partial<Activity> = {
        ...values,
        startTime: formatTimeSafe(values.startTime),
        endTime: formatTimeSafe(values.endTime),
        rules,
        status: 'pending',
        approvalRemark,
      };

      if (isEdit && id) {
        await updateActivity(id, activityData);
        message.success('活动已提交审批');
      } else {
        const newId = await createActivity(activityData);
        message.success('活动已提交审批');
      }
      
      setShowSubmitModal(false);
      navigate('/activity/list');
    } catch (error) {
      message.error('提交失败，请重试');
    }
  };

  const steps = [
    { title: '基础信息配置', icon: <Info size={16} /> },
    { title: '商品与门店配置', icon: <ShoppingBag size={16} /> },
  ];

  const renderBasicInfoForm = () => (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
          活动基本信息
        </h3>
        
        <Form layout="vertical">
          <Form.Item
            name="name"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input
              placeholder="请输入活动名称"
              size="large"
              className="rounded-xl"
              maxLength={50}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
          >
            <TextArea
              placeholder="请输入活动描述"
              rows={3}
              className="rounded-xl"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="startTime"
              label="开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                className="w-full rounded-xl"
                size="large"
                placeholder="选择开始时间"
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                className="w-full rounded-xl"
                size="large"
                placeholder="选择结束时间"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="priority"
            label="活动优先级"
            tooltip="优先级越高，活动展示越靠前"
            initialValue={5}
          >
            <InputNumber
              min={1}
              max={10}
              className="w-full rounded-xl"
              size="large"
              placeholder="请输入优先级（1-10）"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">2</span>
          活动类型选择
        </h3>

        <Form.Item name="type" rules={[{ required: true, message: '请选择活动类型' }]}>
          <Radio.Group onChange={handleTypeChange} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(ACTIVITY_TYPE_LABEL).map(([key, label]) => (
                <Radio.Button
                  key={key}
                  value={key}
                  className={cn(
                    'h-auto p-6 rounded-2xl border-2 transition-all duration-300',
                    'flex flex-col items-center justify-center gap-3',
                    activityType === key
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  )}
                >
                  <span className="text-4xl">
                    {key === 'full_reduction' ? '💰' : key === 'discount' ? '🏷️' : '🎁'}
                  </span>
                  <span className="font-semibold text-base">{label}</span>
                  <span className="text-xs text-gray-500 text-center">
                    {key === 'full_reduction' && '满一定金额减免部分金额'}
                    {key === 'discount' && '按折扣比例计算优惠'}
                    {key === 'gift' && '满一定金额赠送礼品'}
                  </span>
                </Radio.Button>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
          活动规则配置
        </h3>

        {activityType === 'full_reduction' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">设置阶梯满减规则，用户消费满对应金额即可享受减免</p>
              <Button
                type="primary"
                size="small"
                icon={<Plus size={14} />}
                onClick={addFullReductionRule}
                className="rounded-full"
              >
                添加阶梯
              </Button>
            </div>
            
            <div className="space-y-3">
              {fullReductionRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                  <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 font-medium">满</span>
                  <InputNumber
                    min={0}
                    value={rule.threshold}
                    onChange={(value) => updateFullReductionRule(index, 'threshold', value || 0)}
                    className="w-24"
                    size="large"
                    addonAfter="元"
                  />
                  <span className="text-gray-700 font-medium">减</span>
                  <InputNumber
                    min={0}
                    value={rule.discount}
                    onChange={(value) => updateFullReductionRule(index, 'discount', value || 0)}
                    className="w-24"
                    size="large"
                    addonAfter="元"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => removeFullReductionRule(index)}
                    className="ml-auto"
                    disabled={fullReductionRules.length <= 1}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activityType === 'discount' && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <Form.Item
              name={['discountRule', 'discount']}
              label="折扣比例"
              initialValue={9}
              rules={[{ required: true, message: '请输入折扣比例' }]}
            >
              <InputNumber
                min={1}
                max={9.9}
                step={0.1}
                size="large"
                className="w-40"
                addonAfter="折"
                placeholder="输入折扣"
              />
            </Form.Item>
            <p className="text-sm text-gray-500 mt-2">
              例如：9折表示原价的90%，用户可享受10%的优惠
            </p>
          </div>
        )}

        {activityType === 'gift' && (
          <div className="space-y-4 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
            <Form.Item
              name={['giftRule', 'threshold']}
              label="满赠门槛"
              initialValue={200}
              rules={[{ required: true, message: '请输入满赠门槛' }]}
            >
              <InputNumber
                min={0}
                size="large"
                className="w-40"
                addonAfter="元"
                placeholder="消费满多少元"
              />
            </Form.Item>
            
            <Form.Item
              name={['giftRule', 'giftProductName']}
              label="赠品名称"
              rules={[{ required: true, message: '请输入赠品名称' }]}
            >
              <Input
                placeholder="请输入赠品名称"
                size="large"
                className="w-full max-w-md rounded-xl"
              />
            </Form.Item>
            
            <Form.Item
              name={['giftRule', 'giftQuantity']}
              label="赠送数量"
              initialValue={1}
              rules={[{ required: true, message: '请输入赠送数量' }]}
            >
              <InputNumber
                min={1}
                size="large"
                className="w-40"
                addonAfter="份"
                placeholder="每份订单赠送数量"
              />
            </Form.Item>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">4</span>
          会员等级限制
        </h3>

        <Form.Item
          name="memberLevels"
          label="选择适用的会员等级（不选则表示全部会员可用）"
        >
          <Checkbox.Group className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(MEMBER_LEVEL_LABEL).map(([key, label]) => (
                <Checkbox
                  key={key}
                  value={key}
                  className="!m-0 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        backgroundColor: {
                          normal: '#9CA3AF',
                          silver: '#C0C0C0',
                          gold: '#D4AF37',
                          platinum: '#E5E4E2',
                          diamond: '#B9F2FF',
                        }[key as MemberLevel],
                      }}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Card>
    </div>
  );

  const renderNextStepForm = () => (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">配置参与商品</h3>
        <p className="text-gray-500 mb-4">选择本次活动参与的商品范围</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="large"
            icon={<ShoppingBag size={18} />}
            onClick={handleGoToProducts}
            className="h-auto py-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
          >
            <span className="text-2xl">🛍️</span>
            <span className="font-semibold text-base">去配置商品</span>
            <span className="text-xs text-gray-500">选择参与活动的商品</span>
          </Button>
          
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">已选商品</p>
            <p className="text-3xl font-bold text-gray-900">
              {currentActivity?.productIds.length || formData.productIds?.length || 0}
            </p>
            <p className="text-xs text-gray-500">件商品</p>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">配置门店范围</h3>
        <p className="text-gray-500 mb-4">选择本次活动适用的门店范围</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="large"
            icon={<MapPin size={18} />}
            onClick={handleGoToStores}
            className="h-auto py-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
          >
            <span className="text-2xl">📍</span>
            <span className="font-semibold text-base">去配置门店</span>
            <span className="text-xs text-gray-500">选择参与活动的门店</span>
          </Button>
          
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">已选门店</p>
            <p className="text-3xl font-bold text-gray-900">
              {currentActivity?.storeIds.length || formData.storeIds?.length || 0}
            </p>
            <p className="text-xs text-gray-500">家门店</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const getPreviewData = (): Partial<Activity> => {
    const values = form.getFieldsValue();
    const rules = getActivityRules(values);
    
    return {
      name: values.name,
      description: values.description,
      type: activityType,
      startTime: formatTimeSafe(values.startTime),
      endTime: formatTimeSafe(values.endTime),
      priority: values.priority,
      memberLevels: values.memberLevels || [],
      rules,
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? '编辑活动' : '新建活动'}
        subtitle={isEdit ? '修改活动配置信息' : '创建新的促销活动'}
        breadcrumbs={[
          { label: '活动列表', path: '/activity/list' },
          { label: isEdit ? '编辑活动' : '新建活动' },
        ]}
        extra={
          <Space>
            <Button
              size="large"
              icon={<Save size={18} />}
              onClick={handleSaveDraft}
              className="rounded-full"
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Send size={18} />}
              onClick={handleSubmitApproval}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
            >
              提交审批
            </Button>
          </Space>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-0 shadow-sm p-6">
            <Steps current={currentStep} items={steps} className="mb-6" />
            
            <Divider />
            
            {currentStep === 0 && renderBasicInfoForm()}
            {currentStep === 1 && renderNextStepForm()}
            
            <Divider />
            
            <div className="flex items-center justify-between pt-4">
              <Button
                size="large"
                icon={<ArrowLeft size={18} />}
                onClick={() => navigate('/activity/list')}
                className="rounded-full"
              >
                返回列表
              </Button>
              
              <Space>
                {currentStep > 0 && (
                  <Button
                    size="large"
                    icon={<ArrowLeft size={18} />}
                    onClick={handlePrevStep}
                    className="rounded-full"
                  >
                    上一步
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRight size={18} />}
                    onClick={handleNextStep}
                    className="rounded-full"
                  >
                    下一步
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <RulePreview activity={getPreviewData()} />
          </div>
        </div>
      </div>

      <Modal
        title="提交审批"
        open={showSubmitModal}
        onOk={confirmSubmitApproval}
        onCancel={() => setShowSubmitModal(false)}
        okText="确认提交"
        cancelText="取消"
        width={500}
      >
        <p className="text-gray-600 mb-4">
          提交后活动将进入审批流程，审批通过后将按设定时间自动生效。
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-sm font-medium text-blue-800 mb-1">审批流程</p>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</span>
              运营专员提交
              <span className="text-gray-400">→</span>
              <span className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold">2</span>
              营销主管审批
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">审批备注（可选）</label>
            <TextArea
              rows={3}
              value={approvalRemark}
              onChange={(e) => setApprovalRemark(e.target.value)}
              placeholder="请输入备注信息..."
              className="rounded-xl"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActivityEditPage;
