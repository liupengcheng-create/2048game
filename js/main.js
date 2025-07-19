/**
 * 2048游戏主文件
 * 负责初始化游戏和协调各个组件
 */

// 全局游戏实例
let game = null;
let gameState = null;
let gameEngine = null;
let gameRenderer = null;
let eventHandler = null;
let scoreManager = null;

/**
 * 全局错误处理
 */
window.addEventListener('error', function(event) {
    handleError(new Error(event.message), '全局JavaScript错误', true);
});

window.addEventListener('unhandledrejection', function(event) {
    handleError(new Error(event.reason), '未处理的Promise拒绝', true);
});

/**
 * 性能监控
 */
const performanceMonitor = {
    startTime: Date.now(),
    metrics: {
        initTime: 0,
        renderCount: 0,
        moveCount: 0,
        errorCount: 0
    },

    recordInit() {
        this.metrics.initTime = Date.now() - this.startTime;
        console.log(`游戏初始化耗时: ${this.metrics.initTime}ms`);
    },

    recordRender() {
        this.metrics.renderCount++;
    },

    recordMove() {
        this.metrics.moveCount++;
    },

    recordError() {
        this.metrics.errorCount++;
    },

    getReport() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.startTime,
            avgRenderTime: this.metrics.renderCount > 0 ?
                (Date.now() - this.startTime) / this.metrics.renderCount : 0
        };
    }
};

/**
 * 文档加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('2048游戏正在初始化...');

    try {
        // 初始化游戏状态
        gameState = new GameState();
        console.log('游戏状态初始化完成');

        // 初始化分数管理器
        scoreManager = new ScoreManager();
        console.log('分数管理器初始化完成');

        // 初始化游戏引擎
        gameEngine = new GameEngine(gameState, scoreManager);
        console.log('游戏引擎初始化完成');

        // 初始化游戏渲染器
        const gameContainer = document.querySelector('.game-container');
        gameRenderer = new GameRenderer(gameContainer);
        console.log('游戏渲染器初始化完成');

        // 初始化事件处理器
        eventHandler = new EventHandler(gameEngine, gameRenderer);
        eventHandler.init();
        console.log('事件处理器初始化完成');

        // 测试基本功能
        testGameComponents();

        // 初始化游戏
        gameEngine.initGame();

        // 渲染初始界面
        gameRenderer.render(gameState);

        // 绑定UI事件
        bindUIEvents();

        // 记录初始化完成
        performanceMonitor.recordInit();

        console.log('2048游戏初始化完成！');
        console.log('性能报告:', performanceMonitor.getReport());

    } catch (error) {
        performanceMonitor.recordError();
        console.error('游戏初始化失败:', error);
        handleError(error, '游戏初始化', true);
    }
});

/**
 * 测试游戏组件的基本功能
 */
function testGameComponents() {
    console.log('开始测试游戏组件...');

    try {
        // 测试GameState
        console.assert(gameState.getScore() === 0, '初始分数应该为0');
        console.assert(gameState.getBestScore() === 0, '初始最高分应该为0');
        console.assert(!gameState.isGameOver(), '游戏初始状态不应该结束');
        console.assert(!gameState.hasWon(), '游戏初始状态不应该获胜');

        // 测试GameEngine
        console.assert(gameEngine.getVersion() === '1.0.0', 'GameEngine版本应该正确');
        console.assert(gameEngine.canMove() === true, '初始状态应该可以移动');

        // 测试GameRenderer
        console.assert(gameRenderer.getVersion() === '1.0.0', 'GameRenderer版本应该正确');

        // 测试EventHandler
        console.assert(eventHandler.getVersion() === '1.0.0', 'EventHandler版本应该正确');

        // 测试ScoreManager
        console.assert(scoreManager.getVersion() === '1.0.0', 'ScoreManager版本应该正确');
        console.assert(scoreManager.getCurrentScore() === 0, '初始当前分数应该为0');

        console.log('游戏组件测试通过！');
    } catch (error) {
        console.error('游戏组件测试失败:', error);
    }
}

/**
 * 绑定UI事件
 */
