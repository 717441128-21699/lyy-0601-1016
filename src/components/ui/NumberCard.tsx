import { ReactNode, CSSProperties } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from 'antd';
import { cn } from '@/lib/utils';
import { formatNumber, formatMoney, formatGrowth } from '@/utils/format';

interface NumberCardProps {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  format?: 'number' | 'money' | 'percent';
  decimals?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const NumberCard = ({
  label,
  value,
  unit,
  trend,
  prefix,
  suffix,
  format = 'number',
  decimals = 0,
  className,
  style,
  onClick,
}: NumberCardProps) => {
  const formatValue = () => {
    switch (format) {
      case 'money':
        return formatMoney(value, decimals);
      case 'percent':
        return `${value.toFixed(decimals)}%`;
      default:
        return formatNumber(value, decimals);
    }
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'border-0 rounded-2xl overflow-hidden',
        className
      )}
      style={style}
      styles={{
        body: { padding: '24px' },
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-2 font-medium">{label}</p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-2xl text-gray-400">{prefix}</span>}
            <span 
              className="text-3xl font-bold text-gray-900 tracking-tight"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatValue()}
            </span>
            {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}
            {suffix && <span className="text-lg text-gray-400">{suffix}</span>}
          </div>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold',
                  trend >= 0
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp size={12} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={12} strokeWidth={2.5} />
                )}
                {formatGrowth(trend)}
              </div>
              <span className="text-xs text-gray-400">较上期</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {prefix}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </Card>
  );
};

export default NumberCard;
