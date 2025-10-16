import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StockCompanyInfo } from '@/types/stock_details';
import { updateStockCustomTags } from '@/api/stock-details-api';
import { ExternalLink, Building, Globe, Tags, Edit3, Plus, X, Trash2, Check } from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';
import { toast } from 'sonner';


interface StockDetailCardProps {
  stockInfo: StockCompanyInfo;
  onTagsUpdate?: (stockCode: string, newTags: string) => void;
}

export const StockDetailCard = memo<StockDetailCardProps>(function StockDetailCard({ stockInfo, onTagsUpdate }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingParsedTags, setEditingParsedTags] = useState<Record<string, Array<{name: string, detail?: string}>>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagDetail, setNewTagDetail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingTag, setEditingTag] = useState<{categoryName: string, tagIndex: number} | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagDetail, setEditingTagDetail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [localCustomTags, setLocalCustomTags] = useState(stockInfo.custom_tags);
  
  // 解析自定义标签 - 使用 useMemo 缓存结果
  const parseCustomTags = useCallback((tags: string) => {
    if (!tags) return {};
    
    // 分割每个标签项
    const sections = tags.split(';').map(s => s.trim()).filter(s => s);
    const parsedData: Record<string, Array<{name: string, detail?: string}>> = {};

    sections.forEach(section => {
      const colonIndex = section.indexOf(':');
      if (colonIndex > 0) {
        const category = section.substring(0, colonIndex).trim();
        const valueWithDetail = section.substring(colonIndex + 1).trim();
        
        // 初始化分类数组
        if (!parsedData[category]) {
          parsedData[category] = [];
        }
        
        // 检查是否有 {补充信息}
        const match = valueWithDetail.match(/^(.+?)\{(.+?)\}$/);
        if (match) {
          // 有补充信息：tag{detail}
          const tagName = match[1].trim();
          const detail = match[2].trim();
          parsedData[category].push({ name: tagName, detail: detail });
        } else if (valueWithDetail) {
          // 没有补充信息：纯tag
          parsedData[category].push({ name: valueWithDetail });
        }
      }
    });

    return parsedData;
  }, []);

  const parsedTags = useMemo(() => parseCustomTags(localCustomTags), [parseCustomTags, localCustomTags]);
  

  // 初始化编辑状态
  const initEditingState = useCallback(() => {
    const parsed = parseCustomTags(localCustomTags);
    setEditingParsedTags(parsed);
    setSelectedCategory(Object.keys(parsed)[0] || '');
  }, [parseCustomTags, localCustomTags]);

  // 添加新分类
  const addNewCategory = useCallback(() => {
    if (newCategoryName.trim() && !editingParsedTags[newCategoryName.trim()]) {
      setEditingParsedTags(prev => ({
        ...prev,
        [newCategoryName.trim()]: []
      }));
      setSelectedCategory(newCategoryName.trim());
      toast.success('分类已添加', {
        description: `已创建 "${newCategoryName.trim()}" 分类`,
        duration: 1500,
      });
      setNewCategoryName('');
    }
  }, [newCategoryName, editingParsedTags]);

  // 添加新标签到选中的分类
  const addNewTag = useCallback(() => {
    if (selectedCategory && newTagName.trim()) {
      setEditingParsedTags(prev => ({
        ...prev,
        [selectedCategory]: [
          ...(prev[selectedCategory] || []),
          {
            name: newTagName.trim(),
            detail: newTagDetail.trim() || undefined
          }
        ]
      }));
      toast.success('标签已添加', {
        description: `已在 "${selectedCategory}" 分类中添加标签 "${newTagName.trim()}"`,
        duration: 1500,
      });
      setNewTagName('');
      setNewTagDetail('');
    }
  }, [selectedCategory, newTagName, newTagDetail]);

  // 删除标签
  const removeTag = useCallback((categoryName: string, tagIndex: number) => {
    const tagName = editingParsedTags[categoryName][tagIndex].name;
    setEditingParsedTags(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter((_, index) => index !== tagIndex)
    }));
    toast.info('标签已删除', {
      description: `已从 "${categoryName}" 分类中删除标签 "${tagName}"`,
      duration: 2000,
    });
  }, [editingParsedTags]);

  // 删除分类
  const removeCategory = useCallback((categoryName: string) => {
    const tagCount = editingParsedTags[categoryName].length;
    setEditingParsedTags(prev => {
      const newTags = { ...prev };
      delete newTags[categoryName];
      return newTags;
    });
    const remainingCategories = Object.keys(editingParsedTags).filter(cat => cat !== categoryName);
    setSelectedCategory(remainingCategories[0] || '');
    
    toast.info('分类已删除', {
      description: `已删除 "${categoryName}" 分类及其 ${tagCount} 个标签`,
      duration: 2000,
    });
  }, [editingParsedTags]);

  // 将编辑的标签转换回字符串格式
  const tagsToString = useCallback((tags: Record<string, Array<{name: string, detail?: string}>>) => {
    const sections: string[] = [];
    Object.entries(tags).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.detail) {
          sections.push(`${category}:${item.name}{${item.detail}}`);
        } else {
          sections.push(`${category}:${item.name}`);
        }
      });
    });
    return sections.join(';');
  }, []);

  // 开始编辑标签
  const startEditTag = useCallback((categoryName: string, tagIndex: number) => {
    const tag = editingParsedTags[categoryName][tagIndex];
    setEditingTag({ categoryName, tagIndex });
    setEditingTagName(tag.name);
    setEditingTagDetail(tag.detail || '');
  }, [editingParsedTags]);

  // 保存编辑的标签
  const saveEditTag = useCallback(() => {
    if (editingTag && editingTagName.trim()) {
      const oldTagName = editingParsedTags[editingTag.categoryName][editingTag.tagIndex].name;
      setEditingParsedTags(prev => ({
        ...prev,
        [editingTag.categoryName]: prev[editingTag.categoryName].map((tag, index) =>
          index === editingTag.tagIndex
            ? { name: editingTagName.trim(), detail: editingTagDetail.trim() || undefined }
            : tag
        )
      }));
      toast.success('标签已更新', {
        description: `已将 "${oldTagName}" 更新为 "${editingTagName.trim()}"`,
        duration: 1500,
      });
      setEditingTag(null);
      setEditingTagName('');
      setEditingTagDetail('');
    }
  }, [editingTag, editingTagName, editingTagDetail, editingParsedTags]);

  // 取消编辑标签
  const cancelEditTag = useCallback(() => {
    setEditingTag(null);
    setEditingTagName('');
    setEditingTagDetail('');
  }, []);

  // 保存标签
  const saveTags = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const tagsString = tagsToString(editingParsedTags);
      await updateStockCustomTags(stockInfo.stock_code, tagsString);
      
      // 保存成功后立即更新本地显示状态
      setLocalCustomTags(tagsString);
      
      // 通知父组件标签已更新（用于更新列表中的数据）
      onTagsUpdate?.(stockInfo.stock_code, tagsString);
      
      // 重置所有编辑状态并关闭对话框
      setIsEditDialogOpen(false);
      setEditingTag(null);
      setEditingTagName('');
      setEditingTagDetail('');
      setNewCategoryName('');
      setNewTagName('');
      setNewTagDetail('');
      setSelectedCategory('');
      
      // 成功提示
      toast.success('标签保存成功！', {
        description: `已为 ${stockInfo.stock_name} 更新自定义标签`,
        duration: 3000,
      });
    } catch (error) {
      console.error('保存标签失败:', error);
      // 错误提示
      toast.error('保存失败', {
        description: '请检查网络连接后重试',
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, tagsToString, editingParsedTags, stockInfo.stock_code, stockInfo.stock_name, onTagsUpdate]);

  return (
    <div className="h-fit w-full">
    <Card className="border-border/50 h-fit w-full overflow-hidden relative transition-all duration-200 hover:shadow-xl hover:border-primary/40 hover:scale-[1.01]">
      <CardHeader className="pb-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight truncate text-foreground">
              {stockInfo.company_name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="font-medium text-foreground/70">{stockInfo.stock_name}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-mono text-xs">{stockInfo.stock_code}.{stockInfo.exchange}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 font-medium bg-primary/10 text-primary border-primary/20">
              {stockInfo.exchange}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* 业务范围 - 优化显示 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
            <span className="text-xs font-semibold text-foreground/90">业务范围</span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 pl-5">
            {stockInfo.business_scope}
          </p>
        </div>

        {/* 板块概念 - 优化显示 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Tags className="w-3.5 h-3.5 text-purple-600 dark:text-purple-500" />
            <span className="text-xs font-semibold text-foreground/90">板块概念</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-5">
            {stockInfo.sectors_concepts.slice(0, 5).map((concept, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 h-5 font-normal border-border/60 hover:bg-accent/50 transition-colors">
                {concept}
              </Badge>
            ))}
            {stockInfo.sectors_concepts.length > 5 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 font-normal text-muted-foreground/60 border-dashed">
                +{stockInfo.sectors_concepts.length - 5}
              </Badge>
            )}
          </div>
        </div>

        {/* 公司描述 - 优化显示 */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">
            {stockInfo.company_description}
          </p>
        </div>

        {/* 底部信息 - 优化样式 */}
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border/40">
          <a
            href={stockInfo.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors group/link"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium">官网</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 transition-opacity" />
          </a>
          <div className="text-xs text-muted-foreground/60 font-mono">
            {new Date(stockInfo.updated_at).toLocaleDateString('zh-CN', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* 自定义标签 - 仅在有数据时显示 */}
        {Object.keys(parsedTags).length > 0 && (
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span className="text-xs font-semibold text-foreground/90">自定义标签</span>
              </div>
              <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (open) {
                  initEditingState();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 hover:bg-muted/70 transition-colors"
                  >
                    <Edit3 className="w-2.5 h-2.5 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Tags className="w-4 h-4" />
                      编辑自定义标签
                      <Badge variant="secondary" className="ml-auto">
                        {Object.keys(editingParsedTags).length} 个分类 · {Object.values(editingParsedTags).reduce((total, tags) => total + tags.length, 0)} 个标签
                      </Badge>
                    </DialogTitle>
                    <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                      💡 这是临时编辑模式：所有编辑操作（包括删除）只在此处生效，点击"保存更改"才会真正提交
                    </div>
                  </DialogHeader>
                  
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    {/* 左侧：分类管理 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">分类管理</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {Object.keys(editingParsedTags).length}
                        </Badge>
                      </div>

                      <div className="space-y-1 max-h-[500px] overflow-y-auto">
                        {/* 添加新分类 - 融入列表 */}
                        <div className="flex items-center gap-2 p-3 border border-dashed rounded-md hover:bg-muted/30">
                          <Plus className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <Input
                            placeholder="添加新分类..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addNewCategory();
                              }
                            }}
                          />
                          {newCategoryName.trim() && (
                            <Button
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={addNewCategory}
                              disabled={!!editingParsedTags[newCategoryName.trim()]}
                            >
                              添加
                            </Button>
                          )}
                        </div>
                        
                        {newCategoryName.trim() && !!editingParsedTags[newCategoryName.trim()] && (
                          <p className="text-xs text-amber-600 px-3">分类已存在</p>
                        )}

                        {/* 现有分类列表 */}
                        {Object.keys(editingParsedTags).map((categoryName) => (
                          <div
                            key={categoryName}
                            className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                              selectedCategory === categoryName 
                                ? 'bg-accent text-accent-foreground' 
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedCategory(categoryName)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Tags className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">{categoryName}</span>
                              <span className="text-xs text-muted-foreground">
                                ({editingParsedTags[categoryName].length})
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('点击删除分类按钮:', categoryName);
                                // 直接删除，不需要确认（因为这是临时编辑）
                                removeCategory(categoryName);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {Object.keys(editingParsedTags).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            在上方输入框添加您的第一个分类
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 右侧：标签编辑 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Tags className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">标签编辑</span>
                        {selectedCategory && (
                          <>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-muted-foreground">{selectedCategory}</span>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {editingParsedTags[selectedCategory]?.length || 0}
                            </Badge>
                          </>
                        )}
                      </div>

                      {selectedCategory ? (
                        <div className="space-y-1 max-h-[500px] overflow-y-auto">
                          {/* 添加新标签 - 融入列表 */}
                          <div className="flex items-center gap-2 p-3 border border-dashed rounded-md hover:bg-muted/30">
                            <Plus className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <Input
                              placeholder="标签名称..."
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              className="border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && newTagName.trim()) {
                                  addNewTag();
                                }
                              }}
                            />
                            <Input
                              placeholder="描述..."
                              value={newTagDetail}
                              onChange={(e) => setNewTagDetail(e.target.value)}
                              className="border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newTagName.trim()) {
                                  addNewTag();
                                }
                              }}
                            />
                            {newTagName.trim() && (
                              <Button
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={addNewTag}
                              >
                                添加
                              </Button>
                            )}
                          </div>

                          {/* 现有标签列表 */}
                          {editingParsedTags[selectedCategory]?.map((tag, index) => (
                            <div key={index} className="group rounded-md p-3 hover:bg-muted/50">
                              {editingTag?.categoryName === selectedCategory && editingTag?.tagIndex === index ? (
                                // 编辑模式
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={editingTagName}
                                      onChange={(e) => setEditingTagName(e.target.value)}
                                      placeholder="标签名称"
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveEditTag();
                                        } else if (e.key === 'Escape') {
                                          cancelEditTag();
                                        }
                                      }}
                                    />
                                    <Input
                                      value={editingTagDetail}
                                      onChange={(e) => setEditingTagDetail(e.target.value)}
                                      placeholder="描述（可选）"
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveEditTag();
                                        } else if (e.key === 'Escape') {
                                          cancelEditTag();
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" onClick={saveEditTag} disabled={!editingTagName.trim()}>
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={cancelEditTag}>
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // 显示模式
                                <div className="flex items-center justify-between">
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => startEditTag(selectedCategory, index)}
                                  >
                                    <div className="font-medium text-sm">{tag.name}</div>
                                    {tag.detail && (
                                      <div className="text-xs text-muted-foreground">{tag.detail}</div>
                                    )}
                                  </div>
                                  <div className="flex gap-1 opacity-60 group-hover:opacity-100">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-primary/10"
                                      onClick={() => startEditTag(selectedCategory, index)}
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('点击删除标签按钮:', tag.name, selectedCategory, index);
                                        // 直接删除，不需要确认（因为这是临时编辑）
                                        removeTag(selectedCategory, index);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {(!editingParsedTags[selectedCategory] || editingParsedTags[selectedCategory].length === 0) && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              在上方输入框为 "{selectedCategory}" 添加第一个标签
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                          请先从左侧选择一个分类
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // 取消时重置所有编辑状态
                        setIsEditDialogOpen(false);
                        setEditingTag(null);
                        setEditingTagName('');
                        setEditingTagDetail('');
                        setNewCategoryName('');
                        setNewTagName('');
                        setNewTagDetail('');
                        setSelectedCategory('');
                      }}
                      disabled={isSaving}
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={saveTags}
                      disabled={isSaving}
                    >
                      {isSaving ? '保存中...' : '保存更改'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* 优化的标签显示区域 */}
            <div className="space-y-2 pl-5">
              <TooltipProvider>
                {Object.entries(parsedTags).map(([category, items]) => (
                  <div key={category} className="flex items-start gap-2">
                    {/* 分类文本 */}
                    <span className="text-xs font-semibold text-muted-foreground/80 shrink-0 mt-0.5 min-w-fit">
                      {category}:
                    </span>
                    
                    {/* 标签列表 - 横向排列 */}
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {items.map((item, index) => (
                        <Tooltip key={`${category}-${item.name}-${index}`}>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-normal cursor-help hover:bg-accent/70 hover:border-primary/30 transition-all px-2 py-0.5"
                            >
                              {item.name}
                              {item.detail && (
                                <span className="ml-1 text-muted-foreground/70">•</span>
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            className="max-w-xs"
                            sideOffset={5}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold text-xs">{category} / {item.name}</div>
                              {item.detail && (
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                  {item.detail}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
});

