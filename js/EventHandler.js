/**
 * EventHandler类 - 事件处理器
 * 负责处理用户输入事件（键盘和触摸）
 *
 * 主要功能：
 * - 键盘方向键事件处理
 * - 触摸滑动手势识别
 * - 防止重复快速操作
 * - 事件委托和清理
 */
class EventHandler {
    /**
     * 构造函数
     * @param {GameEngine} gameEngine - 游戏引擎实例
     * @param {GameRenderer} gameRenderer - 游戏渲染器实例
     */
    constructor(gameEngine, gameRenderer) {
        if (!gameEngine) {
            throw new Error('EventHandler requires a valid GameEngine instance');
        }

        this.gameEngine = gameEngine;
        this.gameRenderer = gameRenderer;

        // 事件配置
        this.config = {
            // 防抖延迟（毫秒）
            debounceDelay: 100,
            // 触摸滑动最小距离
            minSwipeDistance: 30,
            // 触摸滑动最大时间（毫秒）
            maxSwipeTime: 1000,
            // 是否启用触觉反馈
            enableHapticFeedback: true,
            // 是否启用音效反馈
            enableSoundFeedback: false
        };

        // 检测设备类型和能力
        this.deviceInfo = this.detectDevice();

        // 事件状态
        this.isProcessing = false; // 是否正在处理移动
        this.lastMoveTime = 0; // 上次移动时间

        // 触摸事件状态
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;

        // 绑定的事件处理函数（用于清理）
        this.boundHandlers = {
            keydown: null,
            touchstart: null,
            touchend: null,
            touchmove: null
        };

        console.log('EventHandler 初始化完成');

        // 根据设备调整配置
        this.adjustConfigForDevice();
    }

