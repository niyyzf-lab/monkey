package com.wenbo.watch_monkey_app

import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.OnBackPressedCallback

class MainActivity : TauriActivity() {
  private var webView: WebView? = null
  private var shouldAllowExit = false
  
  companion object {
    private const val TAG = "WatchMonkey_MainActivity"
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    Log.d(TAG, "onCreate: Activity created")

    // 延迟查找 WebView，确保视图树已完全初始化
    window.decorView.post {
      webView = findWebViewInViewTree(window.decorView)
      if (webView != null) {
        Log.d(TAG, "onCreate: WebView found successfully")
      } else {
        Log.e(TAG, "onCreate: WebView NOT found!")
      }
      
      // 注册返回键回调
      onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          Log.d(TAG, "handleOnBackPressed: Back button pressed")
          val wv = webView
          if (wv != null) {
            // 触发前端事件，让 React Router 处理返回逻辑
            Log.d(TAG, "handleOnBackPressed: Sending event to frontend")
            wv.evaluateJavascript(
              """
              (function() {
                console.log('[Android] Back button event triggered');
                // 检查前端是否设置了允许退出标志
                if (window.__androidShouldExit === true) {
                  console.log('[Android] Should exit flag is true');
                  return 'EXIT';
                }
                // 触发自定义事件到前端
                window.dispatchEvent(new CustomEvent('android-back-button'));
                return 'HANDLED';
              })();
              """.trimIndent()
            ) { result ->
              Log.d(TAG, "handleOnBackPressed: JavaScript result = $result")
              if (result?.contains("EXIT") == true) {
                Log.d(TAG, "handleOnBackPressed: Frontend allows exit, closing app")
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
              } else {
                Log.d(TAG, "handleOnBackPressed: Event sent to frontend, waiting for handling")
              }
            }
          } else {
            Log.e(TAG, "handleOnBackPressed: WebView is null, using default behavior")
            isEnabled = false
            onBackPressedDispatcher.onBackPressed()
          }
        }
      })
      Log.d(TAG, "onCreate: Back button callback registered")
    }
  }

  private fun findWebViewInViewTree(view: View): WebView? {
    if (view is WebView) {
      Log.d(TAG, "findWebViewInViewTree: Found WebView - ${view.javaClass.simpleName}")
      return view
    }
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        val webView = findWebViewInViewTree(view.getChildAt(i))
        if (webView != null) {
          return webView
        }
      }
    }
    return null
  }
}
