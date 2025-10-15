use crate::stock_data::*;
use crate::tag_processor::*;
use std::sync::RwLock;
use tauri::State;

/// 应用状态，用于缓存股票数据
pub struct AppState {
    pub stock_data: RwLock<Vec<StockCompanyInfo>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            stock_data: RwLock::new(Vec::new()),
        }
    }
}

/// 设置股票数据到应用状态中
#[tauri::command]
pub async fn set_stock_data(
    state: State<'_, AppState>,
    stock_data: Vec<StockCompanyInfo>,
) -> Result<(), String> {
    match state.stock_data.write() {
        Ok(mut data) => {
            *data = stock_data;
            Ok(())
        }
        Err(e) => Err(format!("Failed to update stock data: {}", e)),
    }
}

/// 获取分类列表和统计信息
#[tauri::command]
pub async fn get_categories(
    state: State<'_, AppState>,
    search_query: Option<String>,
) -> Result<CategoryListResult, String> {
    match state.stock_data.read() {
        Ok(stock_data) => {
            let query = search_query.as_deref().filter(|s| !s.is_empty());
            Ok(get_category_list(&stock_data, query))
        }
        Err(e) => Err(format!("Failed to read stock data: {}", e)),
    }
}

/// 获取指定分类下的标签列表（带分页）
#[tauri::command]
pub async fn get_tags_by_category(
    state: State<'_, AppState>,
    params: SearchParams,
) -> Result<TagListResult, String> {
    match state.stock_data.read() {
        Ok(stock_data) => Ok(get_tag_list(&stock_data, &params)),
        Err(e) => Err(format!("Failed to read stock data: {}", e)),
    }
}

/// 获取指定标签下的股票列表（带分页）
#[tauri::command]
pub async fn get_stocks_by_tag(
    selected_tag: SelectedTag,
    params: SearchParams,
) -> Result<StockListResult, String> {
    Ok(get_stock_list(&selected_tag, &params))
}

/// 计算标签统计信息
#[tauri::command]
pub async fn calculate_statistics(
    _state: State<'_, AppState>,
    tags: Vec<TagDetails>,
    filtered_categories_count: u32,
    total_tags_count: u32,
    selected_category_tags_count: u32,
) -> Result<TagStatistics, String> {
    Ok(calculate_tag_statistics(
        &[], // 不需要原始数据，直接从tags计算
        &tags,
        filtered_categories_count,
        total_tags_count,
        selected_category_tags_count,
    ))
}

/// 解析自定义标签 - 用于前端调用
#[tauri::command]
pub async fn parse_tags(
    tags: String,
) -> Result<std::collections::HashMap<String, Vec<TagItem>>, String> {
    Ok(parse_custom_tags(&tags))
}

/// 验证标签格式
#[tauri::command]
pub async fn validate_tag(tag_name: String, tag_detail: Option<String>) -> Result<String, String> {
    let status = validate_tag_format(&tag_name, tag_detail.as_deref());
    Ok(status.as_str().to_string())
}

/// 获取标签详情（包含股票信息）
#[tauri::command]
pub async fn get_tag_details(
    state: State<'_, AppState>,
    category_name: String,
    tag_name: String,
    tag_detail: Option<String>,
) -> Result<SelectedTag, String> {
    match state.stock_data.read() {
        Ok(stock_data) => {
            let category_data = get_category_data(&stock_data, &category_name);

            // 查找匹配的标签
            for tag in category_data.tags {
                if tag.name == tag_name && tag.detail == tag_detail {
                    return Ok(SelectedTag {
                        category_name,
                        tag_name,
                        tag_detail,
                        stocks: tag.stocks,
                    });
                }
            }

            Err("Tag not found".to_string())
        }
        Err(e) => Err(format!("Failed to read stock data: {}", e)),
    }
}

/// 执行全面的搜索和过滤
#[tauri::command]
pub async fn search_and_filter(
    state: State<'_, AppState>,
    params: SearchParams,
) -> Result<(CategoryListResult, TagListResult), String> {
    match state.stock_data.read() {
        Ok(stock_data) => {
            let category_result = get_category_list(&stock_data, params.search_query.as_deref());
            let tag_result = get_tag_list(&stock_data, &params);

            Ok((category_result, tag_result))
        }
        Err(e) => Err(format!("Failed to read stock data: {}", e)),
    }
}

/// 获取股票数据的基本统计信息
#[tauri::command]
pub async fn get_data_statistics(state: State<'_, AppState>) -> Result<(u32, u32, u32), String> {
    match state.stock_data.read() {
        Ok(stock_data) => {
            let total_stocks = stock_data.len() as u32;
            let stocks_with_tags = stock_data
                .iter()
                .filter(|stock| !stock.custom_tags.is_empty())
                .count() as u32;

            // 计算总分类数
            let mut all_categories = std::collections::HashSet::new();
            for stock in stock_data.iter() {
                if !stock.custom_tags.is_empty() {
                    let parsed = parse_custom_tags(&stock.custom_tags);
                    for category in parsed.keys() {
                        all_categories.insert(category.clone());
                    }
                }
            }
            let total_categories = all_categories.len() as u32;

            Ok((total_stocks, stocks_with_tags, total_categories))
        }
        Err(e) => Err(format!("Failed to read stock data: {}", e)),
    }
}
