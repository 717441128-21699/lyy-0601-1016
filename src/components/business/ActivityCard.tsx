import { Card, Button, Dropdown, MenuProps } from 'antd';
import { 
  Edit, 
  Copy, 
  Pause, 
  Play, 
  Trash2, 
  MoreHorizontal,
  ShoppingBag,
  MapPin,
  BarChart3,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity, ACTIVITY_TYPE_LABEL } from '@/types/activity';
import { formatDate, generateRuleText, formatMoney } from '@/utils/format';
import StatusTag from '../ui/StatusTag';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onViewAnalysis: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const ActivityCard = ({
  activity,
  onEdit,
  onPause,
  onResume,
  onCopy,
  onDelete,
  onViewAnalysis,
  selected,
  onSelect,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const getTypeIcon = () => {
    switch (activity.type) {
      case 'full_reduction': return '💰';
      case 'discount': return '🏷️';
      case 'gift': return '🎁';
      default: return '📋';
    }
  };

  const getTypeGradient = () => {
    switch (activity.type) {
      case 'full_reduction': return 'from-orange-400 to-red-500';
      case 'discount': return 'from-blue-400 to-purple-500';
      case 'gift': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <Edit size={14} />,
      label: '编辑活动',
      onClick: () => onEdit(activity.id),
    },
    {
      key: 'products',
      icon: <ShoppingBag size={14} />,
      label: '商品配置',
      onClick: () => navigate(`/activity/${activity.id}/products`),
    },
    {
      key: 'stores',
      icon: <MapPin size={14} />,
      label: '门店配置',
      onClick: () => navigate(`/activity/${activity.id}/stores`),
    },
    {
      key: 'analysis',
      icon: <BarChart3 size={14} />,
      label: '效果分析',
      onClick: () => onViewAnalysis(activity.id),
    },
    { type: 'divider' },
    {
      key: 'copy',
      icon: <Copy size={14} />,
      label: '复制活动',
      onClick: () => onCopy(activity.id),
    },
    {
      key: activity.status === 'active' ? 'pause' : 'resume',
      icon: activity.status === 'active' ? <Pause size={14} /> : <Play size={14} />,
      label: activity.status === 'active' ? '暂停活动' : '恢复活动',
      onClick: () => activity.status === 'active' ? onPause(activity.id) : onResume(activity.id),
    },
    {
      key: 'delete',
      icon: <Trash2 size={14} />,
      label: '删除活动',
      danger: true,
      onClick: () => onDelete(activity.id),
    },
  ];

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        'border-0 rounded-2xl overflow-hidden',
        selected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
      styles={{ body: { padding: 0 } }}
      onClick={() => onSelect?.(activity.id)}
    >
      <div className={cn('h-2 bg-gradient-to-r', getTypeGradient())} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl',
              'shadow-lg flex-shrink-0',
              getTypeGradient()
            )}>
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base mb-1 truncate group-hover:text-blue-600 transition-colors">
                {activity.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusTag status={activity.status} type="activity" />
                <span className="text-xs text-gray-400">{ACTIVITY_TYPE_LABEL[activity.type]}</span>
              </div>
            </div>
          </div>
          
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreHorizontal size={18} />}
              className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {formatDate(activity.startTime, 'MM-DD')} - {formatDate(activity.endTime, 'MM-DD')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShoppingBag size={14} className="text-gray-400 flex-shrink-0" />
            <span>{activity.productIds.length} 件商品</span>
            <span className="text-gray-300">|</span>
            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            <span>{activity.storeIds.length} 家门店</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 mb-4">
          <p className="text-xs text-gray-500 mb-1">活动规则</p>
          <p className="text-sm font-medium text-gray-800 line-clamp-2">
            {generateRuleText(activity.type, activity.rules)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">预计销售额</p>
            <p className="text-lg font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(activity.productIds.length * 1500 + activity.storeIds.length * 8000, 0)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              size="small"
              className="rounded-full px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(activity.id);
              }}
            >
              编辑
            </Button>
            {activity.status === 'active' && (
              <Button
                size="small"
                danger
                className="rounded-full px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onPause(activity.id);
                }}
              >
                暂停
              </Button>
            )}
            {activity.status === 'paused' && (
              <Button
                size="small"
                type="primary"
                className="rounded-full px-4 bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onResume(activity.id);
                }}
              >
                恢复
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;
