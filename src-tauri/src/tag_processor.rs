use crate::stock_data::*;
use dashmap::DashMap;
use once_cell::sync::Lazy;
use rayon::prelude::*;
use regex::Regex;
use std::collections::HashMap;

// 全局缓存，避免重复计算
static TAG_VALIDATION_CACHE: Lazy<DashMap<String, String>> = Lazy::new(|| DashMap::new());

/// 标签验证状态
#[derive(Debug, Clone)]
pub enum ValidationStatus {
    Valid,
    Warning,
    Error,
    Special,
}

impl ValidationStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ValidationStatus::Valid => "valid",
            ValidationStatus::Warning => "warning",
            ValidationStatus::Error => "error",
            ValidationStatus::Special => "special",
        }
    }

    pub fn weight(&self) -> u8 {
        match self {
            ValidationStatus::Error => 4,
            ValidationStatus::Warning => 3,
            ValidationStatus::Special => 2,
            ValidationStatus::Valid => 1,
        }
    }
}

/// 解析自定义标签字符串
/// 对应前端的 parseCustomTags 函数
pub fn parse_custom_tags(tags: &str) -> HashMap<String, Vec<TagItem>> {
    if tags.is_empty() {
        return HashMap::new();
    }

    let mut parsed_data: HashMap<String, Vec<TagItem>> = HashMap::new();

    // 分割每个标签项
    let sections: Vec<&str> = tags
        .split(';')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect();

    for section in sections {
        if let Some(colon_index) = section.find(':') {
            if colon_index > 0 {
                let category = section[..colon_index].trim().to_string();
                let value_with_detail = section[colon_index + 1..].trim();

                // 初始化分类数组
                let category_tags = parsed_data.entry(category).or_insert_with(Vec::new);

                // 检查是否有 {补充信息}
                static DETAIL_REGEX: Lazy<Regex> =
                    Lazy::new(|| Regex::new(r"^(.+?)\{(.+?)\}$").unwrap());

                if let Some(captures) = DETAIL_REGEX.captures(value_with_detail) {
                    // 有补充信息：tag{detail}
                    let tag_name = captures.get(1).unwrap().as_str().trim().to_string();
                    let detail = captures.get(2).unwrap().as_str().trim().to_string();
                    category_tags.push(TagItem {
                        name: tag_name,
                        detail: Some(detail),
                    });
                } else if !value_with_detail.is_empty() {
                    // 没有补充信息：纯tag
                    category_tags.push(TagItem {
                        name: value_with_detail.to_string(),
                        detail: None,
                    });
                }
            }
        }
    }

    parsed_data
}

/// 验证标签格式 - 与前端 validateTagStructureFormat 逻辑一致
/// 检查标签是否符合 "分类:内容{补充}" 格式
pub fn validate_tag_format(tag_name: &str, tag_detail: Option<&str>) -> ValidationStatus {
    let cache_key = format!("{}:{}", tag_name, tag_detail.unwrap_or(""));

    // 检查缓存
    if let Some(cached_status) = TAG_VALIDATION_CACHE.get(&cache_key) {
        return match cached_status.as_str() {
            "valid" => ValidationStatus::Valid,
            "warning" => ValidationStatus::Warning,
            "error" => ValidationStatus::Error,
            "special" => ValidationStatus::Special,
            _ => ValidationStatus::Valid,
        };
    }

    let mut has_error = false;

    // 1. 检查标签内容（tag_name）
    if tag_name.is_empty() || tag_name.trim().is_empty() {
        has_error = true;
    } else {
        // 检查是否包含非法字符
        if tag_name.contains(':') {
            has_error = true;
        }
        if tag_name.contains('{') || tag_name.contains('}') {
            has_error = true;
        }
        // 检查是否有前后空格
        if tag_name != tag_name.trim() {
            has_error = true;
        }
    }

    // 2. 检查补充说明（tag_detail）
    if let Some(detail) = tag_detail {
        if detail.contains(':') {
            has_error = true;
        }
        if detail.contains('{') || detail.contains('}') {
            has_error = true;
        }
        if detail != detail.trim() {
            has_error = true;
        }
        if detail.len() > 100 {
            has_error = true;
        }
    }

    let status = if has_error {
        ValidationStatus::Error
    } else {
        ValidationStatus::Valid
    };

    // 缓存结果
    TAG_VALIDATION_CACHE.insert(cache_key, status.as_str().to_string());

    status
}

