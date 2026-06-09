import { Card, Button } from 'antd';
import { Copy, Check, Calendar, Users, Tag } from 'lucide-react';
import { useState } from 'react';
import { Activity, ActivityType, ACTIVITY_TYPE_LABEL, MEMBER_LEVEL_LABEL, MEMBER_LEVEL_COLOR } from '@/types/activity';
import { formatDate, generateRuleText, copyToClipboard } from '@/utils/format';
import { cn } from '@/lib/utils';

interface RulePreviewProps {
  activity: Partial<Activity>;
  className?: string;
}

const RulePreview = ({ activity, className }: RulePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ruleText = generateFullRuleText();
    const success = await copyToClipboard(ruleText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateFullRuleText = () => {
    const parts: string[] = [];
    
    if (activity.name) {
      parts.push(`【${activity.name}】`);
    }
    
    if (activity.startTime && activity.endTime) {
      parts.push(`活动时间：${formatDate(activity.startTime)} 至 ${formatDate(activity.endTime)}`);
    }
    
    if (activity.type && activity.rules) {
      parts.push(`活动规则：${generateRuleText(activity.type, activity.rules)}`);
    }
    
    if (activity.memberLevels && activity.memberLevels.length > 0) {
      const levels = activity.memberLevels.map(l => MEMBER_LEVEL_LABEL[l]).join('、');
      parts.push(`适用会员：${levels}`);
    }
    
    if (activity.description) {
      parts.push(`活动说明：${activity.description}`);
    }
    
    return parts.join('\n');
  };

  const getTypeIcon = (type?: ActivityType) => {
    switch (type) {
      case 'full_reduction': return '💰';
      case 'discount': return '🏷️';
      case 'gift': return '🎁';
      default: return '📋';
    }
  };

  return (
    <Card
      className={cn('rounded-2xl border-0 shadow-sm overflow-hidden', className)}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            <span className="font-semibold text-gray-800">规则预览</span>
          </div>
          <Button
            type="text"
            size="small"
            icon={copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            onClick={handleCopy}
            className="text-gray-500 hover:text-blue-600"
          >
            {copied ? '已复制' : '复制规则'}
          </Button>
        </div>
      }
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl" />
        <div className="relative p-6 rounded-xl border border-gray-100 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
              {getTypeIcon(activity.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {activity.name || '请输入活动名称'}
              </h3>
              <p className="text-sm text-gray-500">
                {activity.type ? ACTIVITY_TYPE_LABEL[activity.type] : '请选择活动类型'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
              <Calendar size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">活动时间</p>
                <p className="text-sm font-medium text-gray-800">
                  {activity.startTime && activity.endTime
                    ? `${formatDate(activity.startTime)} - ${formatDate(activity.endTime)}`
                    : '请选择活动时间'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50/80 to-red-50/80">
              <Tag size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-1">活动规则</p>
                <p className="text-sm font-semibold text-gray-800">
                  {activity.rules
                    ? generateRuleText(activity.type!, activity.rules)
                    : '请配置活动规则'}
                </p>
              </div>
            </div>

            {activity.memberLevels && activity.memberLevels.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50/80 to-pink-50/80">
                <Users size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">适用会员</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activity.memberLevels.map(level => (
                      <span
                        key={level}
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${MEMBER_LEVEL_COLOR[level]}20`,
                          color: MEMBER_LEVEL_COLOR[level],
                        }}
                      >
                        {MEMBER_LEVEL_LABEL[level]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activity.description && (
              <div className="p-3 rounded-lg bg-gray-50/60">
                <p className="text-xs text-gray-500 mb-1">活动说明</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>优先级：{activity.priority || 5}</span>
              <span>创建人：{activity.createdBy || '当前用户'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RulePreview;
