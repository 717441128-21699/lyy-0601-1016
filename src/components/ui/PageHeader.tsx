import { ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, breadcrumbs, extra, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <button
            onClick={() => navigate('/activity/list')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Home size={14} />
            <span>首页</span>
          </button>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-300" />
              {item.path ? (
                <button
                  onClick={() => navigate(item.path!)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-gray-800 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        {extra && <div className="flex items-center gap-3">{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