/// 获取分类列表和统计信息
pub fn get_category_list(
    stock_data: &[StockCompanyInfo],
    search_query: Option<&str>,
) -> CategoryListResult {
    // 使用并行处理来提高性能
    let categories: Vec<String> = stock_data
        .par_iter()
        .filter(|stock| !stock.custom_tags.is_empty())
        .flat_map(|stock| {
            let parsed = parse_custom_tags(&stock.custom_tags);
            parsed.keys().cloned().collect::<Vec<_>>()
        })
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    let mut filtered_categories = categories;

    // 如果有搜索查询，过滤分类
    if let Some(query) = search_query {
        if !query.trim().is_empty() {
            let query_lower = query.to_lowercase();
            filtered_categories.retain(|category| {
                category.to_lowercase().contains(&query_lower)
                    || has_matching_tags_in_category(stock_data, category, &query_lower)
            });
        }
    }

    // 按中文排序
    filtered_categories.sort_by(|a, b| a.cmp(b));

    let total_tags = count_total_tags(stock_data, &filtered_categories, search_query);

    CategoryListResult {
        categories: filtered_categories.clone(),
        statistics: TagStatistics {
            total_tags,
            total_categories: filtered_categories.len() as u32,
            selected_category_tags_count: 0,
            current_page_tags_count: 0,
            error_tags_count: 0,
            warning_tags_count: 0,
            valid_tags_count: 0,
        },
    }
}

/// 检查分类下是否有匹配的标签
fn has_matching_tags_in_category(
    stock_data: &[StockCompanyInfo],
    category: &str,
    query: &str,
) -> bool {
    stock_data
        .par_iter()
        .filter(|stock| !stock.custom_tags.is_empty())
        .any(|stock| {
            let parsed = parse_custom_tags(&stock.custom_tags);
            if let Some(category_items) = parsed.get(category) {
                category_items.iter().any(|item| {
                    item.name.to_lowercase().contains(query)
                        || item
                            .detail
                            .as_ref()
                            .map_or(false, |d| d.to_lowercase().contains(query))
                })
            } else {
                false
            }
        })
}

/// 计算总标签数量
fn count_total_tags(
    stock_data: &[StockCompanyInfo],
    categories: &[String],
    search_query: Option<&str>,
) -> u32 {
    let mut count = 0;

    for category in categories {
        let category_data = get_category_data(stock_data, category);
        if let Some(query) = search_query {
            if !query.trim().is_empty() {
                let query_lower = query.to_lowercase();
                count += category_data
                    .tags
                    .iter()
                    .filter(|tag| {
                        tag.name.to_lowercase().contains(&query_lower)
                            || tag
                                .detail
                                .as_ref()
                                .map_or(false, |d| d.to_lowercase().contains(&query_lower))
                            || category.to_lowercase().contains(&query_lower)
                    })
                    .count() as u32;
            } else {
                count += category_data.tags.len() as u32;
            }
        } else {
            count += category_data.tags.len() as u32;
        }
    }

    count
}

/// 获取指定分类的标签数据
pub fn get_category_data(stock_data: &[StockCompanyInfo], category_name: &str) -> TagCategory {
    let mut tag_map: HashMap<String, TagDetails> = HashMap::new();

    // 并行处理股票数据
    let tag_entries: Vec<_> = stock_data
        .par_iter()
        .filter_map(|stock| {
            if !stock.custom_tags.is_empty() {
                let parsed = parse_custom_tags(&stock.custom_tags);
                if let Some(category_items) = parsed.get(category_name) {
                    Some(
                        category_items
                            .iter()
                            .map(|item| (item.clone(), stock.clone()))
                            .collect::<Vec<_>>(),
                    )
                } else {
                    Some(Vec::new())
                }
            } else {
                None
            }
        })
        .flatten()
        .collect();

    // 构建标签映射
    for (item, stock) in tag_entries {
        let tag_key = format!("{}:{}", item.name, item.detail.as_deref().unwrap_or(""));
        let tag = tag_map.entry(tag_key).or_insert_with(|| TagDetails {
            name: item.name.clone(),
            detail: item.detail.clone(),
            count: 0,
            stocks: Vec::new(),
        });
        tag.count += 1;
        tag.stocks.push(stock);
    }

    // 对标签进行排序
    let mut tags: Vec<TagDetails> = tag_map.into_values().collect();
    tags.sort_by(|a, b| {
        let a_status = validate_tag_format(&a.name, a.detail.as_deref());
        let b_status = validate_tag_format(&b.name, b.detail.as_deref());

        // 首先按验证状态排序（错误优先）
        let weight_cmp = b_status.weight().cmp(&a_status.weight());
        if weight_cmp != std::cmp::Ordering::Equal {
            return weight_cmp;
        }

        // 然后按使用次数降序
        let count_cmp = b.count.cmp(&a.count);
        if count_cmp != std::cmp::Ordering::Equal {
            return count_cmp;
        }

        // 最后按名称排序
        a.name.cmp(&b.name)
    });

    TagCategory {
        name: category_name.to_string(),
        tags,
    }
}

