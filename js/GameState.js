/**
 * GameState类 - 游戏状态管理
 * 负责管理4x4游戏网格和所有游戏状态数据
 */
class GameState {
    /**
     * 构造函数 - 初始化游戏状态
     */
    constructor() {
        // 初始化4x4游戏网格，0表示空位
        this.grid = this.createEmptyGrid();
        
        // 当前分数
        this.score = 0;
        
        // 历史最高分
        this.bestScore = 0;
        
        // 游戏是否结束
        this.gameOver = false;
        
        // 是否已经获胜（达到2048）
        this.won = false;
        
        // 获胜后是否可以继续游戏
        this.canContinue = true;
        
        // 游戏是否已经开始
        this.gameStarted = false;
        
        // 上一次移动是否有效（用于判断是否需要生成新方块）
        this.lastMoveValid = false;
    }

    /**
     * 创建空的4x4网格
     * @returns {number[][]} 4x4的二维数组，所有值为0
     */
    createEmptyGrid() {
        const grid = [];
        for (let row = 0; row < 4; row++) {
            grid[row] = [];
            for (let col = 0; col < 4; col++) {
                grid[row][col] = 0;
            }
        }
        return grid;
    }

    /**
     * 获取当前游戏网格
     * @returns {number[][]} 当前的4x4游戏网格
     */
    getGrid() {
        return this.grid;
    }

    /**
     * 设置游戏网格
     * @param {number[][]} grid - 新的4x4游戏网格
     */
    setGrid(grid) {
        // 验证网格格式
        if (!this.isValidGrid(grid)) {
            throw new Error('Invalid grid format');
        }
        this.grid = grid;
    }

    /**
     * 验证网格格式是否正确
     * @param {number[][]} grid - 要验证的网格
     * @returns {boolean} 网格是否有效
     */
    isValidGrid(grid) {
        // 检查是否为4x4数组
        if (!Array.isArray(grid) || grid.length !== 4) {
            return false;
        }
        
        for (let row = 0; row < 4; row++) {
            if (!Array.isArray(grid[row]) || grid[row].length !== 4) {
                return false;
            }
            
            // 检查每个值是否为有效数字
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                if (!Number.isInteger(value) || value < 0) {
                    return false;
                }
                
                // 检查是否为2的幂次（除了0）
                if (value !== 0 && (value & (value - 1)) !== 0) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 获取当前分数
     * @returns {number} 当前分数
     */
    getScore() {
        return this.score;
    }

    /**
     * 增加分数
     * @param {number} points - 要增加的分数
     */
    addScore(points) {
        if (typeof points !== 'number' || points < 0) {
            throw new Error('Invalid score points');
        }
        this.score += points;
    }

    /**
     * 设置分数
     * @param {number} score - 新的分数
     */
    setScore(score) {
        if (typeof score !== 'number' || score < 0) {
            throw new Error('Invalid score value');
        }
        this.score = score;
    }

    /**
     * 获取最高分
     * @returns {number} 历史最高分
     */
    getBestScore() {
        return this.bestScore;
    }

    /**
     * 设置最高分
     * @param {number} bestScore - 新的最高分
     */
    setBestScore(bestScore) {
        if (typeof bestScore !== 'number' || bestScore < 0) {
            throw new Error('Invalid best score value');
        }
        this.bestScore = bestScore;
    }

    /**
     * 检查游戏是否结束
     * @returns {boolean} 游戏是否结束
     */
    isGameOver() {
        return this.gameOver;
    }

    /**
     * 设置游戏结束状态
     * @param {boolean} gameOver - 游戏是否结束
     */
    setGameOver(gameOver) {
        this.gameOver = Boolean(gameOver);
    }

    /**
     * 检查是否已经获胜（达到2048）
     * @returns {boolean} 是否已经获胜
     */
    hasWon() {
        return this.won;
    }

    /**
     * 设置获胜状态
     * @param {boolean} won - 是否已经获胜
     */
    setWon(won) {
        this.won = Boolean(won);
    }

    /**
     * 检查获胜后是否可以继续游戏
     * @returns {boolean} 是否可以继续游戏
     */
    canContinueGame() {
        return this.canContinue;
    }

    /**
     * 设置是否可以继续游戏
     * @param {boolean} canContinue - 是否可以继续游戏
     */
    setCanContinue(canContinue) {
        this.canContinue = Boolean(canContinue);
    }

    /**
     * 检查游戏是否已经开始
     * @returns {boolean} 游戏是否已经开始
     */
    isGameStarted() {
        return this.gameStarted;
    }

    /**
     * 设置游戏开始状态
     * @param {boolean} started - 游戏是否已经开始
     */
    setGameStarted(started) {
        this.gameStarted = Boolean(started);
    }

    /**
     * 获取上一次移动是否有效
     * @returns {boolean} 上一次移动是否有效
     */
    wasLastMoveValid() {
        return this.lastMoveValid;
    }

    /**
     * 设置上一次移动的有效性
     * @param {boolean} valid - 上一次移动是否有效
     */
    setLastMoveValid(valid) {
        this.lastMoveValid = Boolean(valid);
    }

    /**
     * 重置游戏状态到初始状态
     */
    reset() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.canContinue = true;
        this.gameStarted = false;
        this.lastMoveValid = false;
        // 注意：不重置bestScore，保持历史最高分
    }

    /**
     * 获取网格中指定位置的值
     * @param {number} row - 行索引（0-3）
     * @param {number} col - 列索引（0-3）
     * @returns {number} 指定位置的值
     */
    getTileValue(row, col) {
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            throw new Error('Invalid grid position');
        }
        return this.grid[row][col];
    }

