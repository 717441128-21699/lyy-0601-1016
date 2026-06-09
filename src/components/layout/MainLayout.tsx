import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { 
  LayoutDashboard, 
  Tag, 
  PlusCircle, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Store,
  User,
  Bell,
  Settings
} from 'lucide-react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: 'activity',
    icon: <Tag size={20} />,
    label: '促销管理',
    children: [
      {
        key: '/activity/list',
        icon: <LayoutDashboard size={18} />,
        label: '活动列表',
      },
      {
        key: '/activity/create',
        icon: <PlusCircle size={18} />,
        label: '新建活动',
      },
    ],
  },
  {
    key: 'analysis',
    icon: <BarChart3 size={20} />,
    label: '数据分析',
    children: [
      {
        key: '/activity/analysis',
        icon: <BarChart3 size={18} />,
        label: '效果分析',
      },
    ],
  },
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedKey = location.pathname.includes('/analysis') 
    ? '/activity/analysis' 
    : location.pathname.includes('/create')
    ? '/activity/create'
    : '/activity/list';

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="border-r border-gray-100"
        style={{
          background: 'linear-gradient(180deg, #1E3A5F 0%, #162D4A 100%)',
        }}
      >
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
              <Store size={22} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-wide">智慧零售</span>
                <span className="text-white/60 text-xs">促销管理平台</span>
              </div>
            )}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0 mt-4 bg-transparent"
          style={{
            background: 'transparent',
          }}
        />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 group"
        >
          {collapsed ? (
            <ChevronRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft size={16} className="text-white group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>
      </Sider>
      
      <Layout>
        <Header 
          className="flex items-center justify-between px-6 h-16 border-b border-gray-100"
          style={{ background: colorBgContainer }}
        >
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800">
              {location.pathname.includes('/list') && '活动列表'}
              {location.pathname.includes('/create') && '新建活动'}
              {location.pathname.includes('/edit') && '编辑活动'}
              {location.pathname.includes('/products') && '商品选择'}
              {location.pathname.includes('/stores') && '门店范围'}
              {location.pathname.includes('/analysis') && '效果分析'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Settings size={20} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-800">运营专员</div>
                <div className="text-xs text-gray-500">admin@retail.com</div>
              </div>
            </div>
          </div>
        </Header>
        
        <Content
          className={cn(
            "m-6 p-6 rounded-2xl min-h-[calc(100vh-120px)]",
            "transition-all duration-300"
          )}
          style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
