import { SettingsSection } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/api/api';
import { Wifi, Loader2, WifiOff, Check, AlertCircle, RefreshCw, Download, Upload, Trash2, RotateCcw, Database } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface DataSettingsProps {
  cacheStats: {
    totalItems: number;
    settingsItems: number;
    temporaryItems: number;
    totalSize: number;
  };
  refreshCacheStats: () => void;
  exportConfig: () => string;
  importConfig: (config: string) => void;
  clearCache: () => void;
  resetSettings: () => void;
  isLoading: boolean;
}

export function DataSettings({
  cacheStats,
  refreshCacheStats,
  exportConfig,
  importConfig,
  clearCache,
  resetSettings,
  isLoading,
}: DataSettingsProps) {
  const [serverStatus, setServerStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导出配置
  const handleExport = () => {
    try {
      const config = exportConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watch-monkey-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('配置已导出');
    } catch (error) {
      toast.error('导出配置失败');
    }
  };

  // 处理导入配置
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      importConfig(text);
      toast.success('配置已导入');
      window.location.reload();
    } catch (error) {
      toast.error('导入配置失败,请检查文件格式');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理重置配置
  const handleReset = () => {
    if (confirm('确定要重置所有设置为默认值吗?此操作不可撤销。')) {
      resetSettings();
      toast.success('配置已重置');
    }
  };

  // 处理清空缓存
  const handleClearCache = () => {
    if (confirm('确定要清空所有临时缓存吗?这将清除页面折叠状态和分页位置。')) {
      clearCache();
      refreshCacheStats();
      toast.success('缓存已清空');
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 测试服务器连接
  const handleTestServer = async () => {
    setServerStatus('testing');
    setServerError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/webhook/stock-details`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setServerStatus('success');
        toast.success('服务器连接成功！');
      } else {
        let errorText = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorText = JSON.stringify(errorJson, null, 2);
          } else {
            errorText = await response.text();
          }
        } catch {
          errorText = '';
        }
        
        setServerStatus('error');
        const errorMessage = `服务器返回错误: ${response.status} ${response.statusText}${errorText ? '\n\n响应内容:\n' + errorText : ''}`;
        setServerError(errorMessage);
        toast.error('服务器连接失败');
      }
    } catch (error) {
      setServerStatus('error');
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setServerError(`连接超时\n\n无法在 10 秒内连接到服务器\n服务器地址: ${API_BASE_URL}\n\n请检查:\n1. 服务器是否正在运行\n2. 服务器地址是否正确\n3. 网络连接是否正常`);
        } else {
          setServerError(`连接错误: ${error.message}\n\n服务器地址: ${API_BASE_URL}\n\n可能的原因:\n1. 服务器未启动\n2. 防火墙拦截\n3. 网络配置问题`);
        }
      } else {
        setServerError(`未知错误\n\n无法连接到服务器: ${API_BASE_URL}\n\n请检查服务器是否正常运行`);
      }
      toast.error('服务器连接失败');
    }
  };

  return (
    <div className="space-y-4">
      <SettingsSection
        title="服务器连接"
        description="测试与后端服务器的连接状态"
        icon={<Wifi className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">服务器地址</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {API_BASE_URL}
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              {serverStatus === 'idle' && <Wifi className="h-5 w-5 text-muted-foreground" />}
              {serverStatus === 'testing' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
              {serverStatus === 'success' && <Wifi className="h-5 w-5 text-green-500" />}
              {serverStatus === 'error' && <WifiOff className="h-5 w-5 text-red-500" />}
            </div>
          </div>

          <Button
            onClick={handleTestServer}
            disabled={serverStatus === 'testing'}
            className="w-full gap-2"
            variant={serverStatus === 'success' ? 'outline' : 'default'}
          >
            {serverStatus === 'testing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4" />
                测试服务器连接
              </>
            )}
          </Button>

          {serverStatus === 'success' && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-green-900 dark:text-green-100">
                <strong>连接成功!</strong> 服务器运行正常。
              </div>
            </div>
          )}

          {serverStatus === 'error' && serverError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-red-900 dark:text-red-100 font-semibold mb-1">连接失败</div>
                <div className="text-red-800 dark:text-red-200 whitespace-pre-wrap break-all font-mono text-xs">
                  {serverError}
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="缓存统计"
        description="查看和管理本地存储的数据"
        icon={<Database className="h-5 w-5" />}
      >
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">总项目数</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {cacheStats.totalItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">配置项</div>
            <div className="text-2xl font-bold text-primary mt-1">
              {cacheStats.settingsItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">临时缓存</div>
            <div className="text-2xl font-bold text-orange-500 mt-1">
              {cacheStats.temporaryItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">总大小</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {formatSize(cacheStats.totalSize)}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={refreshCacheStats}
          className="w-full gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新统计
        </Button>
      </SettingsSection>

      <SettingsSection title="配置管理" description="导入、导出或重置配置">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            导出配置
          </Button>

          <Button
            variant="outline"
            onClick={handleImport}
            disabled={isLoading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            导入配置
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={isLoading}
            className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
          >
            <Trash2 className="h-4 w-4" />
            清空临时缓存
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="gap-2 text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="h-4 w-4" />
            重置所有设置
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-900 dark:text-blue-100">
            <strong>提示:</strong> 临时缓存包括页面折叠状态、分页位置等会话级数据,清空后不影响主要配置。
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
