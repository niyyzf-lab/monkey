import React, { ReactNode, useEffect, useRef } from "react"

export interface BaseParticle {
  element: HTMLElement | SVGSVGElement
  left: number
  size: number
  top: number
}

export interface BaseParticleOptions {
  particle?: string
  size?: number
}

export interface CoolParticle extends BaseParticle {
  direction: number
  speedHorz: number
  speedUp: number
  spinSpeed: number
  spinVal: number
  life: number
  maxLife: number
  bounceCount: number
  wobble: number
  wobbleSpeed: number
  glowIntensity: number
  scaleMultiplier: number
  opacity: number
}

export interface CoolParticleOptions extends BaseParticleOptions {
  particleCount?: number
  speedHorz?: number
  speedUp?: number
  enableMischief?: boolean
  chaosLevel?: number
}

const getContainer = () => {
  const id = "_coolMode_effect"
  let existingContainer = document.getElementById(id)

  if (existingContainer) {
    return existingContainer
  }

  const container = document.createElement("div")
  container.setAttribute("id", id)
  container.setAttribute(
    "style",
    "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647"
  )

  document.body.appendChild(container)

  return container
}

let instanceCounter = 0

const applyParticleEffect = (
  element: HTMLElement,
  options?: CoolParticleOptions
): (() => void) => {
  instanceCounter++

  // 恶趣味粒子内容库
  const mischiefParticles = [
    "💩", "🤡", "👻", "🦄", "🍕", "🔥", "⚡", "💥", "🌈", "🎭",
    "🧠", "👁️", "🦷", "👃", "👂", "🖕", "💀", "🤖", "👽", "🎪",
    "🍌", "🥒", "🌶️", "🍆", "🥴", "😵‍💫", "🤪", "😈", "👹", "🤮",
    "💊", "🧪", "⚗️", "🔮", "🎲", "🃏", "🎯", "💣", "🧨", "🎊"
  ]
  
  const chaosParticles = [
    "BOOM!", "POW!", "ZAP!", "OOPS!", "WTF!", "LOL!", "OMG!", "YEET!",
    "NOPE!", "BRUH!", "SIKE!", "EPIC!", "FAIL!", "NOOB!", "GG!", "EZ!"
  ]

  const defaultParticle = "circle"
  const particleInput = options?.particle || defaultParticle
  
  // 支持分号分隔的多个粒子类型
  const particleTypes = particleInput.includes(';') 
    ? particleInput.split(';').map(p => p.trim()).filter(p => p.length > 0)
    : [particleInput]
  
  // 恶趣味模式和混乱等级
  const enableMischief = options?.enableMischief ?? true
  const chaosLevel = Math.max(1, Math.min(10, options?.chaosLevel ?? 5))
  
  // 随机选择粒子类型的函数
  const getRandomParticleType = () => {
    if (enableMischief && Math.random() < chaosLevel / 10) {
      // 根据混乱等级决定是否使用恶趣味内容
      if (Math.random() < 0.7) {
        return mischiefParticles[Math.floor(Math.random() * mischiefParticles.length)]
      } else {
        return chaosParticles[Math.floor(Math.random() * chaosParticles.length)]
      }
    }
    return particleTypes[Math.floor(Math.random() * particleTypes.length)]
  }
  
  // 基础大小 - 以输入的size为基准
  const baseSize = options?.size || 16
  const limit = Math.max(15, Math.min(35, Math.floor(baseSize * 1.5))) // 进一步降低粒子数量限制，防止屏幕被占满

  let particles: CoolParticle[] = []
  let mouseX = 0
  let mouseY = 0
  let isFirstHover = true
  let isHovering = false
  let clickCombo = 0
  let lastClickTime = 0

  const container = getContainer()

  function generateParticle(customMouseX?: number, customMouseY?: number, triggerType: 'click' | 'hover' | 'auto' = 'auto') {
    // 以输入的size为基准进行计算
    let sizeMultiplier: number
    
    // 根据触发类型和混乱等级调整大小
    if (triggerType === 'click') {
      // 点击：根据连击数增加大小，最高5倍
      const comboMultiplier = Math.min(5, 1 + clickCombo * 0.3)
      sizeMultiplier = comboMultiplier * (0.8 + Math.random() * 0.8) // 0.8-1.6倍基础 * 连击倍数
    } else if (triggerType === 'hover') {
      // 悬浮：中等随机大小
      sizeMultiplier = 0.6 + Math.random() * 1.2 // 0.6-1.8倍
    } else {
      // 自动：小到中等大小
      sizeMultiplier = 0.4 + Math.random() * 0.8 // 0.4-1.2倍
    }
    
    // 混乱模式下非常稀有的超大粒子（大幅降低概率）
    if (enableMischief && particles.length < limit * 0.3 && Math.random() < chaosLevel / 1000) { // 进一步降低到1/1000，并且只在粒子数较少时生成
      sizeMultiplier *= 1.2 + Math.random() * 0.8 // 进一步降低到1.2-2倍
    }
    
    const size = Math.max(4, baseSize * sizeMultiplier)
    
    // 根据触发类型调整物理属性
    let speedHorz: number
    let speedUp: number
    let spinSpeed: number
    
    if (triggerType === 'click') {
      // 点击：更快更疯狂的运动
      speedHorz = (options?.speedHorz || 2) * (1 + clickCombo * 0.2) * (0.5 + Math.random())
      speedUp = (options?.speedUp || 6) * (1 + clickCombo * 0.1) * (0.8 + Math.random() * 0.4)
      spinSpeed = Math.random() * 50 * (Math.random() <= 0.5 ? -1 : 1) * (1 + clickCombo * 0.1)
    } else if (triggerType === 'hover') {
      // 悬浮：优雅的运动
      speedHorz = (options?.speedHorz || 1.5) * (0.7 + Math.random() * 0.6)
      speedUp = (options?.speedUp || 4) * (0.8 + Math.random() * 0.4)
      spinSpeed = Math.random() * 30 * (Math.random() <= 0.5 ? -1 : 1)
    } else {
      // 自动：缓慢飘逸
      speedHorz = (options?.speedHorz || 1) * (0.3 + Math.random() * 0.7)
      speedUp = (options?.speedUp || 3) * (0.5 + Math.random() * 0.5)
      spinSpeed = Math.random() * 20 * (Math.random() <= 0.5 ? -1 : 1)
    }
    
    const spinVal = Math.random() * 360
    
    // 使用自定义位置或当前鼠标位置
    const x = customMouseX !== undefined ? customMouseX : mouseX
    const y = customMouseY !== undefined ? customMouseY : mouseY
    const top = y - size / 2
    const left = x - size / 2
    const direction = Math.random() <= 0.5 ? -1 : 1
    
    // 新增属性
    const life = 0
    const maxLife = 180 + Math.random() * 120 // 3-5秒生命周期
    const bounceCount = 0
    const wobble = 0
    const wobbleSpeed = 0.02 + Math.random() * 0.05
    const glowIntensity = Math.random()
    const scaleMultiplier = 1
    const opacity = 1

    const particle = document.createElement("div")
    
    // 随机选择一个粒子类型
    const currentParticleType = getRandomParticleType()

    // 创建粒子内容
    if (currentParticleType === "circle") {
      const svgNS = "http://www.w3.org/2000/svg"
      const circleSVG = document.createElementNS(svgNS, "svg")
      const circle = document.createElementNS(svgNS, "circle")
      circle.setAttributeNS(null, "cx", (size / 2).toString())
      circle.setAttributeNS(null, "cy", (size / 2).toString())
      circle.setAttributeNS(null, "r", (size / 2).toString())
      
      // 根据触发类型设置颜色
      let hue = Math.random() * 360
      if (triggerType === 'click') {
        hue = (hue + clickCombo * 60) % 360 // 连击改变颜色
      }
      
      circle.setAttributeNS(
        null,
        "fill",
        `hsl(${hue}, ${70 + Math.random() * 30}%, ${40 + Math.random() * 30}%)`
      )

      // 添加发光效果
      if (enableMischief && glowIntensity > 0.7) {
        circle.setAttributeNS(null, "filter", `drop-shadow(0 0 ${size/4}px hsl(${hue}, 100%, 60%))`)
      }

      circleSVG.appendChild(circle)
      circleSVG.setAttribute("width", size.toString())
      circleSVG.setAttribute("height", size.toString())
      particle.appendChild(circleSVG)
    } else if (
      currentParticleType.startsWith("http") ||
      currentParticleType.startsWith("/")
    ) {
      // Handle URL-based images
      particle.innerHTML = `<img src="${currentParticleType}" width="${size}" height="${size}" style="border-radius: 50%; ${enableMischief && glowIntensity > 0.8 ? `filter: drop-shadow(0 0 ${size/3}px rgba(255,255,255,0.8));` : ''}">`
    } else {
      // Handle emoji or text characters
      const isTextParticle = chaosParticles.includes(currentParticleType)
      
      if (isTextParticle) {
        // 文字粒子样式
        const textSize = size * 0.6 // 文字相对较小
        particle.innerHTML = `<div style="
          font-size: ${textSize}px; 
          font-weight: bold; 
          color: hsl(${Math.random() * 360}, 80%, 50%); 
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          line-height: 1; 
          text-align: center; 
          width: ${size}px; 
          height: ${size}px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-family: 'Comic Sans MS', cursive;
          ${enableMischief && glowIntensity > 0.6 ? `text-shadow: 0 0 ${size/2}px currentColor;` : ''}
        ">${currentParticleType}</div>`
      } else {
        // Emoji粒子样式
        const emojiScale = Math.max(0.8, size / baseSize) // 基于基础大小缩放
        particle.innerHTML = `<div style="
          font-size: ${size}px; 
          line-height: 1; 
          text-align: center; 
          width: ${size}px; 
          height: ${size}px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transform: scale(${emojiScale}); 
          transform-origin: center;
          ${enableMischief && glowIntensity > 0.7 ? `filter: drop-shadow(0 0 ${size/2}px rgba(255,255,255,0.6));` : ''}
        ">${currentParticleType}</div>`
      }
    }

    // 设置粒子基础样式
    particle.style.position = "absolute"
    particle.style.pointerEvents = "none"
    particle.style.userSelect = "none"
    particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`
    particle.style.zIndex = "2147483647"

    container.appendChild(particle)

    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top,
      life,
      maxLife,
      bounceCount,
      wobble,
      wobbleSpeed,
      glowIntensity,
      scaleMultiplier,
      opacity,
    })
  }

  function refreshParticles() {
    const currentTime = performance.now()
    
    // 使用倒序遍历，这样删除元素时不会影响索引
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      
      // 更新生命周期
      p.life++
      const lifeRatio = p.life / p.maxLife
      
      // 基础物理运动
      p.left = p.left - p.speedHorz * p.direction
      p.top = p.top - p.speedUp
      p.speedUp = Math.min(p.size, p.speedUp - 0.8) // 重力加速度
      p.spinVal = p.spinVal + p.spinSpeed
      
      // 添加摆动效果
      p.wobble += p.wobbleSpeed
      const wobbleOffset = Math.sin(p.wobble) * (p.size * 0.3)
      
      // 边界反弹效果（恶趣味）
      if (enableMischief && p.bounceCount < 3) {
        if (p.left <= 0 || p.left >= window.innerWidth - p.size) {
          p.direction *= -1
          p.speedHorz *= 0.8
          p.bounceCount++
          // 反弹时改变旋转方向
          p.spinSpeed *= -1.2
        }
      }
      
      // 生命周期效果
      if (lifeRatio > 0.7) {
        // 临近消失时的效果
        p.opacity = Math.max(0, 1 - (lifeRatio - 0.7) / 0.3)
        p.scaleMultiplier = 1 + (lifeRatio - 0.7) * 2 // 放大消失效果
      } else if (lifeRatio < 0.1) {
        // 刚出现时的效果
        p.opacity = lifeRatio / 0.1
        p.scaleMultiplier = 0.5 + (lifeRatio / 0.1) * 0.5 // 从小放大
      }
      
      // 检查粒子是否需要移除
      if (p.life >= p.maxLife || 
          p.top >= Math.max(window.innerHeight, document.body.clientHeight) + p.size ||
          p.opacity <= 0) {
        particles.splice(i, 1)
        p.element.remove()
        continue
      }
      
      // 混乱模式下的特殊效果
      let extraTransform = ""
      if (enableMischief) {
        // 随机颤抖
        if (Math.random() < 0.05) {
          const shake = (Math.random() - 0.5) * 4
          extraTransform += ` translateX(${shake}px) translateY(${shake}px)`
        }
        
        // 发光脉冲
        if (p.glowIntensity > 0.8 && Math.sin(currentTime * 0.01) > 0.5) {
          p.element.style.filter = `brightness(${1.5 + Math.sin(currentTime * 0.02) * 0.5})`
        }
      }

      // 应用所有变换
      p.element.style.transform = `translate3d(${p.left + wobbleOffset}px, ${p.top}px, 0) rotate(${p.spinVal}deg) scale(${p.scaleMultiplier})${extraTransform}`
      p.element.style.opacity = p.opacity.toString()
    }
  }

  let animationFrame: number | undefined

  // 生成多个粒子的函数
  function generateMultipleParticles(count: number, centerX?: number, centerY?: number, triggerType: 'click' | 'hover' | 'auto' = 'auto') {
    for (let i = 0; i < count; i++) {
      // 在中心点周围随机分布，根据触发类型调整分布范围
      let spreadRange = 50
      if (triggerType === 'click') {
        spreadRange = 30 + clickCombo * 10 // 连击时扩散范围增大
      } else if (triggerType === 'hover') {
        spreadRange = 40
      } else {
        spreadRange = Math.random() * 100 + 50 // 自动模式分布更广
      }
      
      const offsetX = centerX !== undefined ? centerX + (Math.random() - 0.5) * spreadRange : undefined
      const offsetY = centerY !== undefined ? centerY + (Math.random() - 0.5) * spreadRange : undefined
      generateParticle(offsetX, offsetY, triggerType)
    }
  }

  // 缓存随机间隔，避免每帧都计算
  let nextAutoParticleTime = performance.now() + 8000 + Math.random() * 12000 // 8-20秒
  let nextHoverParticleTime = 0
  let nextMischiefEvent = performance.now() + 15000 + Math.random() * 30000 // 15-45秒恶趣味事件

  function loop() {
    const currentTime = performance.now()
    
    // 自动生成粒子：每8-20秒随机生成1-2个
    if (currentTime > nextAutoParticleTime && particles.length < limit) {
      const count = Math.random() < 0.7 ? 1 : 2 // 70%概率1个，30%概率2个
      
      // 在屏幕随机位置生成粒子，偏向屏幕上半部分
      for (let i = 0; i < count; i++) {
        const randomX = Math.random() * window.innerWidth
        const randomY = Math.random() * (window.innerHeight * 0.6) // 上60%区域
        generateParticle(randomX, randomY, 'auto')
      }
      
      // 重新计算下次生成时间
      nextAutoParticleTime = currentTime + 8000 + Math.random() * 12000
    }
    
    // 恶趣味随机事件
    if (enableMischief && currentTime > nextMischiefEvent && particles.length < limit * 0.8) {
      const eventType = Math.floor(Math.random() * 3)
      
      switch (eventType) {
        case 0: // 屏幕边缘爆发
          const edge = Math.floor(Math.random() * 4) // 0上 1右 2下 3左
          const edgeCount = 3 + Math.floor(Math.random() * 4) // 3-6个
          for (let i = 0; i < edgeCount; i++) {
            let x, y
            switch (edge) {
              case 0: // 上边缘
                x = Math.random() * window.innerWidth
                y = -baseSize
                break
              case 1: // 右边缘
                x = window.innerWidth + baseSize
                y = Math.random() * window.innerHeight
                break
              case 2: // 下边缘
                x = Math.random() * window.innerWidth
                y = window.innerHeight + baseSize
                break
              case 3: // 左边缘
                x = -baseSize
                y = Math.random() * window.innerHeight
                break
              default:
                x = Math.random() * window.innerWidth
                y = Math.random() * window.innerHeight
            }
            generateParticle(x, y, 'auto')
          }
          break
          
        case 1: // 屏幕中心爆炸
          const centerCount = 5 + Math.floor(Math.random() * 5) // 5-9个
          generateMultipleParticles(centerCount, window.innerWidth / 2, window.innerHeight / 2, 'auto')
          break
          
        case 2: // 追踪鼠标位置爆发
          if (mouseX && mouseY) {
            const followCount = 3 + Math.floor(Math.random() * 3) // 3-5个
            generateMultipleParticles(followCount, mouseX, mouseY, 'auto')
          }
          break
      }
      
      // 重新计算下次恶趣味事件时间
      nextMischiefEvent = currentTime + 15000 + Math.random() * 30000
    }
    
    // 悬浮状态下的粒子生成
    if (isHovering && particles.length < limit) {
      if (isFirstHover) {
        // 第一次悬浮：立即生成2-4个粒子
        const count = 2 + Math.floor(Math.random() * 3) // 2-4个
        generateMultipleParticles(count, mouseX, mouseY, 'hover')
        isFirstHover = false
        nextHoverParticleTime = currentTime + 2000 + Math.random() * 3000 // 2-5秒后继续
      } else {
        // 后续悬浮：每2-5秒生成1-2个
        if (currentTime > nextHoverParticleTime) {
          const count = Math.random() < 0.6 ? 1 : 2 // 60%概率1个，40%概率2个
          generateMultipleParticles(count, mouseX, mouseY, 'hover')
          nextHoverParticleTime = currentTime + 2000 + Math.random() * 3000
        }
      }
    }

    refreshParticles()
    animationFrame = requestAnimationFrame(loop)
  }

  loop()

  const isTouchInteraction = "ontouchstart" in window

  const tap = isTouchInteraction ? "touchstart" : "mousedown"
  const tapEnd = isTouchInteraction ? "touchend" : "mouseup"
  const move = isTouchInteraction ? "touchmove" : "mousemove"

  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      mouseX = e.touches?.[0].clientX
      mouseY = e.touches?.[0].clientY
    } else {
      mouseX = e.clientX
      mouseY = e.clientY
    }
  }

  const tapHandler = (e: MouseEvent | TouchEvent) => {
    updateMousePosition(e)
    const currentTime = performance.now()
    
    // 连击检测
    if (currentTime - lastClickTime < 500) { // 500ms内算连击
      clickCombo++
    } else {
      clickCombo = 1 // 重置连击
    }
    lastClickTime = currentTime
    
    // 根据连击数生成不同数量的粒子
    let particleCount = 1
    if (clickCombo >= 5) {
      // 连击5次以上：爆炸效果
      particleCount = 8 + Math.floor(Math.random() * 5) // 8-12个
    } else if (clickCombo >= 3) {
      // 连击3-4次：中等爆发
      particleCount = 4 + Math.floor(Math.random() * 3) // 4-6个
    } else if (clickCombo >= 2) {
      // 连击2次：小爆发
      particleCount = 2 + Math.floor(Math.random() * 2) // 2-3个
    }
    
    // 检查粒子数量限制，防止屏幕被占满
    const availableSlots = Math.max(0, limit - particles.length)
    const actualCount = Math.min(particleCount, availableSlots)
    
    // 生成粒子
    if (actualCount > 0) {
      if (actualCount === 1) {
        generateParticle(mouseX, mouseY, 'click')
      } else {
        generateMultipleParticles(actualCount, mouseX, mouseY, 'click')
      }
    }
    
    // 连击达到一定次数时重置，避免无限增长
    if (clickCombo >= 10) {
      clickCombo = 0
      // 超级爆炸效果（也要检查限制）
      if (enableMischief && particles.length < limit * 0.5) {
        setTimeout(() => {
          const availableSlotsDelayed = Math.max(0, limit - particles.length)
          const superCount = Math.min(15, availableSlotsDelayed)
          if (superCount > 0) {
            generateMultipleParticles(superCount, mouseX, mouseY, 'click')
          }
        }, 100)
      }
    }
  }

  const disableAutoAddParticle = () => {
    // 这个函数保留是为了兼容性，但现在不需要做任何事情
  }

  const mouseEnterHandler = (e: MouseEvent) => {
    updateMousePosition(e)
    isHovering = true
  }

  const mouseLeaveHandler = () => {
    isHovering = false
    // 离开时的告别效果
    if (enableMischief && Math.random() < 0.3) { // 30%概率
      setTimeout(() => {
        generateParticle(mouseX, mouseY, 'hover')
      }, 200)
    }
    
    // 重置第一次悬浮标志，这样下次悬浮又会立即生成粒子
    setTimeout(() => {
      isFirstHover = true
      // 重置连击计数器（如果长时间没有交互）
      if (performance.now() - lastClickTime > 5000) {
        clickCombo = 0
      }
    }, 3000) // 3秒后重置
  }

  element.addEventListener(move, updateMousePosition, { passive: true })
  element.addEventListener(tap, tapHandler, { passive: true })
  element.addEventListener(tapEnd, disableAutoAddParticle, { passive: true })
  element.addEventListener("click", tapHandler, { passive: true }) // 添加click事件确保点击触发
  element.addEventListener("mouseenter", mouseEnterHandler, { passive: true })
  element.addEventListener("mouseleave", mouseLeaveHandler, { passive: true })
  element.addEventListener("mouseleave", disableAutoAddParticle, {
    passive: true,
  })

  return () => {
    element.removeEventListener(move, updateMousePosition)
    element.removeEventListener(tap, tapHandler)
    element.removeEventListener(tapEnd, disableAutoAddParticle)
    element.removeEventListener("click", tapHandler) // 移除click事件监听器
    element.removeEventListener("mouseenter", mouseEnterHandler)
    element.removeEventListener("mouseleave", mouseLeaveHandler)
    element.removeEventListener("mouseleave", disableAutoAddParticle)

    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame)
        clearInterval(interval)

        if (--instanceCounter === 0) {
          container.remove()
        }
      }
    }, 500)
  }
}

interface CoolModeProps {
  children: ReactNode
  options?: CoolParticleOptions
}

export const CoolMode: React.FC<CoolModeProps> = ({ children, options }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      return applyParticleEffect(ref.current, options)
    }
  }, [options])

  return <span ref={ref}>{children}</span>
}