    /**
     * 设置网格中指定位置的值
     * @param {number} row - 行索引（0-3）
     * @param {number} col - 列索引（0-3）
     * @param {number} value - 要设置的值
     */
    setTileValue(row, col, value) {
        if (row < 0 || row >= 4 || col < 0 || col >= 4) {
            throw new Error('Invalid grid position');
        }
        if (typeof value !== 'number' || value < 0) {
            throw new Error('Invalid tile value');
        }
        this.grid[row][col] = value;
    }

    /**
     * 获取所有空位的坐标
     * @returns {Array<{row: number, col: number}>} 空位坐标数组
     */
    getEmptyTiles() {
        const emptyTiles = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 0) {
                    emptyTiles.push({ row, col });
                }
            }
        }
        return emptyTiles;
    }

    /**
     * 检查网格是否已满
     * @returns {boolean} 网格是否已满
     */
    isGridFull() {
        return this.getEmptyTiles().length === 0;
    }

    /**
     * 深拷贝当前游戏状态
     * @returns {GameState} 游戏状态的深拷贝
     */
    clone() {
        const cloned = new GameState();
        cloned.setGrid(this.grid.map(row => [...row]));
        cloned.setScore(this.score);
        cloned.setBestScore(this.bestScore);
        cloned.setGameOver(this.gameOver);
        cloned.setWon(this.won);
        cloned.setCanContinue(this.canContinue);
        cloned.setGameStarted(this.gameStarted);
        cloned.setLastMoveValid(this.lastMoveValid);
        return cloned;
    }

    /**
     * 将游戏状态序列化为JSON字符串
     * @returns {string} 序列化后的JSON字符串
     */
    serialize() {
        return JSON.stringify({
            grid: this.grid,
            score: this.score,
            bestScore: this.bestScore,
            gameOver: this.gameOver,
            won: this.won,
            canContinue: this.canContinue,
            gameStarted: this.gameStarted,
            lastMoveValid: this.lastMoveValid
        });
    }

    /**
     * 从JSON字符串反序列化游戏状态
     * @param {string} jsonString - 序列化的JSON字符串
     */
    deserialize(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.grid && this.isValidGrid(data.grid)) {
                this.setGrid(data.grid);
            }
            
            if (typeof data.score === 'number' && data.score >= 0) {
                this.setScore(data.score);
            }
            
            if (typeof data.bestScore === 'number' && data.bestScore >= 0) {
                this.setBestScore(data.bestScore);
            }
            
            if (typeof data.gameOver === 'boolean') {
                this.setGameOver(data.gameOver);
            }
            
            if (typeof data.won === 'boolean') {
                this.setWon(data.won);
            }
            
            if (typeof data.canContinue === 'boolean') {
                this.setCanContinue(data.canContinue);
            }
            
            if (typeof data.gameStarted === 'boolean') {
                this.setGameStarted(data.gameStarted);
            }
            
            if (typeof data.lastMoveValid === 'boolean') {
                this.setLastMoveValid(data.lastMoveValid);
            }
        } catch (error) {
            throw new Error('Failed to deserialize game state: ' + error.message);
        }
    }
}
