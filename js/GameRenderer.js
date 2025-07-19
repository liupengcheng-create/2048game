/**
 * GameRenderer类 - 游戏界面渲染器
 * 负责游戏界面的渲染和DOM操作
 *
 * 主要功能：
 * - 渲染游戏网格和方块
 * - 更新分数显示
 * - 显示游戏消息
 * - 处理动画效果
 * - 管理DOM元素
 */
class GameRenderer {
    /**
     * 构造函数
     * @param {HTMLElement} container - 游戏容器元素
     */
    constructor(container) {
        if (!container) {
            throw new Error('GameRenderer requires a valid container element');
        }

        this.container = container;

        // 获取关键DOM元素
        this.tileContainer = document.getElementById('tile-container');
        this.currentScoreElement = document.getElementById('current-score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessageElement = document.getElementById('game-message');
        this.messageTextElement = document.getElementById('message-text');

        // 验证必需的DOM元素
        if (!this.tileContainer) {
            throw new Error('Tile container element not found');
        }

        // 渲染配置
        this.config = {
            animationDuration: 150, // 动画持续时间（毫秒）
            tileSize: 'calc((100% - 30px) / 4)', // 方块大小
            tileGap: 10 // 方块间隙
        };

        // 当前渲染的方块映射
        this.currentTiles = new Map();

        console.log('GameRenderer 初始化完成');
    }

    /**
     * 渲染游戏界面
     * @param {GameState} gameState - 游戏状态
     */
    render(gameState) {
        try {
            // 验证输入参数
            if (!this.validateRenderInput(gameState)) {
                return;
            }

            // 检查渲染器状态
            if (!this.isRendererReady()) {
                console.warn('渲染器未准备就绪，跳过渲染');
                return;
            }

            // 记录渲染开始时间
            const renderStart = performance.now();

            // 更新分数显示
            this.updateScoreDisplay(gameState);

            // 渲染游戏网格
            this.renderGrid(gameState);

            // 检查并显示游戏状态消息
            this.updateGameMessage(gameState);

            // 记录渲染性能
            const renderTime = performance.now() - renderStart;
            if (renderTime > 16) { // 超过一帧的时间
                console.warn(`渲染耗时过长: ${renderTime.toFixed(2)}ms`);
            }

            // 通知性能监控器（如果存在）
            if (window.performanceMonitor) {
                window.performanceMonitor.recordRender();
            }

        } catch (error) {
            console.error('渲染游戏界面失败:', error);
            this.handleRenderError(error);
        }
    }

    /**
     * 验证渲染输入参数
     * @param {GameState} gameState - 游戏状态
     * @returns {boolean} 输入是否有效
     */
    validateRenderInput(gameState) {
        if (!gameState) {
            console.error('GameState为null或undefined');
            return false;
        }

        if (typeof gameState.getGrid !== 'function') {
            console.error('GameState缺少getGrid方法');
            return false;
        }

        if (typeof gameState.getScore !== 'function') {
            console.error('GameState缺少getScore方法');
            return false;
        }

        const grid = gameState.getGrid();
        if (!Array.isArray(grid) || grid.length !== 4) {
            console.error('无效的游戏网格');
            return false;
        }

        return true;
    }

    /**
     * 检查渲染器是否准备就绪
     * @returns {boolean} 渲染器是否准备就绪
     */
    isRendererReady() {
        if (!this.container) {
            console.error('游戏容器不存在');
            return false;
        }

        if (!this.tileContainer) {
            console.error('方块容器不存在');
            return false;
        }

        if (!document.body.contains(this.container)) {
            console.error('游戏容器未添加到DOM中');
            return false;
        }

        return true;
    }

    /**
     * 处理渲染错误
     * @param {Error} error - 渲染错误
     */
    handleRenderError(error) {
        try {
            // 尝试恢复渲染器状态
            this.clearAllTiles();

            // 显示错误消息
            this.showMessage('界面渲染出现问题，正在尝试恢复...');

            // 延迟后隐藏错误消息
            setTimeout(() => {
                this.hideMessage();
            }, 3000);

        } catch (recoveryError) {
            console.error('渲染错误恢复失败:', recoveryError);
        }
    }

    /**
     * 渲染游戏网格
     * @param {GameState} gameState - 游戏状态
     */
    renderGrid(gameState) {
        try {
            const grid = gameState.getGrid();
            const newTiles = new Map();

            // 清空当前方块容器
            this.tileContainer.innerHTML = '';

            // 渲染每个方块
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const value = grid[row][col];

                    if (value !== 0) {
                        const tileKey = `${row}-${col}`;
                        const tileElement = this.createTileElement(row, col, value);

                        this.tileContainer.appendChild(tileElement);
                        newTiles.set(tileKey, tileElement);
                    }
                }
            }

            // 更新当前方块映射
            this.currentTiles = newTiles;

        } catch (error) {
            console.error('渲染游戏网格失败:', error);
        }
    }

    /**
     * 创建方块DOM元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} value - 方块值
     * @returns {HTMLElement} 方块DOM元素
     */
    createTileElement(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value.toString();

        // 设置方块位置
        const left = col * (100 / 4) + '%';
        const top = row * (100 / 4) + '%';

        tile.style.position = 'absolute';
        tile.style.left = left;
        tile.style.top = top;
        tile.style.width = this.config.tileSize;
        tile.style.height = this.config.tileSize;

        // 为超大数值添加特殊样式
        if (value > 2048) {
            tile.classList.add('tile-super');
        }

        return tile;
    }

    /**
     * 更新单个方块
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} value - 方块值
     */
    updateTile(row, col, value) {
        try {
            const tileKey = `${row}-${col}`;

            if (value === 0) {
                // 移除方块
                if (this.currentTiles.has(tileKey)) {
                    const tileElement = this.currentTiles.get(tileKey);
                    tileElement.remove();
                    this.currentTiles.delete(tileKey);
                }
            } else {
                // 更新或创建方块
                if (this.currentTiles.has(tileKey)) {
                    const tileElement = this.currentTiles.get(tileKey);
                    tileElement.textContent = value.toString();
                    tileElement.className = `tile tile-${value}`;

                    if (value > 2048) {
                        tileElement.classList.add('tile-super');
                    }
                } else {
                    const tileElement = this.createTileElement(row, col, value);
                    this.tileContainer.appendChild(tileElement);
                    this.currentTiles.set(tileKey, tileElement);
                }
            }

        } catch (error) {
            console.error(`更新方块失败 (${row}, ${col}, ${value}):`, error);
        }
    }

    /**
     * 更新分数显示
     * @param {GameState} gameState - 游戏状态
     * @param {boolean} animate - 是否显示动画
     */
    updateScoreDisplay(gameState, animate = false) {
        try {
            const currentScore = gameState.getScore();
            const bestScore = gameState.getBestScore();

            if (this.currentScoreElement) {
                const oldScore = parseInt(this.currentScoreElement.textContent) || 0;
                this.currentScoreElement.textContent = currentScore.toString();

                // 如果分数增加且需要动画
                if (animate && currentScore > oldScore) {
                    this.animateScoreIncrease(this.currentScoreElement);
                }
            }

            if (this.bestScoreElement) {
                const oldBestScore = parseInt(this.bestScoreElement.textContent) || 0;
                this.bestScoreElement.textContent = bestScore.toString();

                // 如果最高分更新且需要动画
                if (animate && bestScore > oldBestScore) {
                    this.animateScoreIncrease(this.bestScoreElement);
                }
            }

        } catch (error) {
            console.error('更新分数显示失败:', error);
        }
    }

    /**
     * 分数增加动画
     * @param {HTMLElement} element - 分数元素
     */
    animateScoreIncrease(element) {
        try {
            element.classList.add('score-increase');

            setTimeout(() => {
                element.classList.remove('score-increase');
            }, 300);

        } catch (error) {
            console.error('分数增加动画失败:', error);
        }
    }

    /**
     * 更新游戏消息显示
     * @param {GameState} gameState - 游戏状态
     */
    updateGameMessage(gameState) {
        try {
            if (!this.gameMessageElement || !this.messageTextElement) {
                return;
            }

            if (gameState.hasWon() && gameState.canContinueGame()) {
                this.showMessage('恭喜！你达到了2048！\n点击"继续游戏"可以继续挑战更高分数。');
            } else if (gameState.isGameOver()) {
                this.showMessage('游戏结束！\n最终分数：' + gameState.getScore());
            } else {
                this.hideMessage();
            }

        } catch (error) {
            console.error('更新游戏消息失败:', error);
        }
    }

    /**
     * 显示消息
     * @param {string} text - 消息文本
     */
    showMessage(text) {
        try {
            if (this.messageTextElement) {
                this.messageTextElement.textContent = text;
            }

            if (this.gameMessageElement) {
                this.gameMessageElement.classList.add('show');
            }

        } catch (error) {
            console.error('显示消息失败:', error);
        }
    }

    /**
     * 隐藏消息
     */
    hideMessage() {
        try {
            if (this.gameMessageElement) {
                this.gameMessageElement.classList.remove('show');
            }

        } catch (error) {
            console.error('隐藏消息失败:', error);
        }
    }

    /**
     * 移动动画
     * @param {Object} from - 起始位置 {row, col}
     * @param {Object} to - 目标位置 {row, col}
     * @param {number} value - 方块值
     * @returns {Promise} 动画完成的Promise
     */
    animateMove(from, to, value) {
        return new Promise((resolve) => {
            try {
                const fromKey = `${from.row}-${from.col}`;
                const toKey = `${to.row}-${to.col}`;

                // 获取起始方块元素
                let tileElement = this.currentTiles.get(fromKey);

                if (!tileElement) {
                    // 如果没有找到起始方块，创建一个临时的
                    tileElement = this.createTileElement(from.row, from.col, value);
                    this.tileContainer.appendChild(tileElement);
                }

                // 计算目标位置
                const targetLeft = to.col * (100 / 4) + '%';
                const targetTop = to.row * (100 / 4) + '%';

                // 添加过渡动画
                tileElement.style.transition = `all ${this.config.animationDuration}ms ease-in-out`;
                tileElement.style.left = targetLeft;
                tileElement.style.top = targetTop;

                // 更新方块映射
                this.currentTiles.delete(fromKey);
                this.currentTiles.set(toKey, tileElement);

                // 动画完成后的回调
                setTimeout(() => {
                    tileElement.style.transition = '';
                    resolve();
                }, this.config.animationDuration);

            } catch (error) {
                console.error('移动动画失败:', error);
                resolve();
            }
        });
    }

    /**
     * 合并动画
     * @param {Object} position - 合并位置 {row, col}
     * @param {number} value - 合并后的值
     * @returns {Promise} 动画完成的Promise
     */
    animateMerge(position, value) {
        return new Promise((resolve) => {
            try {
                const tileKey = `${position.row}-${position.col}`;
                const tileElement = this.currentTiles.get(tileKey);

                if (!tileElement) {
                    resolve();
                    return;
                }

                // 更新方块值和样式
                tileElement.textContent = value.toString();
                tileElement.className = `tile tile-${value}`;

                if (value > 2048) {
                    tileElement.classList.add('tile-super');
                }

                // 添加合并动画CSS类
                tileElement.classList.add('tile-merged');

                // 动画完成后清理CSS类
                setTimeout(() => {
                    tileElement.classList.remove('tile-merged');
                    resolve();
                }, 300);

            } catch (error) {
                console.error('合并动画失败:', error);
                resolve();
            }
        });
    }

    /**
     * 新方块出现动画
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} value - 方块值
     * @returns {Promise} 动画完成的Promise
     */
    animateNewTile(row, col, value) {
        return new Promise((resolve) => {
            try {
                const tileElement = this.createTileElement(row, col, value);

                // 添加新方块CSS类
                tileElement.classList.add('tile-new');

                this.tileContainer.appendChild(tileElement);

                // 更新方块映射
                const tileKey = `${row}-${col}`;
                this.currentTiles.set(tileKey, tileElement);

                // 动画完成后清理CSS类
                setTimeout(() => {
                    tileElement.classList.remove('tile-new');
                    resolve();
                }, 200);

            } catch (error) {
                console.error('新方块动画失败:', error);
                resolve();
            }
        });
    }

    /**
     * 清空所有方块
     */
    clearAllTiles() {
        try {
            this.tileContainer.innerHTML = '';
            this.currentTiles.clear();
        } catch (error) {
            console.error('清空方块失败:', error);
        }
    }

    /**
     * 获取方块元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @returns {HTMLElement|null} 方块元素
     */
    getTileElement(row, col) {
        const tileKey = `${row}-${col}`;
        return this.currentTiles.get(tileKey) || null;
    }

    /**
     * 设置渲染配置
     * @param {Object} newConfig - 新的配置
     */
    setConfig(newConfig) {
        try {
            if (newConfig.animationDuration && newConfig.animationDuration > 0) {
                this.config.animationDuration = newConfig.animationDuration;
            }

            if (newConfig.tileSize) {
                this.config.tileSize = newConfig.tileSize;
            }

            if (newConfig.tileGap && newConfig.tileGap >= 0) {
                this.config.tileGap = newConfig.tileGap;
            }

            console.log('渲染器配置已更新:', this.config);
        } catch (error) {
            console.error('设置渲染配置失败:', error);
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
     * 获取渲染器版本
     * @returns {string} 版本信息
     */
    getVersion() {
        return '1.0.0';
    }

    /**
     * 销毁渲染器，清理资源
     */
    destroy() {
        try {
            this.clearAllTiles();
            this.hideMessage();

            // 清理引用
            this.container = null;
            this.tileContainer = null;
            this.currentScoreElement = null;
            this.bestScoreElement = null;
            this.gameMessageElement = null;
            this.messageTextElement = null;

            console.log('GameRenderer 已销毁');
        } catch (error) {
            console.error('销毁渲染器失败:', error);
        }
    }
}
