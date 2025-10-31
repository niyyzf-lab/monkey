import { useState, useEffect } from 'react';
import { SettingsSection, SettingsItem } from '@/components/settings';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { getSystemSettings, updateSystemSetting, SystemSetting } from '@/api/settings-api';
import { Loader2, Save, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * 按类别分组的设置
 */
interface GroupedSettings {
  [category: string]: SystemSetting[];
}

/**
 * 类别显示名称映射
 */
const categoryNames: Record<string, string> = {
  trading_rules: '交易规则',
  fees: '费用设置',
};

/**
 * 设置项中文名称映射
 */
const settingKeyNames: Record<string, string> = {
  t_plus_n: 'T+N 交易规则',
  allow_short_selling: '允许做空',
  min_buy_quantity: '最小买入数量',
  max_position_count: '最大持仓数量',
  allow_fractional_shares: '允许零股交易',
  commission_rate: '佣金费率',
  commission_min: '最低佣金',
  stamp_tax_rate: '印花税率',
  stamp_tax_on_buy: '买入时收取印花税',
  stamp_tax_on_sell: '卖出时收取印花税',
};

/**
 * 高级系统设置组件
 */
export function AdvancedSystemSettings() {
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});

  // 加载设置
  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      
      // 按类别分组
      const grouped: GroupedSettings = {};
      data.forEach((setting) => {
        if (!grouped[setting.category]) {
          grouped[setting.category] = [];
        }
        grouped[setting.category].push(setting);
      });

      // 按 display_order 排序
      Object.keys(grouped).forEach((category) => {
        grouped[category].sort((a, b) => a.display_order - b.display_order);
      });

      setGroupedSettings(grouped);
      
      // 初始化编辑值
      const initialValues: Record<number, string> = {};
      data.forEach((setting) => {
        initialValues[setting.id] = setting.setting_value;
      });
      setEditedValues(initialValues);
    } catch (error) {
      console.error('加载系统设置失败:', error);
      toast.error('加载系统设置失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // 处理值变更
  const handleValueChange = (id: number, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 保存单个设置
  const handleSave = async (setting: SystemSetting) => {
    const newValue = editedValues[setting.id];
    
    // 验证值类型
    if (!validateValue(newValue, setting.value_type)) {
      toast.error(`值格式不正确，应为 ${setting.value_type} 类型`);
      return;
    }

    // 如果值没有变化，不保存
    if (newValue === setting.setting_value) {
      toast.info('值未发生变化');
      return;
    }

    try {
      setSaving((prev) => ({ ...prev, [setting.id]: true }));
      const updated = await updateSystemSetting(setting.id, newValue);
      
      // 更新分组数据
      setGroupedSettings((prev) => {
        const newGrouped = { ...prev };
        Object.keys(newGrouped).forEach((category) => {
          newGrouped[category] = newGrouped[category].map((s) =>
            s.id === setting.id ? updated : s
          );
        });
        return newGrouped;
      });

      toast.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败，请重试');
      // 恢复原值
      setEditedValues((prev) => ({
        ...prev,
        [setting.id]: setting.setting_value,
      }));
    } finally {
      setSaving((prev => ({ ...prev, [setting.id]: false })));
    }
  };

  // 验证值类型
  const validateValue = (value: string, type: string): boolean => {
    if (!value && value !== '0' && value !== 'false') {
      return false;
    }

    switch (type) {
      case 'integer':
        return /^-?\d+$/.test(value);
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'decimal':
        return /^-?\d+(\.\d+)?$/.test(value);
      case 'string':
        return true;
      default:
        return true;
    }
  };

  // 渲染设置项
  const renderSettingItem = (setting: SystemSetting) => {
    const isSaving = saving[setting.id] || false;
    const currentValue = editedValues[setting.id] ?? setting.setting_value;
    const hasChanges = currentValue !== setting.setting_value;

    return (
      <SettingsItem
        key={setting.id}
        label={settingKeyNames[setting.setting_key] || setting.setting_key}
        description={setting.description}
      >
        <div className="flex items-center gap-2">
          {setting.value_type === 'boolean' ? (
            <Switch
              checked={currentValue === 'true'}
              onCheckedChange={(checked) =>
                handleValueChange(setting.id, String(checked))
              }
              disabled={!setting.is_editable || isSaving}
            />
          ) : (
            <Input
              type={
                setting.value_type === 'integer'
                  ? 'number'
                  : setting.value_type === 'decimal'
                  ? 'number'
                  : 'text'
              }
              step={setting.value_type === 'decimal' ? '0.0001' : undefined}
              value={currentValue}
              onChange={(e) => handleValueChange(setting.id, e.target.value)}
              disabled={!setting.is_editable || isSaving}
              className="w-32"
            />
          )}
          {setting.is_editable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave(setting)}
              disabled={isSaving || !hasChanges}
              className="h-8 gap-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  保存中
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  保存
                </>
              )}
            </Button>
          )}
        </div>
      </SettingsItem>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">高级系统设置</h2>
          <p className="text-sm text-muted-foreground mt-1">
            管理系统级配置参数，包括交易规则和费用设置
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSettings}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      <AnimatePresence>
        {Object.keys(groupedSettings).map((category) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <SettingsSection
              title={categoryNames[category] || category}
              description={`${categoryNames[category] || category}相关配置`}
              icon={<Settings className="h-5 w-5" />}
            >
              {groupedSettings[category].map(renderSettingItem)}
            </SettingsSection>
          </motion.div>
        ))}
      </AnimatePresence>

      {Object.keys(groupedSettings).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无系统设置</p>
        </div>
      )}
    </div>
  );
}