function bindUIEvents() {
    try {
        // 绑定重新开始按钮事件
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                console.log('重新开始游戏');
                restartGame();
            });
        }

        // 绑定再试一次按钮事件
        const tryAgainBtn = document.getElementById('try-again-btn');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', function() {
                console.log('再试一次');
                restartGame();
            });
        }

        console.log('UI事件绑定完成');
    } catch (error) {
        console.error('绑定UI事件失败:', error);
    }
}

/**
 * 重新开始游戏
 */
function restartGame() {
    try {
        console.log('重新开始游戏...');

        // 重新初始化游戏
        gameEngine.restart();

        // 重新渲染界面
        gameRenderer.render(gameState);

        console.log('游戏重新开始完成');
    } catch (error) {
        console.error('重新开始游戏失败:', error);
        handleError(error, '重新开始游戏');
    }
}

/**
 * 更新分数显示（现在由GameRenderer处理）
 */
function updateScoreDisplay() {
    if (gameRenderer && gameState) {
        gameRenderer.updateScoreDisplay(gameState);
    }
}

/**
 * 显示游戏消息（现在由GameRenderer处理）
 * @param {string} message - 要显示的消息
 */
function showGameMessage(message) {
    if (gameRenderer) {
        gameRenderer.showMessage(message);
    }
}

/**
 * 隐藏游戏消息（现在由GameRenderer处理）
 */
function hideGameMessage() {
    if (gameRenderer) {
        gameRenderer.hideMessage();
    }
}

/**
 * 错误处理函数
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 * @param {boolean} critical - 是否为严重错误
 */
function handleError(error, context, critical = false) {
    // 记录详细错误信息
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        gameState: gameState ? {
            score: gameState.getScore(),
            gameStarted: gameState.isGameStarted(),
            gameOver: gameState.isGameOver()
        } : null
    };

    console.error(`${context}:`, error);
    console.error('错误详情:', errorInfo);

    // 尝试保存错误到本地存储（用于调试）
    try {
        const errorLog = JSON.parse(localStorage.getItem('2048_error_log') || '[]');
        errorLog.push(errorInfo);
        // 只保留最近10个错误
        if (errorLog.length > 10) {
            errorLog.splice(0, errorLog.length - 10);
        }
        localStorage.setItem('2048_error_log', JSON.stringify(errorLog));
    } catch (storageError) {
        console.warn('无法保存错误日志:', storageError);
    }

    // 显示用户友好的错误消息
    let userMessage;
    if (critical) {
        userMessage = `游戏遇到严重错误：${context}。\n请刷新页面重试。如果问题持续存在，请清除浏览器缓存。`;
    } else {
        userMessage = `操作失败：${context}。\n请重试或刷新页面。`;
    }

    showGameMessage(userMessage);

    // 如果是严重错误，尝试恢复游戏状态
    if (critical && gameEngine) {
        setTimeout(() => {
            try {
                console.log('尝试恢复游戏状态...');
                gameEngine.restart();
                if (gameRenderer) {
                    gameRenderer.render(gameState);
                }
                console.log('游戏状态恢复成功');
            } catch (recoveryError) {
                console.error('游戏状态恢复失败:', recoveryError);
            }
        }, 3000);
    }
}

/**
 * 工具函数：生成随机整数
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（不包含）
 * @returns {number} 随机整数
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 工具函数：深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 深拷贝后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    return obj;
}

// 导出全局函数供其他模块使用
window.GameUtils = {
    getRandomInt,
    deepClone,
    handleError,
    showGameMessage,
    hideGameMessage,
    updateScoreDisplay,
    restartGame
};

// 导出游戏实例供调试使用
window.Game = {
    state: () => gameState,
    engine: () => gameEngine,
    renderer: () => gameRenderer,
    eventHandler: () => eventHandler,
    scoreManager: () => scoreManager,
    restart: restartGame,
    // 便捷的统计信息获取
    stats: () => scoreManager ? scoreManager.getStatistics() : null,
    history: () => scoreManager ? scoreManager.getGameHistory() : []
};
