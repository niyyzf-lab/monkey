/**
 * 通用类型定义
 * 统一管理项目中使用的通用类型，避免重复定义
 */

/**
 * 通用分页参数
 */
export interface PaginationParams {
  /** 当前页码 */
  page: number;
  /** 每页项目数 */
  pageSize: number;
  /** 总项目数 */
  total?: number;
}

/**
 * 通用分页响应
 */
export interface PaginationResponse<T> {
  /** 数据列表 */
  data: T[];
  /** 当前页码 */
  page: number;
  /** 每页项目数 */
  pageSize: number;
  /** 总项目数 */
  total: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNextPage: boolean;
  /** 是否有上一页 */
  hasPreviousPage: boolean;
}

/**
 * 通用加载状态
 */
export interface LoadingState {
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 通用异步状态
 */
export interface AsyncState<T> extends LoadingState {
  /** 数据 */
  data: T | null;
  /** 是否成功 */
  isSuccess: boolean;
  /** 是否失败 */
  isError: boolean;
  /** 是否为空 */
  isEmpty: boolean;
}

/**
 * 通用API响应
 */
export interface ApiResponse<T> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: T;
  /** 错误信息 */
  message?: string;
  /** 错误代码 */
  code?: string | number;
  /** 时间戳 */
  timestamp?: number;
}

/**
 * 通用搜索参数
 */
export interface SearchParams {
  /** 搜索关键词 */
  query?: string;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 过滤条件 */
  filters?: Record<string, any>;
}

/**
 * 通用表格列定义
 */
export interface TableColumn<T = any> {
  /** 列键名 */
  key: string;
  /** 列标题 */
  title: string;
  /** 列宽度 */
  width?: number | string;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可过滤 */
  filterable?: boolean;
  /** 渲染函数 */
  render?: (value: any, record: T, index: number) => React.ReactNode;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否固定 */
  fixed?: 'left' | 'right';
}

/**
 * 通用表格配置
 */
export interface TableConfig<T = any> {
  /** 列定义 */
  columns: TableColumn<T>[];
  /** 是否显示序号 */
  showIndex?: boolean;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否可展开 */
  expandable?: boolean;
  /** 分页配置 */
  pagination?: PaginationParams;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 通用表单字段
 */
export interface FormField {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'datetime';
  /** 是否必填 */
  required?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 默认值 */
  defaultValue?: any;
  /** 验证规则 */
  rules?: Array<{
    required?: boolean;
    message?: string;
    pattern?: RegExp;
    min?: number;
    max?: number;
    validator?: (value: any) => boolean | string;
  }>;
  /** 选项（用于select、radio、checkbox） */
  options?: Array<{
    label: string;
    value: any;
    disabled?: boolean;
  }>;
}

/**
 * 通用表单配置
 */
export interface FormConfig {
  /** 字段定义 */
  fields: FormField[];
  /** 表单布局 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 标签宽度 */
  labelWidth?: number | string;
  /** 是否显示提交按钮 */
  showSubmit?: boolean;
  /** 是否显示重置按钮 */
  showReset?: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 重置按钮文本 */
  resetText?: string;
}

/**
 * 通用对话框配置
 */
export interface DialogConfig {
  /** 对话框标题 */
  title: string;
  /** 对话框内容 */
  content?: React.ReactNode;
  /** 是否可见 */
  visible: boolean;
  /** 对话框宽度 */
  width?: number | string;
  /** 对话框高度 */
  height?: number | string;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否显示遮罩 */
  mask?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 确认按钮文本 */
  okText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onOk?: () => void | Promise<void>;
  /** 取消回调 */
  onCancel?: () => void;
}

/**
 * 通用通知配置
 */
export interface NotificationConfig {
  /** 通知类型 */
  type: 'success' | 'error' | 'warning' | 'info';
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  message: string;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 是否可关闭 */
  closable?: boolean;
  /** 位置 */
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

/**
 * 通用菜单项
 */
export interface MenuItem {
  /** 菜单键名 */
  key: string;
  /** 菜单标题 */
  title: string;
  /** 菜单图标 */
  icon?: React.ReactNode;
  /** 菜单路径 */
  path?: string;
  /** 子菜单 */
  children?: MenuItem[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 权限标识 */
  permission?: string;
}

/**
 * 通用面包屑项
 */
export interface BreadcrumbItem {
  /** 面包屑标题 */
  title: string;
  /** 面包屑路径 */
  path?: string;
  /** 面包屑图标 */
  icon?: React.ReactNode;
}

/**
 * 通用标签配置
 */
export interface TagConfig {
  /** 标签文本 */
  text: string;
  /** 标签颜色 */
  color?: string;
  /** 标签类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 通用统计卡片配置
 */
export interface StatCardConfig {
  /** 卡片标题 */
  title: string;
  /** 卡片数值 */
  value: number | string;
  /** 卡片单位 */
  unit?: string;
  /** 卡片图标 */
  icon?: React.ReactNode;
  /** 卡片颜色 */
  color?: string;
  /** 变化趋势 */
  trend?: {
    value: number;
    type: 'up' | 'down' | 'stable';
    label: string;
  };
  /** 点击回调 */
  onClick?: () => void;
}

/**
 * 通用图表配置
 */
export interface ChartConfig {
  /** 图表标题 */
  title?: string;
  /** 图表宽度 */
  width?: number | string;
  /** 图表高度 */
  height?: number | string;
  /** 图表数据 */
  data: any[];
  /** 图表配置 */
  options?: Record<string, any>;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否响应式 */
  responsive?: boolean;
}

/**
 * 通用文件上传配置
 */
export interface FileUploadConfig {
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 最大文件数量 */
  maxCount?: number;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否拖拽上传 */
  drag?: boolean;
  /** 上传地址 */
  action?: string;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 上传前回调 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** 上传进度回调 */
  onProgress?: (percent: number) => void;
  /** 上传成功回调 */
  onSuccess?: (response: any, file: File) => void;
  /** 上传失败回调 */
  onError?: (error: Error, file: File) => void;
}

/**
 * 通用权限配置
 */
export interface PermissionConfig {
  /** 权限标识 */
  permission: string;
  /** 权限类型 */
  type: 'read' | 'write' | 'delete' | 'admin';
  /** 权限描述 */
  description?: string;
  /** 权限资源 */
  resource?: string;
  /** 权限动作 */
  action?: string;
}

/**
 * 通用用户信息
 */
export interface UserInfo {
  /** 用户ID */
  id: string | number;
  /** 用户名 */
  username: string;
  /** 用户昵称 */
  nickname?: string;
  /** 用户邮箱 */
  email?: string;
  /** 用户头像 */
  avatar?: string;
  /** 用户角色 */
  roles?: string[];
  /** 用户权限 */
  permissions?: string[];
  /** 用户状态 */
  status?: 'active' | 'inactive' | 'banned';
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
