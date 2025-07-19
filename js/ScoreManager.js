/**
 * ScoreManager类 - 分数管理器
 * 负责分数计算、存储和管理
 *
 * 主要功能：
 * - 当前分数管理
 * - 最高分记录和更新
 * - 本地存储持久化
 * - 分数历史记录
 * - 统计信息计算
 */
class ScoreManager {
    /**
     * 构造函数
     */
    constructor() {
        // 分数数据
        this.currentScore = 0;
        this.bestScore = 0;
        this.sessionStartScore = 0;

        // 游戏统计
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.totalScore = 0;
        this.averageScore = 0;

        // 本地存储配置
        this.storageConfig = {
            keyPrefix: '2048_game_',
            keys: {
                bestScore: 'best_score',
                gamesPlayed: 'games_played',
                gamesWon: 'games_won',
                totalScore: 'total_score',
                gameHistory: 'game_history'
            }
        };

        // 游戏历史记录（最多保存最近100局）
        this.gameHistory = [];
        this.maxHistorySize = 100;

        // 初始化时从本地存储加载数据
        this.loadFromStorage();

        console.log('ScoreManager 初始化完成');
    }

    /**
     * 获取当前分数
     * @returns {number} 当前分数
     */
    getCurrentScore() {
        return this.currentScore;
    }

    /**
     * 设置当前分数
     * @param {number} score - 新的当前分数
     */
    setCurrentScore(score) {
        if (typeof score !== 'number' || score < 0) {
            throw new Error('Invalid score value');
        }

        this.currentScore = score;

        // 检查是否需要更新最高分
        if (score > this.bestScore) {
            this.updateBestScore(score);
        }
    }

    /**
     * 增加当前分数
     * @param {number} points - 要增加的分数
     * @returns {number} 增加后的总分数
     */
    addScore(points) {
        if (typeof points !== 'number' || points < 0) {
            throw new Error('Invalid points value');
        }

        this.currentScore += points;

        // 检查是否需要更新最高分
        if (this.currentScore > this.bestScore) {
            this.updateBestScore(this.currentScore);
        }

        return this.currentScore;
    }

    /**
     * 获取最高分
     * @returns {number} 最高分
     */
    getBestScore() {
        return this.bestScore;
    }

    /**
     * 更新最高分
     * @param {number} score - 新的分数
     */
    updateBestScore(score) {
        if (typeof score !== 'number' || score < 0) {
            throw new Error('Invalid best score value');
        }

        if (score > this.bestScore) {
            this.bestScore = score;
            console.log(`新的最高分: ${score}`);

            // 保存到本地存储
            this.saveBestScore();
        }
    }

    /**
     * 重置当前分数
     */
    resetCurrentScore() {
        this.currentScore = 0;
        this.sessionStartScore = 0;
    }

    /**
     * 开始新游戏
     */
    startNewGame() {
        this.sessionStartScore = this.currentScore;
        this.currentScore = 0;
        console.log('开始新游戏，分数重置为0');
    }

    /**
     * 结束当前游戏
     * @param {boolean} won - 是否获胜
     * @param {number} maxTile - 最大方块值
     */
    endGame(won = false, maxTile = 0) {
        try {
            // 更新游戏统计
            this.gamesPlayed++;
            this.totalScore += this.currentScore;

            if (won) {
                this.gamesWon++;
            }

            // 计算平均分
            this.averageScore = Math.round(this.totalScore / this.gamesPlayed);

            // 添加到游戏历史
            const gameRecord = {
                score: this.currentScore,
                won: won,
                maxTile: maxTile,
                date: new Date().toISOString(),
                duration: Date.now() - (this.gameStartTime || Date.now())
            };

            this.addGameRecord(gameRecord);

            // 保存统计数据
            this.saveStatistics();

            console.log(`游戏结束 - 分数: ${this.currentScore}, 获胜: ${won}, 最大方块: ${maxTile}`);

        } catch (error) {
            console.error('结束游戏时出错:', error);
        }
    }