    /**
     * 初始化所有事件监听器
     */
    init() {
        try {
            this.bindKeyboard();
            this.bindTouch();
            console.log('EventHandler 事件绑定完成');
        } catch (error) {
            console.error('EventHandler 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 绑定键盘事件
     */
    bindKeyboard() {
        try {
            // 创建键盘事件处理函数
            this.boundHandlers.keydown = (event) => {
                this.handleKeydown(event);
            };

            // 绑定到document，确保全局捕获
            document.addEventListener('keydown', this.boundHandlers.keydown);

            console.log('键盘事件绑定完成');
        } catch (error) {
            console.error('绑定键盘事件失败:', error);
        }
    }

    /**
     * 绑定触摸事件
     */
    bindTouch() {
        try {
            // 获取游戏容器
            const gameContainer = document.querySelector('.game-container');
            if (!gameContainer) {
                console.warn('未找到游戏容器，跳过触摸事件绑定');
                return;
            }

            // 创建触摸事件处理函数
            this.boundHandlers.touchstart = (event) => {
                this.handleTouchStart(event);
            };

            this.boundHandlers.touchend = (event) => {
                this.handleTouchEnd(event);
            };

            this.boundHandlers.touchmove = (event) => {
                this.handleTouchMove(event);
            };

            // 绑定触摸事件
            gameContainer.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: false });
            gameContainer.addEventListener('touchend', this.boundHandlers.touchend, { passive: false });
            gameContainer.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: false });

            console.log('触摸事件绑定完成');
        } catch (error) {
            console.error('绑定触摸事件失败:', error);
        }
    }

    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeydown(event) {
        try {
            // 检查是否是方向键
            const keyDirectionMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                // 兼容WASD键
                'KeyW': 'up',
                'KeyS': 'down',
                'KeyA': 'left',
                'KeyD': 'right'
            };

            const direction = keyDirectionMap[event.code];

            if (direction) {
                // 阻止默认行为（如页面滚动）
                event.preventDefault();

                // 处理移动
                this.handleMove(direction);
            }

        } catch (error) {
            console.error('处理键盘事件失败:', error);
        }
    }

    /**
     * 处理触摸开始事件
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchStart(event) {
        try {
            // 阻止默认行为
            event.preventDefault();

            if (event.touches.length === 1) {
                const touch = event.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                this.touchStartTime = Date.now();
            }

        } catch (error) {
            console.error('处理触摸开始事件失败:', error);
        }
    }

    /**
     * 处理触摸移动事件
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchMove(event) {
        try {
            // 阻止默认行为（如页面滚动）
            event.preventDefault();
        } catch (error) {
            console.error('处理触摸移动事件失败:', error);
        }
    }

    /**
     * 处理触摸结束事件
     * @param {TouchEvent} event - 触摸事件
     */
    handleTouchEnd(event) {
        try {
            // 阻止默认行为
            event.preventDefault();

            if (event.changedTouches.length === 1) {
                const touch = event.changedTouches[0];
                const touchEndX = touch.clientX;
                const touchEndY = touch.clientY;
                const touchEndTime = Date.now();

                // 计算滑动距离和时间
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                const deltaTime = touchEndTime - this.touchStartTime;

                // 检查是否是有效滑动
                if (this.isValidSwipe(deltaX, deltaY, deltaTime)) {
                    const direction = this.getSwipeDirection(deltaX, deltaY);
                    if (direction) {
                        this.handleMove(direction);
                    }
                }
            }

        } catch (error) {
            console.error('处理触摸结束事件失败:', error);
        }
    }

    /**
     * 检查是否是有效的滑动手势
     * @param {number} deltaX - X轴位移
     * @param {number} deltaY - Y轴位移
     * @param {number} deltaTime - 时间差
     * @returns {boolean} 是否是有效滑动
     */
    isValidSwipe(deltaX, deltaY, deltaTime) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        return distance >= this.config.minSwipeDistance &&
               deltaTime <= this.config.maxSwipeTime;
    }

    /**
     * 根据位移确定滑动方向
     * @param {number} deltaX - X轴位移
     * @param {number} deltaY - Y轴位移
     * @returns {string|null} 滑动方向
     */
    getSwipeDirection(deltaX, deltaY) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // 确定主要滑动方向
        if (absDeltaX > absDeltaY) {
            // 水平滑动
            return deltaX > 0 ? 'right' : 'left';
        } else {
            // 垂直滑动
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    /**
     * 处理移动事件
     * @param {string} direction - 移动方向
     */
    handleMove(direction) {
        try {
            // 检查是否正在处理移动
            if (this.isProcessing) {
                console.log('正在处理移动，忽略新的移动请求');
                return;
            }

            // 检查防抖
            const currentTime = Date.now();
            if (currentTime - this.lastMoveTime < this.config.debounceDelay) {
                console.log('移动过于频繁，忽略请求');
                return;
            }

            // 标记正在处理
            this.isProcessing = true;
            this.lastMoveTime = currentTime;

            console.log(`处理移动: ${direction}`);

            // 执行移动
            const moveSuccess = this.gameEngine.move(direction);

            if (moveSuccess) {
                // 提供触觉反馈
                this.provideFeedback('move');

                if (this.gameRenderer) {
                    // 重新渲染界面（带动画）
                    this.gameRenderer.render(this.gameEngine.gameState);
                    this.gameRenderer.updateScoreDisplay(this.gameEngine.gameState, true);
                }
            } else {
                // 移动失败的反馈
                this.provideFeedback('invalid');
            }

            // 处理完成
            setTimeout(() => {
                this.isProcessing = false;
            }, this.config.debounceDelay);

        } catch (error) {
            console.error(`处理移动事件失败 (${direction}):`, error);
            this.isProcessing = false;
        }
    }

    /**
     * 处理重启事件
     */
    handleRestart() {
        try {
            console.log('处理重启事件');

            if (this.gameEngine) {
                this.gameEngine.restart();

                if (this.gameRenderer) {
                    this.gameRenderer.render(this.gameEngine.gameState);
                }
            }

        } catch (error) {
            console.error('处理重启事件失败:', error);
        }
    }

    /**
     * 设置事件处理配置
     * @param {Object} newConfig - 新的配置
     */
    setConfig(newConfig) {
        try {
            if (newConfig.debounceDelay && newConfig.debounceDelay > 0) {
                this.config.debounceDelay = newConfig.debounceDelay;
            }

            if (newConfig.minSwipeDistance && newConfig.minSwipeDistance > 0) {
                this.config.minSwipeDistance = newConfig.minSwipeDistance;
            }

            if (newConfig.maxSwipeTime && newConfig.maxSwipeTime > 0) {
                this.config.maxSwipeTime = newConfig.maxSwipeTime;
            }

            console.log('事件处理配置已更新:', this.config);
        } catch (error) {
            console.error('设置事件处理配置失败:', error);
        }
    }

    /**
     * 获取当前配置
     * @returns {Object} 当前配置
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * 启用事件处理
     */
    enable() {
        try {
            this.isProcessing = false;
            console.log('事件处理已启用');
        } catch (error) {
            console.error('启用事件处理失败:', error);
        }
    }

    /**
     * 禁用事件处理
     */
    disable() {
        try {
            this.isProcessing = true;
            console.log('事件处理已禁用');
        } catch (error) {
            console.error('禁用事件处理失败:', error);
        }
    }

    /**
     * 获取事件处理器版本
     * @returns {string} 版本信息
     */
    getVersion() {
        return '1.0.0';
    }

    /**
     * 提供用户反馈（触觉、音效等）
     * @param {string} type - 反馈类型 ('move', 'invalid', 'merge', 'win', 'lose')
     */
    provideFeedback(type) {
        try {
            // 触觉反馈
            if (this.config.enableHapticFeedback && navigator.vibrate) {
                switch (type) {
                    case 'move':
                        navigator.vibrate(10); // 轻微震动
                        break;
                    case 'invalid':
                        navigator.vibrate([50, 50, 50]); // 三次短震动
                        break;
                    case 'merge':
                        navigator.vibrate(20); // 中等震动
                        break;
                    case 'win':
                        navigator.vibrate([100, 50, 100, 50, 100]); // 胜利震动
                        break;
                    case 'lose':
                        navigator.vibrate([200, 100, 200]); // 失败震动
                        break;
                }
            }

            // 音效反馈（如果启用）
            if (this.config.enableSoundFeedback) {
                this.playSound(type);
            }

        } catch (error) {
            console.error('提供用户反馈失败:', error);
        }
    }

    /**
     * 播放音效
     * @param {string} type - 音效类型
     */
    playSound(type) {
        try {
            // 这里可以添加音效播放逻辑
            // 由于没有音频文件，暂时使用Web Audio API生成简单音效
            if (window.AudioContext || window['webkitAudioContext']) {
                const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
                const audioContext = new AudioContextClass();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // 根据类型设置不同的音调
                switch (type) {
                    case 'move':
                        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                        break;
                    case 'invalid':
                        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                        break;
                    case 'merge':
                        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                        break;
                    case 'win':
                        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                        break;
                    case 'lose':
                        oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
                        break;
                }

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        } catch (error) {
            console.error('播放音效失败:', error);
        }
    }

    /**
     * 添加视觉反馈效果
     * @param {string} direction - 移动方向
     */
    addVisualFeedback(direction) {
        try {
            const gameContainer = document.querySelector('.game-container');
            if (!gameContainer) return;

            // 添加方向指示器
            const indicator = document.createElement('div');
            indicator.className = 'direction-indicator';
            indicator.textContent = this.getDirectionArrow(direction);
            indicator.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: #8f7a66;
                pointer-events: none;
                z-index: 1000;
                opacity: 0.8;
                animation: fadeOut 0.5s ease-out forwards;
            `;

            gameContainer.appendChild(indicator);

            // 自动移除指示器
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 500);

        } catch (error) {
            console.error('添加视觉反馈失败:', error);
        }
    }

    /**
     * 获取方向箭头
     * @param {string} direction - 方向
     * @returns {string} 箭头字符
     */
    getDirectionArrow(direction) {
        const arrows = {
            'up': '↑',
            'down': '↓',
            'left': '←',
            'right': '→'
        };
        return arrows[direction] || '?';
    }

    /**
     * 销毁事件处理器，清理所有事件监听器
     */
    destroy() {
        try {
            // 移除键盘事件
            if (this.boundHandlers.keydown) {
                document.removeEventListener('keydown', this.boundHandlers.keydown);
            }

            // 移除触摸事件
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                if (this.boundHandlers.touchstart) {
                    gameContainer.removeEventListener('touchstart', this.boundHandlers.touchstart);
                }
                if (this.boundHandlers.touchend) {
                    gameContainer.removeEventListener('touchend', this.boundHandlers.touchend);
                }
                if (this.boundHandlers.touchmove) {
                    gameContainer.removeEventListener('touchmove', this.boundHandlers.touchmove);
                }
            }

            // 清理引用
            this.gameEngine = null;
            this.gameRenderer = null;
            this.boundHandlers = {};

            console.log('EventHandler 已销毁');
        } catch (error) {
            console.error('销毁事件处理器失败:', error);
        }
    }

    /**
     * 检测设备类型和能力
     * @returns {Object} 设备信息
     */
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
        const isIOS = /iphone|ipad|ipod/i.test(userAgent);
        const isAndroid = /android/i.test(userAgent);

        // 检测触摸支持
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // 检测屏幕尺寸
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const isSmallScreen = Math.min(screenWidth, screenHeight) < 400;

        // 检测设备像素比
        const pixelRatio = window.devicePixelRatio || 1;

        return {
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet,
            isIOS,
            isAndroid,
            hasTouch,
            screenWidth,
            screenHeight,
            isSmallScreen,
            pixelRatio,
            supportsVibration: 'vibrate' in navigator,
            supportsAudio: !!(window.AudioContext || window['webkitAudioContext'])
        };
    }

    /**
     * 根据设备调整配置
     */
    adjustConfigForDevice() {
        try {
            // 移动设备调整
            if (this.deviceInfo.isMobile) {
                this.config.debounceDelay = 150; // 增加防抖延迟
                this.config.minSwipeDistance = 20; // 减少最小滑动距离
            }

            // 小屏幕设备调整
            if (this.deviceInfo.isSmallScreen) {
                this.config.minSwipeDistance = 15;
            }

            // iOS设备调整
            if (this.deviceInfo.isIOS) {
                this.config.enableHapticFeedback = true; // iOS有很好的触觉反馈
            }

            console.log('设备配置已调整:', this.config);
        } catch (error) {
            console.error('调整设备配置失败:', error);
        }
    }

    /**
     * 获取设备信息
     * @returns {Object} 设备信息
     */
    getDeviceInfo() {
        return { ...this.deviceInfo };
    }

    /**
     * 获取版本信息
     * @returns {string} 版本信息
     */
    getVersion() {
        return '1.0.0';
    }
}
