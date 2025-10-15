/**
 * 通用 API 配置文件
 * 提供统一的 HTTP 请求方法和错误处理
 */

/**
 * API 基础 URL，从环境变量读取
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5678';

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 通用请求方法
 * @param endpoint API 端点路径
 * @param options Fetch 请求选项
 * @returns Promise<T> 返回指定类型的数据
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 确保端点以 / 开头
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  // 默认 headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText
      );
    }

    // 检查响应内容类型
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // 如果没有返回 JSON，返回空对象
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`API 请求失败 [${endpoint}]:`, error);
    throw new ApiError(
      `无法完成请求，请检查网络连接或服务器状态`
    );
  }
}

/**
 * GET 请求
 */
export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, {
    method: 'GET',
  });
}

/**
 * POST 请求
 */
export async function post<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function put<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, {
    method: 'DELETE',
  });
}

