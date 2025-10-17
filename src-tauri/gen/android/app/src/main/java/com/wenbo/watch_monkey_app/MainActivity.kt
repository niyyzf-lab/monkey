package com.wenbo.watch_monkey_app

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onStart() {
    super.onStart()
    
    // 禁用 WebView 的缩放功能
    val webView = getAppManager()?.webView
    webView?.settings?.apply {
      builtInZoomControls = false
      displayZoomControls = false
      setSupportZoom(false)
    }
  }
}
