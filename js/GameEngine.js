/**
 * GameEngine类 - 游戏引擎
 * 负责游戏的核心逻辑控制和规则管理
 *
 * 主要功能：
 * - 游戏初始化和重置
 * - 移动操作处理
 * - 随机方块生成
 * - 游戏状态检查（胜利/失败）
 * - 游戏规则验证
 */
class GameEngine {
    /**
     * 构造函数
     * @param {GameState} gameState - 游戏状态实例
     * @param {ScoreManager} scoreManager - 分数管理器实例（可选）
     */
    constructor(gameState, scoreManager = null) {
        if (!gameState || !(gameState instanceof GameState)) {
            throw new Error('GameEngine requires a valid GameState instance');
        }

        this.gameState = gameState;
        this.scoreManager = scoreManager || new ScoreManager();

        // 游戏配置
        this.config = {
            // 新方块生成概率：90%生成2，10%生成4
            newTileProbability: {
                2: 0.9,
                4: 0.1
            },
            // 胜利条件：达到2048
            winCondition: 2048,
            // 初始方块数量
            initialTileCount: 2
        };

        console.log('GameEngine 初始化完成');
    }

    /**
     * 初始化游戏
     * 重置游戏状态并生成初始方块
     */
    initGame() {
        try {
            console.log('开始初始化游戏...');

            // 重置游戏状态
            this.gameState.reset();

            // 从分数管理器加载最高分
            this.gameState.setBestScore(this.scoreManager.getBestScore());

            // 开始新游戏
            this.scoreManager.startNewGame();

            // 生成初始方块
            for (let i = 0; i < this.config.initialTileCount; i++) {
                this.addRandomTile();
            }

            // 标记游戏已开始
            this.gameState.setGameStarted(true);

            console.log('游戏初始化完成');
            console.log('初始网格状态:');
            MoveProcessor.printGrid(this.gameState.getGrid());

        } catch (error) {
            console.error('游戏初始化失败:', error);
            throw error;
        }
    }

    /**
     * 执行移动操作
     * @param {string} direction - 移动方向 ('up', 'down', 'left', 'right')
     * @returns {boolean} 移动是否成功
     */
    move(direction) {
        try {
            // 验证输入
            if (!['up', 'down', 'left', 'right'].includes(direction)) {
                console.warn(`无效的移动方向: ${direction}`);
                return false;
            }

            // 检查游戏是否已结束
            if (this.gameState.isGameOver()) {
                console.warn('游戏已结束，无法移动');
                return false;
            }

            // 获取当前网格
            const currentGrid = this.gameState.getGrid();

            // 执行移动
            let moveResult;
            switch (direction) {
                case 'left':
                    moveResult = MoveProcessor.moveLeft(currentGrid);
                    break;
                case 'right':
                    moveResult = MoveProcessor.moveRight(currentGrid);
                    break;
                case 'up':
                    moveResult = MoveProcessor.moveUp(currentGrid);
                    break;
                case 'down':
                    moveResult = MoveProcessor.moveDown(currentGrid);
                    break;
            }

            // 检查移动是否有效
            if (!moveResult.moved) {
                console.log(`向${direction}移动无效`);
                this.gameState.setLastMoveValid(false);
                return false;
            }

            // 更新游戏状态
            this.gameState.setGrid(moveResult.grid);
            this.gameState.addScore(moveResult.score);
            this.gameState.setLastMoveValid(true);

            // 更新分数管理器
            this.scoreManager.addScore(moveResult.score);
            this.scoreManager.setCurrentScore(this.gameState.getScore());

            console.log(`向${direction}移动成功，获得${moveResult.score}分`);

            // 生成新方块
            this.addRandomTile();

            // 检查游戏状态
            this.checkGameStatus();

            return true;

        } catch (error) {
            console.error(`移动操作失败 (${direction}):`, error);
            return false;
        }
    }

    /**
     * 检查是否可以移动
     * @returns {boolean} 是否可以移动
     */
    canMove() {
        try {
            const grid = this.gameState.getGrid();
            return MoveProcessor.canMoveAnyDirection(grid);
        } catch (error) {
            console.error('检查移动能力失败:', error);
            return false;
        }
    }

