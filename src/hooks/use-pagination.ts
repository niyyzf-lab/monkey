/**
 * 分页 Hook
 * 统一的分页状态管理，页码计算和边界检查
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * 分页配置选项
 */
export interface PaginationOptions {
  /** 每页项目数，默认10 */
  pageSize?: number;
  /** 初始页码，默认1 */
  initialPage?: number;
  /** 是否显示页码按钮的最大数量，默认5 */
  maxVisiblePages?: number;
  /** 是否启用边界检查，默认true */
  enableBoundaryCheck?: boolean;
}

/**
 * 分页状态
 */
export interface PaginationState {
  /** 当前页码 */
  currentPage: number;
  /** 每页项目数 */
  pageSize: number;
  /** 总项目数 */
  totalItems: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有上一页 */
  hasPreviousPage: boolean;
  /** 是否有下一页 */
  hasNextPage: boolean;
  /** 是否在第一页 */
  isFirstPage: boolean;
  /** 是否在最后一页 */
  isLastPage: boolean;
  /** 当前页的起始索引 */
  startIndex: number;
  /** 当前页的结束索引 */
  endIndex: number;
  /** 当前页显示的项目数 */
  currentPageItems: number;
}

/**
 * 分页操作
 */
export interface PaginationActions {
  /** 跳转到指定页 */
  goToPage: (page: number) => void;
  /** 跳转到下一页 */
  nextPage: () => void;
  /** 跳转到上一页 */
  previousPage: () => void;
  /** 跳转到第一页 */
  firstPage: () => void;
  /** 跳转到最后一页 */
  lastPage: () => void;
  /** 设置每页项目数 */
  setPageSize: (size: number) => void;
  /** 设置总项目数 */
  setTotalItems: (total: number) => void;
  /** 重置分页 */
  reset: () => void;
}

/**
 * 分页 Hook 返回值
 */
export interface PaginationReturn extends PaginationState, PaginationActions {
  /** 可见的页码数组 */
  visiblePages: number[];
  /** 分页信息摘要 */
  summary: string;
}

/**
 * 基础分页 Hook
 * @param totalItems 总项目数
 * @param options 配置选项
 * @returns 分页状态和操作
 */
export function usePagination(
  totalItems: number = 0,
  options: PaginationOptions = {}
): PaginationReturn {
  const {
    pageSize: initialPageSize = 10,
    initialPage = 1,
    maxVisiblePages = 5,
    enableBoundaryCheck = true
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 计算总页数
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // 边界检查
  const safeCurrentPage = enableBoundaryCheck 
    ? Math.max(1, Math.min(currentPage, totalPages))
    : currentPage;

  // 计算分页状态
  const state: PaginationState = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const currentPageItems = Math.max(0, endIndex - startIndex);

    return {
      currentPage: safeCurrentPage,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: safeCurrentPage > 1,
      hasNextPage: safeCurrentPage < totalPages,
      isFirstPage: safeCurrentPage === 1,
      isLastPage: safeCurrentPage === totalPages,
      startIndex,
      endIndex,
      currentPageItems
    };
  }, [safeCurrentPage, pageSize, totalItems, totalPages]);

  // 计算可见页码
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, safeCurrentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 如果结束页数不足，向前调整起始页
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [safeCurrentPage, totalPages, maxVisiblePages]);

  // 分页操作
  const goToPage = useCallback((page: number) => {
    if (enableBoundaryCheck) {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    } else {
      setCurrentPage(page);
    }
  }, [totalPages, enableBoundaryCheck]);

  const nextPage = useCallback(() => {
    if (state.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [state.hasNextPage]);

  const previousPage = useCallback(() => {
    if (state.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [state.hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(Math.max(1, size));
    // 调整当前页，确保不超出范围
    const newTotalPages = Math.ceil(totalItems / size);
    if (safeCurrentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [totalItems, safeCurrentPage]);

  const setTotalItemsHandler = useCallback((total: number) => {
    // 当总项目数变化时，可能需要调整当前页
    const newTotalPages = Math.ceil(total / pageSize);
    if (safeCurrentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [pageSize, safeCurrentPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // 分页信息摘要
  const summary = useMemo(() => {
    if (totalItems === 0) {
      return '暂无数据';
    }
    
    const start = state.startIndex + 1;
    const end = state.endIndex;
    return `第 ${start}-${end} 项，共 ${totalItems} 项`;
  }, [totalItems, state.startIndex, state.endIndex]);

  return {
    ...state,
    visiblePages,
    summary,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize: setPageSizeHandler,
    setTotalItems: setTotalItemsHandler,
    reset
  };
}

/**
 * 高级分页 Hook（支持更多功能）
 * @param totalItems 总项目数
 * @param options 配置选项
 * @returns 高级分页状态和操作
 */
export function useAdvancedPagination(
  totalItems: number = 0,
  options: PaginationOptions & {
    /** 是否启用URL同步 */
    enableUrlSync?: boolean;
    /** URL参数名称 */
    urlParamName?: string;
    /** 是否启用本地存储 */
    enableLocalStorage?: boolean;
    /** 本地存储键名 */
    storageKey?: string;
  } = {}
) {
  const {
    enableUrlSync = false,
    urlParamName = 'page',
    enableLocalStorage = false,
    storageKey = 'pagination',
    ...paginationOptions
  } = options;

  const pagination = usePagination(totalItems, paginationOptions);

  // URL同步
  if (enableUrlSync && typeof window !== 'undefined') {
    // 从URL读取初始页码
    const urlParams = new URLSearchParams(window.location.search);
    const urlPage = urlParams.get(urlParamName);
    if (urlPage) {
      const page = parseInt(urlPage, 10);
      if (!isNaN(page) && page > 0) {
        pagination.goToPage(page);
      }
    }

    // 同步页码到URL
    const updateUrl = (page: number) => {
      const url = new URL(window.location.href);
      url.searchParams.set(urlParamName, page.toString());
      window.history.replaceState({}, '', url.toString());
    };

    // 监听页码变化
    if (pagination.currentPage !== 1) {
      updateUrl(pagination.currentPage);
    }
  }

  // 本地存储同步
  if (enableLocalStorage && typeof window !== 'undefined') {
    const storageKeyFull = `${storageKey}_${pagination.pageSize}`;
    
    // 从本地存储读取
    const savedPage = localStorage.getItem(storageKeyFull);
    if (savedPage) {
      const page = parseInt(savedPage, 10);
      if (!isNaN(page) && page > 0) {
        pagination.goToPage(page);
      }
    }

    // 保存到本地存储
    const savePage = (page: number) => {
      localStorage.setItem(storageKeyFull, page.toString());
    };

    if (pagination.currentPage !== 1) {
      savePage(pagination.currentPage);
    }
  }

  return pagination;
}
