import { Store, Region } from '@/types/store';

const generateId = () => `store-${Math.random().toString(36).substring(2, 8)}`;

export const mockRegions: Region[] = [
  {
    code: '110000',
    name: '北京市',
    level: 'province',
    parentCode: null,
    storeCount: 15,
    children: [
      {
        code: '110100',
        name: '北京市',
        level: 'city',
        parentCode: '110000',
        storeCount: 15,
        children: [
          { code: '110101', name: '东城区', level: 'district', parentCode: '110100', storeCount: 3 },
          { code: '110102', name: '西城区', level: 'district', parentCode: '110100', storeCount: 4 },
          { code: '110105', name: '朝阳区', level: 'district', parentCode: '110100', storeCount: 5 },
          { code: '110106', name: '丰台区', level: 'district', parentCode: '110100', storeCount: 3 },
        ],
      },
    ],
  },
  {
    code: '310000',
    name: '上海市',
    level: 'province',
    parentCode: null,
    storeCount: 18,
    children: [
      {
        code: '310100',
        name: '上海市',
        level: 'city',
        parentCode: '310000',
        storeCount: 18,
        children: [
          { code: '310101', name: '黄浦区', level: 'district', parentCode: '310100', storeCount: 4 },
          { code: '310104', name: '徐汇区', level: 'district', parentCode: '310100', storeCount: 5 },
          { code: '310105', name: '长宁区', level: 'district', parentCode: '310100', storeCount: 3 },
          { code: '310106', name: '静安区', level: 'district', parentCode: '310100', storeCount: 3 },
          { code: '310107', name: '普陀区', level: 'district', parentCode: '310100', storeCount: 3 },
        ],
      },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    level: 'province',
    parentCode: null,
    storeCount: 25,
    children: [
      {
        code: '440100',
        name: '广州市',
        level: 'city',
        parentCode: '440000',
        storeCount: 12,
        children: [
          { code: '440103', name: '荔湾区', level: 'district', parentCode: '440100', storeCount: 3 },
          { code: '440104', name: '越秀区', level: 'district', parentCode: '440100', storeCount: 3 },
          { code: '440105', name: '海珠区', level: 'district', parentCode: '440100', storeCount: 3 },
          { code: '440106', name: '天河区', level: 'district', parentCode: '440100', storeCount: 3 },
        ],
      },
      {
        code: '440300',
        name: '深圳市',
        level: 'city',
        parentCode: '440000',
        storeCount: 13,
        children: [
          { code: '440303', name: '罗湖区', level: 'district', parentCode: '440300', storeCount: 3 },
          { code: '440304', name: '福田区', level: 'district', parentCode: '440300', storeCount: 4 },
          { code: '440305', name: '南山区', level: 'district', parentCode: '440300', storeCount: 4 },
          { code: '440306', name: '宝安区', level: 'district', parentCode: '440300', storeCount: 2 },
        ],
      },
    ],
  },
  {
    code: '330000',
    name: '浙江省',
    level: 'province',
    parentCode: null,
    storeCount: 20,
    children: [
      {
        code: '330100',
        name: '杭州市',
        level: 'city',
        parentCode: '330000',
        storeCount: 12,
        children: [
          { code: '330102', name: '上城区', level: 'district', parentCode: '330100', storeCount: 3 },
          { code: '330103', name: '下城区', level: 'district', parentCode: '330100', storeCount: 3 },
          { code: '330104', name: '江干区', level: 'district', parentCode: '330100', storeCount: 3 },
          { code: '330105', name: '拱墅区', level: 'district', parentCode: '330100', storeCount: 3 },
        ],
      },
      {
        code: '330200',
        name: '宁波市',
        level: 'city',
        parentCode: '330000',
        storeCount: 8,
        children: [
          { code: '330203', name: '海曙区', level: 'district', parentCode: '330200', storeCount: 3 },
          { code: '330205', name: '江北区', level: 'district', parentCode: '330200', storeCount: 2 },
          { code: '330206', name: '北仑区', level: 'district', parentCode: '330200', storeCount: 3 },
        ],
      },
    ],
  },
  {
    code: '320000',
    name: '江苏省',
    level: 'province',
    parentCode: null,
    storeCount: 22,
    children: [
      {
        code: '320100',
        name: '南京市',
        level: 'city',
        parentCode: '320000',
        storeCount: 11,
        children: [
          { code: '320102', name: '玄武区', level: 'district', parentCode: '320100', storeCount: 3 },
          { code: '320104', name: '秦淮区', level: 'district', parentCode: '320100', storeCount: 3 },
          { code: '320105', name: '建邺区', level: 'district', parentCode: '320100', storeCount: 2 },
          { code: '320106', name: '鼓楼区', level: 'district', parentCode: '320100', storeCount: 3 },
        ],
      },
      {
        code: '320500',
        name: '苏州市',
        level: 'city',
        parentCode: '320000',
        storeCount: 11,
        children: [
          { code: '320502', name: '姑苏区', level: 'district', parentCode: '320500', storeCount: 3 },
          { code: '320503', name: '吴中区', level: 'district', parentCode: '320500', storeCount: 4 },
          { code: '320504', name: '相城区', level: 'district', parentCode: '320500', storeCount: 4 },
        ],
      },
    ],
  },
];

const storeNames = ['万达广场店', '银泰百货店', '万象城店', '大悦城店', '恒隆广场店', '来福士店', '华润万家店', '永辉超市店', '大润发店', '家乐福店'];
const managers = ['王经理', '李店长', '张主管', '刘主任', '陈店长', '杨经理', '赵店长', '黄主管', '周主任', '吴店长'];

const getRandomRegion = () => {
  const provinces = mockRegions;
  const province = provinces[Math.floor(Math.random() * provinces.length)];
  const cities = province.children || [];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const districts = city.children || [];
  const district = districts[Math.floor(Math.random() * districts.length)];
  return { province, city, district };
};

export const mockStores: Store[] = Array.from({ length: 100 }, (_, i) => {
  const { province, city, district } = getRandomRegion();
  const statuses: Store['status'][] = ['open', 'open', 'open', 'open', 'closed', 'renovating'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: generateId(),
    name: `${city.name}${storeNames[i % storeNames.length]}${Math.floor(i / storeNames.length) + 1}号`,
    code: `STORE-${String(i + 1).padStart(5, '0')}`,
    province: province.name,
    city: city.name,
    district: district.name,
    address: `${district.name}某某街道${Math.floor(Math.random() * 100) + 1}号`,
    status,
    area: Math.floor(Math.random() * 500) + 100,
    manager: managers[Math.floor(Math.random() * managers.length)],
    phone: `1${Math.floor(Math.random() * 9 + 3)}${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
    regionCode: district.code,
  };
});