    /**
     * 添加随机方块
     * 在空位中随机生成2或4
     */
    addRandomTile() {
        try {
            // 获取所有空位
            const emptyTiles = this.gameState.getEmptyTiles();

            if (emptyTiles.length === 0) {
                console.log('没有空位，无法生成新方块');
                return false;
            }

            // 随机选择一个空位
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            const selectedTile = emptyTiles[randomIndex];

            // 根据概率生成2或4
            const randomValue = Math.random();
            const newValue = randomValue < this.config.newTileProbability[2] ? 2 : 4;

            // 设置新方块
            this.gameState.setTileValue(selectedTile.row, selectedTile.col, newValue);

            console.log(`在位置(${selectedTile.row}, ${selectedTile.col})生成新方块: ${newValue}`);
            return true;

        } catch (error) {
            console.error('生成随机方块失败:', error);
            return false;
        }
    }

    /**
     * 检查游戏状态
     * 检查胜利条件和失败条件
     */
    checkGameStatus() {
        try {
            const grid = this.gameState.getGrid();

            // 检查胜利条件（达到2048且之前未获胜）
            if (!this.gameState.hasWon() && MoveProcessor.hasValue(grid, this.config.winCondition)) {
                this.gameState.setWon(true);
                console.log(`🎉 恭喜！达到${this.config.winCondition}，游戏获胜！`);

                // 记录游戏胜利
                const maxTile = MoveProcessor.getMaxValue(grid);
                this.scoreManager.endGame(true, maxTile);

                return 'won';
            }

            // 检查失败条件（网格满且无法移动）
            if (this.gameState.isGridFull() && !this.canMove()) {
                this.gameState.setGameOver(true);
                console.log('💀 游戏结束！网格已满且无法移动。');

                // 记录游戏失败
                const maxTile = MoveProcessor.getMaxValue(grid);
                this.scoreManager.endGame(false, maxTile);

                return 'game_over';
            }

            // 游戏继续
            return 'continue';

        } catch (error) {
            console.error('检查游戏状态失败:', error);
            return 'error';
        }
    }

    /**
     * 重新开始游戏
     */
    restart() {
        try {
            console.log('重新开始游戏...');
            this.initGame();
        } catch (error) {
            console.error('重新开始游戏失败:', error);
            throw error;
        }
    }

    /**
     * 获取游戏统计信息
     * @returns {Object} 游戏统计信息
     */
    getGameStats() {
        try {
            const grid = this.gameState.getGrid();

            return {
                score: this.gameState.getScore(),
                bestScore: this.gameState.getBestScore(),
                maxTile: MoveProcessor.getMaxValue(grid),
                emptyTiles: this.gameState.getEmptyTiles().length,
                totalTiles: 16 - this.gameState.getEmptyTiles().length,
                gameStarted: this.gameState.isGameStarted(),
                gameOver: this.gameState.isGameOver(),
                won: this.gameState.hasWon(),
                canMove: this.canMove()
            };
        } catch (error) {
            console.error('获取游戏统计信息失败:', error);
            return null;
        }
    }

    /**
     * 获取可能的移动方向
     * @returns {string[]} 可移动的方向数组
     */
    getPossibleMoves() {
        try {
            const grid = this.gameState.getGrid();
            const possibleMoves = [];

            const directions = ['left', 'right', 'up', 'down'];

            for (const direction of directions) {
                if (MoveProcessor.canMove(grid, direction)) {
                    possibleMoves.push(direction);
                }
            }

            return possibleMoves;
        } catch (error) {
            console.error('获取可能移动方向失败:', error);
            return [];
        }
    }

    /**
     * 预览移动结果（不实际执行移动）
     * @param {string} direction - 移动方向
     * @returns {Object|null} 移动预览结果
     */
    previewMove(direction) {
        try {
            if (!['up', 'down', 'left', 'right'].includes(direction)) {
                return null;
            }

            const currentGrid = this.gameState.getGrid();

            let moveResult;
            switch (direction) {
                case 'left':
                    moveResult = MoveProcessor.moveLeft(currentGrid);
                    break;
                case 'right':
                    moveResult = MoveProcessor.moveRight(currentGrid);
                    break;
                case 'up':
                    moveResult = MoveProcessor.moveUp(currentGrid);
                    break;
                case 'down':
                    moveResult = MoveProcessor.moveDown(currentGrid);
                    break;
            }

            return {
                direction: direction,
                grid: moveResult.grid,
                score: moveResult.score,
                moved: moveResult.moved,
                newScore: this.gameState.getScore() + moveResult.score
            };

        } catch (error) {
            console.error(`预览移动失败 (${direction}):`, error);
            return null;
        }
    }

