// 模块声明
mod stock_data;
mod tag_processor;
mod tauri_commands;

use tauri_commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg_attr(not(debug_assertions), allow(unused_mut))]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            set_stock_data,
            get_categories,
            get_tags_by_category,
            get_stocks_by_tag,
            calculate_statistics,
            parse_tags,
            validate_tag,
            get_tag_details,
            search_and_filter,
            get_data_statistics
        ]);

    #[cfg(debug_assertions)] // only enable instrumentation in development builds
    {
        builder = builder.plugin(tauri_plugin_devtools::init());
    }

    #[cfg(target_os = "macos")]
    let builder = builder.setup(|_app| {
        #[allow(deprecated)]
        {
            use cocoa::appkit::{NSApp, NSApplication, NSApplicationActivationPolicy};

            unsafe {
                let app_instance = NSApp();
                app_instance.setActivationPolicy_(
                    NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular,
                );
            }
        }

        Ok(())
    });

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