    /**
     * 添加游戏记录到历史
     * @param {Object} gameRecord - 游戏记录
     */
    addGameRecord(gameRecord) {
        try {
            this.gameHistory.unshift(gameRecord);

            // 限制历史记录数量
            if (this.gameHistory.length > this.maxHistorySize) {
                this.gameHistory = this.gameHistory.slice(0, this.maxHistorySize);
            }

            // 保存历史记录
            this.saveGameHistory();

        } catch (error) {
            console.error('添加游戏记录失败:', error);
        }
    }

    /**
     * 获取游戏统计信息
     * @returns {Object} 统计信息对象
     */
    getStatistics() {
        return {
            currentScore: this.currentScore,
            bestScore: this.bestScore,
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            winRate: this.gamesPlayed > 0 ? Math.round((this.gamesWon / this.gamesPlayed) * 100) : 0,
            totalScore: this.totalScore,
            averageScore: this.averageScore,
            sessionScore: this.currentScore - this.sessionStartScore,
            historyCount: this.gameHistory.length
        };
    }

    /**
     * 获取游戏历史记录
     * @param {number} limit - 限制返回的记录数量
     * @returns {Array} 游戏历史记录数组
     */
    getGameHistory(limit = 10) {
        return this.gameHistory.slice(0, limit);
    }

    /**
     * 获取最高分游戏记录
     * @returns {Object|null} 最高分游戏记录
     */
    getBestGameRecord() {
        if (this.gameHistory.length === 0) {
            return null;
        }

        return this.gameHistory.reduce((best, current) => {
            return current.score > best.score ? current : best;
        });
    }

