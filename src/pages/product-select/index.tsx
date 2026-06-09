import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Input,
  Button,
  Card,
  Checkbox,
  Tree,
  Slider,
  Select,
  Empty,
  Spin,
  Pagination,
  message,
  Tag,
  Space,
  Badge
} from 'antd';
import {
  Search,
  ShoppingBag,
  ArrowLeft,
  Save,
  X,
  Plus,
  Minus,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import type { DataNode } from 'antd/es/tree';
import PageHeader from '@/components/ui/PageHeader';
import StatusTag from '@/components/ui/StatusTag';
import { useActivityStore } from '@/store/useActivityStore';
import { mockProducts, mockProductCategories } from '@/mock/product';
import { Product, ProductCategory } from '@/types/product';
import { formatMoney, formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';

const { Option } = Select;
const { Search: SearchInput } = Input;

const ProductSelectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentActivity, fetchDetail, updateActivity } = useActivityStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [statusFilter, setStatusFilter] = useState<Product['status'] | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [showExcluded, setShowExcluded] = useState(false);
  const [products] = useState(mockProducts);
  const [categories] = useState(mockProductCategories);

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id, fetchDetail]);

  useEffect(() => {
    if (currentActivity) {
      setSelectedIds(currentActivity.productIds);
      setExcludedIds(currentActivity.excludedProductIds);
    }
  }, [currentActivity]);

  useEffect(() => {
    document.title = '商品选择 - 智慧零售促销管理平台';
  }, []);

  const buildTreeData = (categories: ProductCategory[]): DataNode[] => {
    return categories.map(cat => ({
      title: (
        <span className="flex items-center justify-between w-full">
          <span>{cat.name}</span>
          <span className="text-xs text-gray-400">({cat.productCount})</span>
        </span>
      ),
      key: cat.id,
      children: cat.children ? buildTreeData(cat.children) : undefined,
    }));
  };

  const treeData = useMemo(() => buildTreeData(categories), [categories]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(kw) ||
        p.sku.toLowerCase().includes(kw) ||
        p.brand.toLowerCase().includes(kw)
      );
    }
    
    if (selectedCategory) {
      const allChildIds = getCategoryChildIds(selectedCategory);
      result = result.filter(p => 
        p.categoryId === selectedCategory || allChildIds.includes(p.categoryId)
      );
    }
    
    result = result.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    
    return result;
  }, [products, keyword, selectedCategory, priceRange, statusFilter, categories]);

  const getCategoryChildIds = (categoryId: string): string[] => {
    const ids: string[] = [];
    const findCategory = (cats: ProductCategory[]): ProductCategory | null => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const category = findCategory(categories);
    if (category?.children) {
      for (const child of category.children) {
        ids.push(child.id);
        if (child.children) {
          ids.push(...getCategoryChildIds(child.id));
        }
      }
    }
    
    return ids;
  };

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const handleSelectProduct = (productId: string) => {
    if (excludedIds.includes(productId)) {
      setExcludedIds(excludedIds.filter(id => id !== productId));
    }
    
    if (selectedIds.includes(productId)) {
      setSelectedIds(selectedIds.filter(id => id !== productId));
    } else {
      setSelectedIds([...selectedIds, productId]);
    }
  };

  const handleExcludeProduct = (productId: string) => {
    if (selectedIds.includes(productId)) {
      setSelectedIds(selectedIds.filter(id => id !== productId));
    }
    
    if (excludedIds.includes(productId)) {
      setExcludedIds(excludedIds.filter(id => id !== productId));
    } else {
      setExcludedIds([...excludedIds, productId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      await updateActivity(id, {
        productIds: selectedIds,
        excludedProductIds: excludedIds,
      });
      message.success('商品配置已保存');
      navigate(`/activity/edit/${id}`);
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProducts = () => products.filter(p => selectedIds.includes(p.id));
  const getExcludedProducts = () => products.filter(p => excludedIds.includes(p.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="商品选择"
        subtitle="选择参与活动的商品范围"
        breadcrumbs={[
          { label: '活动列表', path: '/activity/list' },
          { label: '编辑活动', path: id ? `/activity/edit/${id}` : '/activity/create' },
          { label: '商品选择' },
        ]}
        extra={
          <Space>
            <Button
              size="large"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate(id ? `/activity/edit/${id}` : '/activity/create')}
              className="rounded-full"
            >
              返回编辑
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Save size={18} />}
              onClick={handleSave}
              loading={loading}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
            >
              保存配置
            </Button>
          </Space>
        }
      />

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <ShoppingBag size={20} className="text-blue-600" />
          <div>
            <p className="text-xs text-blue-600">已选商品</p>
            <p className="text-xl font-bold text-blue-700">{selectedIds.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-50 border border-red-100">
          <X size={20} className="text-red-600" />
          <div>
            <p className="text-xs text-red-600">排除商品</p>
            <p className="text-xl font-bold text-red-700">{excludedIds.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
          <Filter size={20} className="text-gray-600" />
          <div>
            <p className="text-xs text-gray-600">筛选结果</p>
            <p className="text-xl font-bold text-gray-700">{filteredProducts.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Filter size={18} />
              筛选条件
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品分类</label>
                <Tree
                  treeData={treeData}
                  defaultExpandAll
                  onSelect={(selectedKeys) => {
                    setSelectedCategory(selectedKeys[0] as string);
                    setPage(1);
                  }}
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                  className="category-tree"
                />
                {selectedCategory && (
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setPage(1);
                    }}
                    className="mt-2 text-blue-600"
                  >
                    清除分类筛选
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格区间：{formatMoney(priceRange[0], 0)} - {formatMoney(priceRange[1], 0)}
                </label>
                <Slider
                  range
                  min={0}
                  max={1000}
                  value={priceRange}
                  onChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品状态</label>
                <Select
                  className="w-full"
                  placeholder="全部状态"
                  allowClear
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <Option value="on_sale">在售</Option>
                  <Option value="off_sale">下架</Option>
                  <Option value="out_of_stock">缺货</Option>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">已选商品</h3>
              <Button
                type="text"
                size="small"
                onClick={() => setShowExcluded(!showExcluded)}
                className={showExcluded ? 'text-red-600' : 'text-gray-500'}
              >
                {showExcluded ? '查看已选' : '查看排除'}
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {!showExcluded ? (
                getSelectedProducts().length > 0 ? (
                  getSelectedProducts().map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-orange-600 font-semibold">{formatMoney(product.price)}</p>
                      </div>
                      <button
                        onClick={() => handleSelectProduct(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty description="暂无已选商品" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              ) : (
                getExcludedProducts().length > 0 ? (
                  getExcludedProducts().map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-red-600">已排除</p>
                      </div>
                      <button
                        onClick={() => handleExcludeProduct(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty description="暂无排除商品" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-2xl border-0 shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  placeholder="搜索商品名称、SKU、品牌"
                  allowClear
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  className="w-80"
                  prefix={<Search size={16} className="text-gray-400" />}
                />
                
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                    <CheckSquare size={18} className="text-blue-500" />
                  ) : (
                    <Square size={18} />
                  )}
                  全选当前筛选
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">共 {filteredProducts.length} 件商品</span>
              </div>
            </div>
          </Card>

          <Spin spinning={loading} tip="加载中...">
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map(product => {
                    const isSelected = selectedIds.includes(product.id);
                    const isExcluded = excludedIds.includes(product.id);
                    
                    return (
                      <Card
                        key={product.id}
                        className={cn(
                          'group cursor-pointer transition-all duration-300 border-2',
                          'hover:shadow-xl hover:-translate-y-1 rounded-2xl overflow-hidden',
                          isSelected && 'border-blue-500 bg-blue-50/30',
                          isExcluded && 'border-red-300 bg-red-50/30 opacity-60'
                        )}
                        styles={{ body: { padding: 0 } }}
                      >
                        <div className="relative">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Checkbox
                              checked={isSelected}
                              disabled={isExcluded}
                              onChange={() => handleSelectProduct(product.id)}
                              className="!bg-white/90 backdrop-blur-sm"
                            />
                          </div>
                          {isExcluded && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Tag color="red" className="text-sm font-semibold">已排除</Tag>
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2">
                            <StatusTag status={product.status} type="product" />
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-1 truncate group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            {product.brand} · {product.specs}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-orange-600">
                                {formatMoney(product.price)}
                              </span>
                              <span className="text-xs text-gray-400 line-through ml-2">
                                {formatMoney(product.originalPrice)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">库存: {product.stock}</span>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="small"
                              type={isSelected ? 'primary' : 'default'}
                              icon={isSelected ? <Minus size={14} /> : <Plus size={14} />}
                              onClick={() => handleSelectProduct(product.id)}
                              className="flex-1 rounded-full"
                              disabled={isExcluded}
                            >
                              {isSelected ? '取消选择' : '选择商品'}
                            </Button>
                            <Button
                              size="small"
                              danger={isExcluded}
                              type={isExcluded ? 'primary' : 'default'}
                              onClick={() => handleExcludeProduct(product.id)}
                              className="rounded-full"
                            >
                              {isExcluded ? '取消排除' : '排除'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-8">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={filteredProducts.length}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 件`}
                    onChange={setPage}
                  />
                </div>
              </>
            ) : (
              <Card className="rounded-2xl border-0 shadow-sm p-12">
                <Empty description="没有找到符合条件的商品" />
              </Card>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectPage;
