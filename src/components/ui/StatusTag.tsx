import { Tag } from 'antd';
import { cn } from '@/lib/utils';
import { ActivityStatus, ACTIVITY_STATUS_LABEL, ACTIVITY_STATUS_COLOR } from '@/types/activity';
import type { Store } from '@/types/store';
import { STORE_STATUS_LABEL, STORE_STATUS_COLOR } from '@/types/store';
import type { Product } from '@/types/product';
import { PRODUCT_STATUS_LABEL, PRODUCT_STATUS_COLOR } from '@/types/product';

type StoreStatus = Store['status'];
type ProductStatus = Product['status'];

interface StatusTagProps {
  status: ActivityStatus | StoreStatus | ProductStatus;
  type?: 'activity' | 'store' | 'product';
  className?: string;
}

const StatusTag = ({ status, type = 'activity', className }: StatusTagProps) => {
  let label = '';
  let color = 'default';
  
  if (type === 'activity') {
    label = ACTIVITY_STATUS_LABEL[status as ActivityStatus];
    color = ACTIVITY_STATUS_COLOR[status as ActivityStatus];
  } else if (type === 'store') {
    label = STORE_STATUS_LABEL[status as StoreStatus];
    color = STORE_STATUS_COLOR[status as StoreStatus];
  } else if (type === 'product') {
    label = PRODUCT_STATUS_LABEL[status as ProductStatus];
    color = PRODUCT_STATUS_COLOR[status as ProductStatus];
  }

  const getBgColor = () => {
    switch (color) {
      case 'success': return 'bg-green-50 text-green-700 border-green-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <Tag
      className={cn(
        'border rounded-full px-3 py-1 text-xs font-medium',
        'inline-flex items-center gap-1.5',
        getBgColor(),
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        color === 'success' && 'bg-green-500',
        color === 'warning' && 'bg-amber-500',
        color === 'error' && 'bg-red-500',
        color === 'processing' && 'bg-blue-500',
        color === 'default' && 'bg-gray-400'
      )} />
      {label}
    </Tag>
  );
};

export default StatusTag;
