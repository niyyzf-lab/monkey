import { StockCompanyInfo } from '@/types/stock_details'
import { invoke } from '@tauri-apps/api/core'

export interface TagItem {
  name: string
  detail?: string
}

export interface TagDetails {
  name: string
  detail?: string
  count: number
  stocks: StockCompanyInfo[]
}

export interface TagCategory {
  name: string
  tags: TagDetails[]
}

export interface SelectedTag {
  category_name: string
  tag_name: string
  tag_detail?: string
  stocks: StockCompanyInfo[]
}

export interface TagStatistics {
  total_tags: number
  total_categories: number
  selected_category_tags_count: number
  current_page_tags_count: number
  error_tags_count: number
  warning_tags_count: number
  valid_tags_count: number
}

export interface SearchParams {
  search_query?: string
  category_name?: string
  tags_page: number
  stocks_page: number
  tags_per_page: number
  stocks_per_page: number
}

export interface CategoryListResult {
  categories: string[]
  statistics: TagStatistics
}

export interface TagListResult {
  tags: TagDetails[]
  total_tags: number
  total_pages: number
  current_page: number
  // 整个分类下的验证统计（不仅仅是当前页）
  error_tags_count: number
  warning_tags_count: number
  valid_tags_count: number
}

export interface StockListResult {
  stocks: StockCompanyInfo[]
  total_stocks: number
  total_pages: number
  current_page: number
}

// Rust 后端 API 调用函数
export class RustTagAPI {
  /**
   * 设置股票数据到 Rust 后端
   */
  static async setStockData(data: StockCompanyInfo[]): Promise<void> {
    try {
      await invoke('set_stock_data', { stockData: data })
    } catch (error) {
      console.error('Failed to set stock data:', error)
      throw new Error('无法设置股票数据到后端')
    }
  } 

  /**
   * 获取分类列表和统计信息
   */
  static async getCategories(searchQuery?: string): Promise<CategoryListResult> {
    try {
      return await invoke('get_categories', { searchQuery: searchQuery || null })
    } catch (error) {
      console.error('Failed to get categories:', error)
      throw new Error('无法获取分类列表')
    }
  }

  /**
   * 获取指定分类下的标签列表（带分页）
   */
  static async getTagsByCategory(params: SearchParams): Promise<TagListResult> {
    try {
      return await invoke('get_tags_by_category', { params })
    } catch (error) {
      console.error('Failed to get tags by category:', error)
      throw new Error('无法获取标签列表')
    }
  }

  /**
   * 获取指定标签下的股票列表（带分页）
   */
  static async getStocksByTag(
    selectedTag: SelectedTag,
    params: SearchParams
  ): Promise<StockListResult> {
    try {
      return await invoke('get_stocks_by_tag', { selectedTag: selectedTag, params })
    } catch (error) {
      console.error('Failed to get stocks by tag:', error)
      throw new Error('无法获取股票列表')
    }
  }

  /**
   * 计算标签统计信息
   */
  static async calculateStatistics(
    tags: TagDetails[],
    filteredCategoriesCount: number,
    totalTagsCount: number,
    selectedCategoryTagsCount: number
  ): Promise<TagStatistics> {
    try {
      return await invoke('calculate_statistics', {
        tags,
        filtered_categories_count: filteredCategoriesCount,
        total_tags_count: totalTagsCount,
        selected_category_tags_count: selectedCategoryTagsCount,
      })
    } catch (error) {
      console.error('Failed to calculate statistics:', error)
      throw new Error('无法计算统计信息')
    }
  }

  /**
   * 解析自定义标签字符串
   */
  static async parseTags(tags: string): Promise<Record<string, TagItem[]>> {
    try {
      return await invoke('parse_tags', { tags })
    } catch (error) {
      console.error('Failed to parse tags:', error)
      throw new Error('无法解析标签')
    }
  }

  /**
   * 验证标签格式
   */
  static async validateTag(tagName: string, tagDetail?: string): Promise<string> {
    try {
      return await invoke('validate_tag', { tag_name: tagName, tag_detail: tagDetail })
    } catch (error) {
      console.error('Failed to validate tag:', error)
      throw new Error('无法验证标签格式')
    }
  }

  /**
   * 获取标签详情（包含股票信息）
   */
  static async getTagDetails(
    categoryName: string,
    tagName: string,
    tagDetail?: string
  ): Promise<SelectedTag> {
    try {
      return await invoke('get_tag_details', {
        categoryName: categoryName,
        tagName: tagName,
        tagDetail: tagDetail,
      })
    } catch (error) {
      console.error('Failed to get tag details:', error)
      throw new Error('无法获取标签详情')
    }
  }

  /**
   * 执行全面的搜索和过滤
   */
  static async searchAndFilter(
    params: SearchParams
  ): Promise<[CategoryListResult, TagListResult]> {
    try {
      return await invoke('search_and_filter', { params })
    } catch (error) {
      console.error('Failed to search and filter:', error)
      throw new Error('搜索过滤失败')
    }
  }

  /**
   * 获取股票数据的基本统计信息
   * @returns [总股票数, 有标签的股票数, 总分类数]
   */
  static async getDataStatistics(): Promise<[number, number, number]> {
    try {
      return await invoke('get_data_statistics')
    } catch (error) {
      console.error('Failed to get data statistics:', error)
      throw new Error('无法获取数据统计')
    }
  }
}

// 导出默认实例
export default RustTagAPI
