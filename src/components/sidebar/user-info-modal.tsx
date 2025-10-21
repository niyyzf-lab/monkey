import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Sparkles, Crown, Zap, Star, Flame, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

// 粒子组件
const Particle: React.FC<{ delay: number; duration: number }> = ({ delay, duration }) => {
  const randomX = Math.random() * 100
  const randomY = Math.random() * 100
  
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{ left: `${randomX}%`, top: `${randomY}%` }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        y: [0, -30, -60],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  )
}

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose }) => {
  // 点击背景关闭模态框
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ESC 键关闭
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* 背景遮罩 - 增强毛玻璃效果 */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 模态框内容 - 全新抽象设计 */}
          <motion.div
            className={cn(
              "relative w-full max-w-lg overflow-hidden",
              "bg-gradient-to-br from-background/95 via-background/90 to-background/95",
              "backdrop-blur-2xl rounded-3xl shadow-2xl"
            )}
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: -10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 超级炫酷动态背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* 渐变光晕 1 - 增强版 */}
              <motion.div
                className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary/30 via-blue-500/30 to-purple-500/30 blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* 渐变光晕 2 - 增强版 */}
              <motion.div
                className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-500/30 to-violet-500/30 blur-3xl"
                animate={{
                  scale: [1.3, 1, 1.3],
                  opacity: [0.5, 0.8, 0.5],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* 渐变光晕 3 - 新增 */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, -360],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* 扫描线效果 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
                animate={{
                  y: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* 网格背景 - 增强版 */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
              
              {/* 动态粒子效果 */}
              {Array.from({ length: 20 }).map((_, i) => (
                <Particle key={i} delay={i * 0.3} duration={3 + Math.random() * 2} />
              ))}
              
              {/* 彩虹光带 */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 via-green-500 via-yellow-500 to-red-500"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-6 right-6 z-10 p-2.5 rounded-full",
                "bg-background/60 hover:bg-background/80 backdrop-blur-xl",
                "text-muted-foreground hover:text-foreground",
                "border border-border/50 hover:border-border",
                "transition-all duration-300",
                "hover:scale-110 hover:rotate-90 active:scale-95"
              )}
            >
              <X className="w-5 h-5" />
            </button>

            {/* 主内容区域 */}
            <div className="relative px-8 py-10">
              {/* 超大头像区域 */}
              <div className="flex flex-col items-center mb-8">
                <motion.div
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.1
                  }}
                >
                  {/* 多层动态光环效果 */}
                  {/* 最外层脉冲光环 */}
                  <motion.div
                    className="absolute -inset-8 rounded-full bg-gradient-to-r from-primary via-cyan-500 via-purple-500 to-pink-500 opacity-30 blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.5, 0.2],
                      rotate: 360,
                    }}
                    transition={{
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    }}
                  />
                  
                  {/* 中层彩虹光环 */}
                  <motion.div
                    className="absolute -inset-4 rounded-full"
                    style={{
                      background: "conic-gradient(from 0deg, #ff0080, #ff8c00, #ffed00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080)",
                      filter: "blur(12px)",
                      opacity: 0.4
                    }}
                    animate={{
                      rotate: -360,
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* 内层旋转光环 */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-blue-500 to-purple-500"
                    animate={{
                      rotate: 360,
                      scale: [1, 1.08, 1],
                    }}
                    transition={{
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      padding: "4px",
                      filter: "blur(8px)",
                      opacity: 0.7
                    }}
                  />
                  
                  {/* 头像容器 - 增强版 */}
                  <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-primary via-blue-500 to-purple-500 shadow-2xl shadow-primary/50">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background p-1.5 relative">
                      <motion.img 
                        src="/monkey/User.png" 
                        className="w-full h-full object-cover rounded-full relative z-10"
                        alt="用户头像"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {/* 头像内部光效 */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          rotate: 360,
                        }}
                        transition={{
                          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* 环绕星星效果 */}
                  {[0, 72, 144, 216, 288].map((angle, i) => (
                    <motion.div
                      key={angle}
                      className="absolute w-3 h-3 text-yellow-400"
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: '-6px',
                        marginTop: '-6px',
                      }}
                      animate={{
                        x: [
                          Math.cos((angle * Math.PI) / 180) * 90,
                          Math.cos(((angle + 360) * Math.PI) / 180) * 90,
                        ],
                        y: [
                          Math.sin((angle * Math.PI) / 180) * 90,
                          Math.sin(((angle + 360) * Math.PI) / 180) * 90,
                        ],
                        rotate: 360,
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.2,
                      }}
                    >
                      <Star className="w-3 h-3 fill-yellow-400" />
                    </motion.div>
                  ))}

                  {/* 超级炫酷徽章 - 带脉冲光效 */}
                  <motion.div
                    className="absolute -bottom-2 -right-2"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.3
                    }}
                  >
                    {/* 脉冲波 */}
                    <motion.div
                      className="absolute inset-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-50"
                      animate={{
                        scale: [1, 2, 2],
                        opacity: [0.5, 0, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    {/* 徽章主体 */}
                    <motion.div
                      className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/50 border-4 border-background"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(251, 146, 60, 0.5)",
                          "0 0 40px rgba(251, 146, 60, 0.8)",
                          "0 0 20px rgba(251, 146, 60, 0.5)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: 360,
                        transition: { duration: 0.6 }
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Crown className="w-6 h-6 text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* 用户名称区域 */}
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.h2 
                    className="text-4xl font-bold mb-3 relative"
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(99, 102, 241, 0.5)",
                        "0 0 40px rgba(59, 130, 246, 0.8)",
                        "0 0 20px rgba(99, 102, 241, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                      观猴投研
                    </span>
                  </motion.h2>
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="relative px-5 py-2 rounded-full bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 border-2 border-primary/50 backdrop-blur-sm overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(99, 102, 241, 0.3)",
                          "0 0 30px rgba(99, 102, 241, 0.6)",
                          "0 0 20px rgba(99, 102, 241, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {/* 流光效果 */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      <span className="relative text-sm font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                        </motion.div>
                        专业版会员
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Flame className="w-4 h-4 text-orange-400" />
                        </motion.div>
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* 统计卡片 */}
              <motion.div
                className="grid grid-cols-3 gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatCard
                  value="128"
                  label="持仓数"
                  delay={0.35}
                  gradient="from-blue-500/20 to-cyan-500/20"
                />
                <StatCard
                  value="365"
                  label="活跃天数"
                  delay={0.4}
                  gradient="from-purple-500/20 to-pink-500/20"
                />
                <StatCard
                  value="99%"
                  label="准确率"
                  delay={0.45}
                  gradient="from-green-500/20 to-emerald-500/20"
                />
              </motion.div>

              {/* 操作按钮组 */}
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  className={cn(
                    "relative overflow-hidden px-6 py-4 rounded-2xl font-bold text-sm",
                    "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white",
                    "shadow-2xl",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  animate={{
                    boxShadow: [
                      "0 10px 40px rgba(99, 102, 241, 0.4)",
                      "0 10px 60px rgba(139, 92, 246, 0.6)",
                      "0 10px 40px rgba(236, 72, 153, 0.4)",
                      "0 10px 60px rgba(99, 102, 241, 0.6)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {/* 多层流光效果 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0"
                    animate={{
                      x: ["-200%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
                    animate={{
                      x: ["-200%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 0.5
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Rocket className="w-5 h-5" />
                    </motion.div>
                    编辑资料
                    <motion.div
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                  </span>
                </motion.button>

                <motion.button
                  className={cn(
                    "px-6 py-3.5 rounded-2xl font-semibold text-sm",
                    "bg-background/60 backdrop-blur-sm text-foreground",
                    "border-2 border-border/50 hover:border-border",
                    "hover:bg-background/80",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                >
                  账户设置
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface StatCardProps {
  value: string
  label: string
  delay?: number
  gradient?: string
}

const StatCard: React.FC<StatCardProps> = ({ value, label, delay = 0, gradient = "from-primary/20 to-blue-500/20" }) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden p-4 rounded-2xl",
        "bg-gradient-to-br backdrop-blur-sm",
        "border-2 border-border/40",
        "transition-all duration-300",
        gradient
      )}
      initial={{ opacity: 0, scale: 0.8, y: 30, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ 
        scale: 1.1, 
        y: -8,
        rotateY: 5,
        borderColor: "rgba(255,255,255,0.3)",
      }}
    >
      {/* 多层光效 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* 流动光带 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: delay
        }}
      />
      
      <div className="relative z-10">
        <motion.div 
          className="text-3xl font-black text-foreground mb-1"
          animate={{
            textShadow: [
              "0 0 10px rgba(255,255,255,0.3)",
              "0 0 20px rgba(255,255,255,0.6)",
              "0 0 10px rgba(255,255,255,0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {value}
        </motion.div>
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
      </div>
      
      {/* 增强装饰性光效 */}
      <motion.div
        className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 rounded-full blur-2xl"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.5
        }}
      />
      
      {/* 边角光点 */}
      <motion.div
        className="absolute bottom-2 left-2 w-2 h-2 bg-white rounded-full"
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  )
}