/// 获取标签列表（带分页和搜索）
pub fn get_tag_list(stock_data: &[StockCompanyInfo], params: &SearchParams) -> TagListResult {
    let category_name = match &params.category_name {
        Some(name) => name,
        None => {
            return TagListResult {
                tags: Vec::new(),
                total_tags: 0,
                total_pages: 0,
                current_page: params.tags_page,
                error_tags_count: 0,
                warning_tags_count: 0,
                valid_tags_count: 0,
            }
        }
    };

    let category_data = get_category_data(stock_data, category_name);
    let mut tags = category_data.tags;

    // 如果有搜索查询，过滤标签
    if let Some(query) = &params.search_query {
        if !query.trim().is_empty() {
            let query_lower = query.to_lowercase();
            tags.retain(|tag| {
                tag.name.to_lowercase().contains(&query_lower)
                    || tag
                        .detail
                        .as_ref()
                        .map_or(false, |d| d.to_lowercase().contains(&query_lower))
                    || category_name.to_lowercase().contains(&query_lower)
            });
        }
    }

    // 重要：对所有标签按验证状态排序（错误优先），然后再分页
    tags.sort_by(|a, b| {
        let a_status = validate_tag_format(&a.name, a.detail.as_deref());
        let b_status = validate_tag_format(&b.name, b.detail.as_deref());

        // 首先按验证状态排序（错误优先，权重高的在前）
        let weight_cmp = b_status.weight().cmp(&a_status.weight());
        if weight_cmp != std::cmp::Ordering::Equal {
            return weight_cmp;
        }

        // 然后按使用次数降序
        let count_cmp = b.count.cmp(&a.count);
        if count_cmp != std::cmp::Ordering::Equal {
            return count_cmp;
        }

        // 最后按名称排序
        a.name.cmp(&b.name)
    });

    // 计算整个分类下所有标签的验证统计（不仅仅是当前页）
    let mut error_count = 0;
    let mut warning_count = 0;
    let mut valid_count = 0;

    for tag in &tags {
        let status = validate_tag_format(&tag.name, tag.detail.as_deref());
        match status {
            ValidationStatus::Error => error_count += 1,
            ValidationStatus::Warning => warning_count += 1,
            ValidationStatus::Valid | ValidationStatus::Special => valid_count += 1,
        }
    }

    let total_tags = tags.len() as u32;
    let total_pages = ((total_tags as f64) / (params.tags_per_page as f64)).ceil() as u32;

    // 标签分页（在排序后进行）
    let start_index = ((params.tags_page - 1) * params.tags_per_page) as usize;
    let end_index = (start_index + params.tags_per_page as usize).min(tags.len());
    let paged_tags = tags
        .into_iter()
        .skip(start_index)
        .take(end_index - start_index)
        .collect();

    TagListResult {
        tags: paged_tags,
        total_tags,
        total_pages,
        current_page: params.tags_page,
        error_tags_count: error_count,
        warning_tags_count: warning_count,
        valid_tags_count: valid_count,
    }
}

/// 获取股票列表（带分页）
pub fn get_stock_list(selected_tag: &SelectedTag, params: &SearchParams) -> StockListResult {
    let total_stocks = selected_tag.stocks.len() as u32;
    let total_pages = ((total_stocks as f64) / (params.stocks_per_page as f64)).ceil() as u32;

    // 股票分页
    let start_index = ((params.stocks_page - 1) * params.stocks_per_page) as usize;
    let end_index = (start_index + params.stocks_per_page as usize).min(selected_tag.stocks.len());
    let paged_stocks = selected_tag.stocks[start_index..end_index].to_vec();

    StockListResult {
        stocks: paged_stocks,
        total_stocks,
        total_pages,
        current_page: params.stocks_page,
    }
}

/// 计算标签统计信息
pub fn calculate_tag_statistics(
    _stock_data: &[StockCompanyInfo],
    tags: &[TagDetails],
    filtered_categories_count: u32,
    total_tags_count: u32,
    selected_category_tags_count: u32,
) -> TagStatistics {
    let mut error_count = 0;
    let mut warning_count = 0;
    let mut valid_count = 0;

    for tag in tags {
        let status = validate_tag_format(&tag.name, tag.detail.as_deref());
        match status {
            ValidationStatus::Error => error_count += 1,
            ValidationStatus::Warning => warning_count += 1,
            ValidationStatus::Valid | ValidationStatus::Special => valid_count += 1,
        }
    }

    TagStatistics {
        total_tags: total_tags_count,
        total_categories: filtered_categories_count,
        selected_category_tags_count,
        current_page_tags_count: tags.len() as u32,
        error_tags_count: error_count,
        warning_tags_count: warning_count,
        valid_tags_count: valid_count,
    }
}