    /**
     * 保存到本地存储
     */
    saveToStorage() {
        try {
            this.saveBestScore();
            this.saveStatistics();
            this.saveGameHistory();
            console.log('数据已保存到本地存储');
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }

    /**
     * 保存最高分到本地存储
     */
    saveBestScore() {
        try {
            const key = this.storageConfig.keyPrefix + this.storageConfig.keys.bestScore;
            localStorage.setItem(key, this.bestScore.toString());
        } catch (error) {
            console.error('保存最高分失败:', error);
        }
    }

    /**
     * 保存统计数据到本地存储
     */
    saveStatistics() {
        try {
            const prefix = this.storageConfig.keyPrefix;
            const keys = this.storageConfig.keys;

            localStorage.setItem(prefix + keys.gamesPlayed, this.gamesPlayed.toString());
            localStorage.setItem(prefix + keys.gamesWon, this.gamesWon.toString());
            localStorage.setItem(prefix + keys.totalScore, this.totalScore.toString());
        } catch (error) {
            console.error('保存统计数据失败:', error);
        }
    }

    /**
     * 保存游戏历史到本地存储
     */
    saveGameHistory() {
        try {
            const key = this.storageConfig.keyPrefix + this.storageConfig.keys.gameHistory;
            localStorage.setItem(key, JSON.stringify(this.gameHistory));
        } catch (error) {
            console.error('保存游戏历史失败:', error);
        }
    }

    /**
     * 从本地存储加载数据
     */
    loadFromStorage() {
        try {
            this.loadBestScore();
            this.loadStatistics();
            this.loadGameHistory();
            console.log('数据已从本地存储加载');
        } catch (error) {
            console.error('从本地存储加载失败:', error);
        }
    }

    /**
     * 从本地存储加载最高分
     */
    loadBestScore() {
        try {
            const key = this.storageConfig.keyPrefix + this.storageConfig.keys.bestScore;
            const stored = localStorage.getItem(key);

            if (stored !== null) {
                const score = parseInt(stored, 10);
                if (!isNaN(score) && score >= 0) {
                    this.bestScore = score;
                }
            }
        } catch (error) {
            console.error('加载最高分失败:', error);
        }
    }

    /**
     * 从本地存储加载统计数据
     */
    loadStatistics() {
        try {
            const prefix = this.storageConfig.keyPrefix;
            const keys = this.storageConfig.keys;

            // 加载游戏次数
            const gamesPlayedStr = localStorage.getItem(prefix + keys.gamesPlayed);
            if (gamesPlayedStr !== null) {
                const gamesPlayed = parseInt(gamesPlayedStr, 10);
                if (!isNaN(gamesPlayed) && gamesPlayed >= 0) {
                    this.gamesPlayed = gamesPlayed;
                }
            }

            // 加载获胜次数
            const gamesWonStr = localStorage.getItem(prefix + keys.gamesWon);
            if (gamesWonStr !== null) {
                const gamesWon = parseInt(gamesWonStr, 10);
                if (!isNaN(gamesWon) && gamesWon >= 0) {
                    this.gamesWon = gamesWon;
                }
            }

            // 加载总分数
            const totalScoreStr = localStorage.getItem(prefix + keys.totalScore);
            if (totalScoreStr !== null) {
                const totalScore = parseInt(totalScoreStr, 10);
                if (!isNaN(totalScore) && totalScore >= 0) {
                    this.totalScore = totalScore;
                }
            }

            // 计算平均分
            if (this.gamesPlayed > 0) {
                this.averageScore = Math.round(this.totalScore / this.gamesPlayed);
            }

        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    /**
     * 从本地存储加载游戏历史
     */
    loadGameHistory() {
        try {
            const key = this.storageConfig.keyPrefix + this.storageConfig.keys.gameHistory;
            const stored = localStorage.getItem(key);

            if (stored !== null) {
                const history = JSON.parse(stored);
                if (Array.isArray(history)) {
                    this.gameHistory = history.slice(0, this.maxHistorySize);
                }
            }
        } catch (error) {
            console.error('加载游戏历史失败:', error);
        }
    }

    /**
     * 清除所有本地存储数据
     */
    clearStorage() {
        try {
            const prefix = this.storageConfig.keyPrefix;
            const keys = Object.values(this.storageConfig.keys);

            keys.forEach(key => {
                localStorage.removeItem(prefix + key);
            });

            // 重置内存中的数据
            this.bestScore = 0;
            this.gamesPlayed = 0;
            this.gamesWon = 0;
            this.totalScore = 0;
            this.averageScore = 0;
            this.gameHistory = [];

            console.log('本地存储数据已清除');
        } catch (error) {
            console.error('清除本地存储失败:', error);
        }
    }

    /**
     * 检查本地存储是否可用
     * @returns {boolean} 本地存储是否可用
     */
    isStorageAvailable() {
        try {
            const testKey = this.storageConfig.keyPrefix + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('本地存储不可用:', error);
            return false;
        }
    }

    /**
     * 导出数据为JSON字符串
     * @returns {string} JSON格式的数据
     */
    exportData() {
        try {
            const data = {
                bestScore: this.bestScore,
                gamesPlayed: this.gamesPlayed,
                gamesWon: this.gamesWon,
                totalScore: this.totalScore,
                gameHistory: this.gameHistory,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('导出数据失败:', error);
            return null;
        }
    }

    /**
     * 从JSON字符串导入数据
     * @param {string} jsonData - JSON格式的数据
     * @returns {boolean} 导入是否成功
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            // 验证数据格式
            if (typeof data.bestScore === 'number' && data.bestScore >= 0) {
                this.bestScore = data.bestScore;
            }

            if (typeof data.gamesPlayed === 'number' && data.gamesPlayed >= 0) {
                this.gamesPlayed = data.gamesPlayed;
            }

            if (typeof data.gamesWon === 'number' && data.gamesWon >= 0) {
                this.gamesWon = data.gamesWon;
            }

            if (typeof data.totalScore === 'number' && data.totalScore >= 0) {
                this.totalScore = data.totalScore;
            }

            if (Array.isArray(data.gameHistory)) {
                this.gameHistory = data.gameHistory.slice(0, this.maxHistorySize);
            }

            // 重新计算平均分
            if (this.gamesPlayed > 0) {
                this.averageScore = Math.round(this.totalScore / this.gamesPlayed);
            }

            // 保存到本地存储
            this.saveToStorage();

            console.log('数据导入成功');
            return true;

        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    /**
     * 获取版本信息
     * @returns {string} 版本信息
     */
    getVersion() {
        return '1.0.0';
    }

    /**
     * 销毁分数管理器
     */
    destroy() {
        try {
            // 保存当前数据
            this.saveToStorage();

            // 清理内存
            this.gameHistory = [];

            console.log('ScoreManager 已销毁');
        } catch (error) {
            console.error('销毁分数管理器失败:', error);
        }
    }
}