    /**
     * 验证游戏状态的完整性
     * @returns {boolean} 游戏状态是否有效
     */
    validateGameState() {
        try {
            const grid = this.gameState.getGrid();

            // 验证网格格式
            if (!MoveProcessor.isValidGrid(grid)) {
                console.error('游戏网格格式无效');
                this.reportValidationError('invalid_grid', { grid });
                return false;
            }

            // 验证分数
            if (this.gameState.getScore() < 0) {
                console.error('游戏分数无效');
                this.reportValidationError('invalid_score', { score: this.gameState.getScore() });
                return false;
            }

            // 验证最高分
            if (this.gameState.getBestScore() < 0) {
                console.error('最高分无效');
                this.reportValidationError('invalid_best_score', { bestScore: this.gameState.getBestScore() });
                return false;
            }

            // 验证游戏状态逻辑
            if (this.gameState.isGameOver() && this.canMove()) {
                console.error('游戏状态逻辑错误：标记为结束但仍可移动');
                this.reportValidationError('logic_error', {
                    gameOver: this.gameState.isGameOver(),
                    canMove: this.canMove()
                });
                return false;
            }

            // 验证方块值的合理性
            const maxValue = MoveProcessor.getMaxValue(grid);
            if (maxValue > 131072) { // 2^17，超出合理范围
                console.warn('检测到异常大的方块值:', maxValue);
                this.reportValidationError('suspicious_tile_value', { maxValue });
            }

            // 验证空位数量的合理性
            const emptyTiles = this.gameState.getEmptyTiles();
            if (emptyTiles.length < 0 || emptyTiles.length > 16) {
                console.error('空位数量异常:', emptyTiles.length);
                this.reportValidationError('invalid_empty_count', { emptyCount: emptyTiles.length });
                return false;
            }

            return true;

        } catch (error) {
            console.error('验证游戏状态失败:', error);
            this.reportValidationError('validation_exception', { error: error.message });
            return false;
        }
    }

    /**
     * 报告验证错误
     * @param {string} errorType - 错误类型
     * @param {Object} details - 错误详情
     */
    reportValidationError(errorType, details) {
        const errorReport = {
            type: errorType,
            details: details,
            timestamp: new Date().toISOString(),
            gameState: {
                score: this.gameState.getScore(),
                bestScore: this.gameState.getBestScore(),
                gameStarted: this.gameState.isGameStarted(),
                gameOver: this.gameState.isGameOver(),
                won: this.gameState.hasWon()
            }
        };

        console.warn('游戏状态验证错误:', errorReport);

        // 尝试自动修复某些错误
        this.attemptAutoFix(errorType, details);
    }

    /**
     * 尝试自动修复游戏状态错误
     * @param {string} errorType - 错误类型
     * @param {Object} details - 错误详情
     */
    attemptAutoFix(errorType, details) {
        try {
            switch (errorType) {
                case 'invalid_score':
                    console.log('尝试修复无效分数...');
                    this.gameState.setScore(Math.max(0, details.score || 0));
                    break;

                case 'invalid_best_score':
                    console.log('尝试修复无效最高分...');
                    this.gameState.setBestScore(Math.max(0, details.bestScore || 0));
                    break;

                case 'logic_error':
                    console.log('尝试修复逻辑错误...');
                    if (this.canMove()) {
                        this.gameState.setGameOver(false);
                    }
                    break;

                case 'invalid_grid':
                    console.log('尝试修复无效网格...');
                    this.gameState.reset();
                    this.initGame();
                    break;

                default:
                    console.log('无法自动修复错误类型:', errorType);
            }
        } catch (fixError) {
            console.error('自动修复失败:', fixError);
        }
    }

    /**
     * 打印当前游戏状态到控制台（调试用）
     */
    printGameState() {
        try {
            console.log('\n=== 游戏状态 ===');
            console.log(`分数: ${this.gameState.getScore()}`);
            console.log(`最高分: ${this.gameState.getBestScore()}`);
            console.log(`游戏开始: ${this.gameState.isGameStarted()}`);
            console.log(`游戏结束: ${this.gameState.isGameOver()}`);
            console.log(`已获胜: ${this.gameState.hasWon()}`);
            console.log(`可移动: ${this.canMove()}`);
            console.log(`空位数量: ${this.gameState.getEmptyTiles().length}`);

            MoveProcessor.printGrid(this.gameState.getGrid(), '当前网格');

            const possibleMoves = this.getPossibleMoves();
            console.log(`可能的移动: ${possibleMoves.join(', ')}`);
            console.log('================\n');
        } catch (error) {
            console.error('打印游戏状态失败:', error);
        }
    }
}
