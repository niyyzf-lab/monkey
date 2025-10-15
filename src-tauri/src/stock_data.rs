use serde::{Deserialize, Serialize};

/// 股票公司基本信息 - 与前端类型保持一致
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockCompanyInfo {
    /// 股票代码
    pub stock_code: String,
    /// 股票名称
    pub stock_name: String,
    /// 公司名称
    pub company_name: String,
    /// 交易所
    pub exchange: String,
    /// 业务范围
    pub business_scope: String,
    /// 自定义标签
    pub custom_tags: String,
    /// 官方网站
    pub official_website: String,
    /// 公司描述
    pub company_description: String,
    /// 承销方式
    pub underwriting_method: String,
    /// 创建时间
    pub created_at: String,
    /// 更新时间
    pub updated_at: String,
    /// 板块概念
    pub sectors_concepts: Vec<String>,
}

/// 股票信息数组
#[allow(dead_code)]
pub type StockInfoArray = Vec<StockCompanyInfo>;

/// 解析后的标签项
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagItem {
    pub name: String,
    pub detail: Option<String>,
}

/// 标签分类下的标签详情
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagDetails {
    pub name: String,
    pub detail: Option<String>,
    pub count: u32,
    pub stocks: Vec<StockCompanyInfo>,
}

/// 标签分类
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagCategory {
    pub name: String,
    pub tags: Vec<TagDetails>,
}

/// 选中的标签信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectedTag {
    pub category_name: String,
    pub tag_name: String,
    pub tag_detail: Option<String>,
    pub stocks: Vec<StockCompanyInfo>,
}

/// 标签统计信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagStatistics {
    pub total_tags: u32,
    pub total_categories: u32,
    pub selected_category_tags_count: u32,
    pub current_page_tags_count: u32,
    pub error_tags_count: u32,
    pub warning_tags_count: u32,
    pub valid_tags_count: u32,
}

/// 搜索和分页参数
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchParams {
    pub search_query: Option<String>,
    pub category_name: Option<String>,
    pub tags_page: u32,
    pub stocks_page: u32,
    pub tags_per_page: u32,
    pub stocks_per_page: u32,
}

/// 分类列表结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryListResult {
    pub categories: Vec<String>,
    pub statistics: TagStatistics,
}

/// 标签列表结果（带分页）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagListResult {
    pub tags: Vec<TagDetails>,
    pub total_tags: u32,
    pub total_pages: u32,
    pub current_page: u32,
    /// 整个分类下的验证统计（不仅仅是当前页）
    pub error_tags_count: u32,
    pub warning_tags_count: u32,
    pub valid_tags_count: u32,
}

/// 股票列表结果（带分页）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockListResult {
    pub stocks: Vec<StockCompanyInfo>,
    pub total_stocks: u32,
    pub total_pages: u32,
    pub current_page: u32,
}
