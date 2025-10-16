// macOS 红绿灯按钮定制插件
#![allow(deprecated)]
#![allow(unexpected_cfgs)]

#[cfg(target_os = "macos")]
use cocoa::appkit::NSWindowButton;
#[cfg(target_os = "macos")]
use cocoa::base::{id, nil};
#[cfg(target_os = "macos")]
use cocoa::foundation::{NSPoint, NSRect};
#[cfg(target_os = "macos")]
use objc::{msg_send, sel, sel_impl};
use tauri::{plugin::TauriPlugin, Runtime, Window};

// 红绿灯按钮的位置配置
// 按钮距离右边缘的距离
const WINDOW_CONTROL_PAD_RIGHT: f64 = 70.0;
// 按钮距离顶部的距离（macOS 坐标系是从下往上，所以这里是距离底部）
const WINDOW_CONTROL_PAD_TOP: f64 = 22.0;
// 按钮缩放比例 (0.0 - 1.0)，0.7 表示缩小到原来的 70%
const BUTTON_SCALE: f64 = 0.7;

#[cfg(target_os = "macos")]
#[allow(deprecated)]
fn position_traffic_lights(ns_window: id, scale: f64) {
    unsafe {
        let close_button: id = msg_send![ns_window, standardWindowButton: NSWindowButton::NSWindowCloseButton];
        let miniaturize_button: id =
            msg_send![ns_window, standardWindowButton: NSWindowButton::NSWindowMiniaturizeButton];
        let zoom_button: id =
            msg_send![ns_window, standardWindowButton: NSWindowButton::NSWindowZoomButton];

        if close_button == nil || miniaturize_button == nil || zoom_button == nil {
            return;
        }

        // 获取窗口的frame（包含标题栏）
        let window_frame: NSRect = msg_send![ns_window, frame];
        let window_width = window_frame.size.width;
        let window_height = window_frame.size.height;

        // 获取按钮的原始尺寸和间距
        let close_rect: NSRect = msg_send![close_button, frame];
        let miniaturize_rect: NSRect = msg_send![miniaturize_button, frame];
        let space_between = miniaturize_rect.origin.x - close_rect.origin.x;

        // 按钮数组：关闭、最小化、缩放（从左到右）
        let buttons = vec![
            (close_button, 0),
            (miniaturize_button, 1),
            (zoom_button, 2),
        ];

        for (button, index) in buttons {
            // 启用 layer 以支持缩放
            let _: () = msg_send![button, setWantsLayer: true];
            let layer: id = msg_send![button, layer];
            
            if layer != nil {
                // 计算从右边开始的位置
                // 最右边的按钮（zoom）在最右侧，然后依次向左排列
                let x_offset = WINDOW_CONTROL_PAD_RIGHT - ((2 - index) as f64 * space_between * scale);
                let new_x = window_width - x_offset;
                
                // Y 坐标：macOS 窗口坐标系原点在左下角
                // 标题栏在顶部，所以 y 应该接近 window_height
                let new_y = window_height - WINDOW_CONTROL_PAD_TOP;

                // 设置位置（使用 position 而不是 frame）
                let new_position = NSPoint { x: new_x, y: new_y };
                let _: () = msg_send![layer, setPosition: new_position];
                
                // 设置锚点为中心（默认就是 0.5, 0.5）
                let _: () = msg_send![layer, setAnchorPoint: NSPoint { x: 0.5, y: 0.5 }];
                
                // 应用缩放变换
                #[repr(C)]
                struct CATransform3D {
                    m11: f64, m12: f64, m13: f64, m14: f64,
                    m21: f64, m22: f64, m23: f64, m24: f64,
                    m31: f64, m32: f64, m33: f64, m34: f64,
                    m41: f64, m42: f64, m43: f64, m44: f64,
                }
                
                let scale_transform = CATransform3D {
                    m11: scale, m12: 0.0, m13: 0.0, m14: 0.0,
                    m21: 0.0, m22: scale, m23: 0.0, m24: 0.0,
                    m31: 0.0, m32: 0.0, m33: scale, m34: 0.0,
                    m41: 0.0, m42: 0.0, m43: 0.0, m44: 1.0,
                };
                
                let _: () = msg_send![layer, setTransform: scale_transform];
            }
        }
    }
}

#[cfg(target_os = "macos")]
#[allow(deprecated)]
fn setup_traffic_lights<R: Runtime>(window: &Window<R>) {
    let ns_window = window.ns_window().unwrap() as id;

    // 立即设置红绿灯位置和大小
    position_traffic_lights(ns_window, BUTTON_SCALE);
}

/// 创建红绿灯按钮定制插件
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    tauri::plugin::Builder::new("traffic-lights")
        .on_window_ready(|window| {
            #[cfg(target_os = "macos")]
            {
                setup_traffic_lights(&window);
                
                // 监听窗口事件
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    match event {
                        tauri::WindowEvent::Resized(_) | tauri::WindowEvent::Moved(_) => {
                            #[cfg(target_os = "macos")]
                            {
                                setup_traffic_lights(&window_clone);
                            }
                        }
                        _ => {}
                    }
                });
            }
            #[cfg(not(target_os = "macos"))]
            {
                let _ = window;
            }
        })
        .build()
}
