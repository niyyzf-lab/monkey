package com.wenbo.watch_monkey_app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.OnBackPressedCallback

class MainActivity : TauriActivity() {
  private var lastBackPressedTime: Long = 0
  private val backPressInterval = 2000L // 2秒内双击退出

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // 注册返回键回调 - 双击退出
    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val currentTime = System.currentTimeMillis()
        
        if (currentTime - lastBackPressedTime < backPressInterval) {
          // 双击退出
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
        } else {
          // 第一次按返回键，提示用户
          lastBackPressedTime = currentTime
          Toast.makeText(
            this@MainActivity,
            "再按一次退出应用",
            Toast.LENGTH_SHORT
          ).show()
        }
      }
    })
  }
}
