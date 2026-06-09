import { Product, ProductCategory } from '@/types/product';

const generateId = () => `prod-${Math.random().toString(36).substring(2, 8)}`;

export const mockProductCategories: ProductCategory[] = [
  {
    id: 'cat-001',
    name: '食品饮料',
    parentId: null,
    productCount: 45,
    children: [
      { id: 'cat-001-01', name: '休闲零食', parentId: 'cat-001', productCount: 15 },
      { id: 'cat-001-02', name: '饮料冲调', parentId: 'cat-001', productCount: 20 },
      { id: 'cat-001-03', name: '粮油调味', parentId: 'cat-001', productCount: 10 },
    ],
  },
  {
    id: 'cat-002',
    name: '个护美妆',
    parentId: null,
    productCount: 38,
    children: [
      { id: 'cat-002-01', name: '护肤', parentId: 'cat-002', productCount: 18 },
      { id: 'cat-002-02', name: '彩妆', parentId: 'cat-002', productCount: 12 },
      { id: 'cat-002-03', name: '个人护理', parentId: 'cat-002', productCount: 8 },
    ],
  },
  {
    id: 'cat-003',
    name: '家居日用',
    parentId: null,
    productCount: 52,
    children: [
      { id: 'cat-003-01', name: '清洁用品', parentId: 'cat-003', productCount: 15 },
      { id: 'cat-003-02', name: '厨房用品', parentId: 'cat-003', productCount: 20 },
      { id: 'cat-003-03', name: '床上用品', parentId: 'cat-003', productCount: 17 },
    ],
  },
  {
    id: 'cat-004',
    name: '母婴用品',
    parentId: null,
    productCount: 28,
    children: [
      { id: 'cat-004-01', name: '婴儿食品', parentId: 'cat-004', productCount: 10 },
      { id: 'cat-004-02', name: '婴儿护理', parentId: 'cat-004', productCount: 12 },
      { id: 'cat-004-03', name: '玩具', parentId: 'cat-004', productCount: 6 },
    ],
  },
  {
    id: 'cat-005',
    name: '数码家电',
    parentId: null,
    productCount: 37,
    children: [
      { id: 'cat-005-01', name: '手机配件', parentId: 'cat-005', productCount: 12 },
      { id: 'cat-005-02', name: '家用电器', parentId: 'cat-005', productCount: 15 },
      { id: 'cat-005-03', name: '数码配件', parentId: 'cat-005', productCount: 10 },
    ],
  },
];

const productBrands = ['雀巢', '可口可乐', '欧莱雅', '雅诗兰黛', '小米', '华为', '蓝月亮', '维达', '贝亲', '好奇'];
const productNames: Record<string, string[]> = {
  'cat-001-01': ['薯片大礼包', '坚果混合装', '巧克力礼盒', '饼干曲奇', '牛肉干'],
  'cat-001-02': ['纯牛奶', '果汁饮料', '速溶咖啡', '茶叶礼盒', '矿泉水'],
  'cat-001-03': ['食用油', '大米', '面粉', '酱油醋', '调味料'],
  'cat-002-01': ['面霜', '精华液', '面膜', '洗面奶', '防晒霜'],
  'cat-002-02': ['口红', '粉底液', '眼影盘', '睫毛膏', '腮红'],
  'cat-002-03': ['洗发水', '沐浴露', '牙膏', '洗手液', '身体乳'],
  'cat-003-01': ['洗衣液', '洗洁精', '洁厕灵', '消毒液', '垃圾袋'],
  'cat-003-02': ['炒锅', '电饭煲', '保温杯', '餐具套装', '保鲜盒'],
  'cat-003-03': ['四件套', '枕头', '被子', '床垫', '窗帘'],
  'cat-004-01': ['婴儿奶粉', '辅食泥', '米粉', '零食', '营养品'],
  'cat-004-02': ['纸尿裤', '湿纸巾', '护臀霜', '沐浴露', '润肤乳'],
  'cat-004-03': ['益智玩具', '毛绒玩具', '积木', '遥控车', '绘本'],
  'cat-005-01': ['手机壳', '充电器', '数据线', '耳机', '充电宝'],
  'cat-005-02': ['电吹风', '电动牙刷', '加湿器', '空气净化器', '扫地机器人'],
  'cat-005-03': ['U盘', '硬盘', '鼠标', '键盘', '摄像头'],
};

const specs = ['500g/袋', '1L/瓶', '250ml*12盒', '10片/盒', '3kg/罐', '50ml', '100ml', '200ml', '套装', '单件'];

export const mockProducts: Product[] = Array.from({ length: 200 }, (_, i) => {
  const categories = mockProductCategories.flatMap(c => c.children || []);
  const category = categories[i % categories.length];
  const names = productNames[category.id] || ['通用商品'];
  const name = names[i % names.length] + (i > names.length ? ` ${Math.floor(i / names.length) + 1}号` : '');
  const price = Math.floor(Math.random() * 500) + 10;
  const statuses: Product['status'][] = ['on_sale', 'on_sale', 'on_sale', 'off_sale', 'out_of_stock'];
  
  return {
    id: generateId(),
    name,
    sku: `SKU-${String(i + 1).padStart(6, '0')}`,
    categoryId: category.id,
    categoryName: category.name,
    price,
    originalPrice: Math.floor(price * (1.1 + Math.random() * 0.3)),
    stock: Math.floor(Math.random() * 1000),
    imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${name} 商品摄影 白色背景 专业产品图`)}&image_size=square`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    specs: specs[Math.floor(Math.random() * specs.length)],
    brand: productBrands[Math.floor(Math.random() * productBrands.length)],
  };
});
