/**
 * MoveProcessor类 - 移动和合并算法处理器
 * 负责处理方块的移动、滑动和合并逻辑
 *
 * 核心算法：
 * 1. 滑动处理：将所有非零元素向移动方向聚集
 * 2. 合并处理：相邻相同数值的方块合并
 * 3. 再次滑动：合并后可能产生新的空隙，需要再次滑动
 */
class MoveProcessor {
    /**
     * 向左移动网格
     * @param {number[][]} grid - 4x4游戏网格
     * @returns {{grid: number[][], score: number, moved: boolean}} 移动结果
     */
    static moveLeft(grid) {
        const result = {
            grid: grid.map(row => [...row]), // 深拷贝网格
            score: 0,
            moved: false
        };

        // 处理每一行
        for (let row = 0; row < 4; row++) {
            const processedLine = this.processLine(result.grid[row]);

            // 检查这一行是否发生了变化
            if (!this.arraysEqual(result.grid[row], processedLine.line)) {
                result.moved = true;
            }

            result.grid[row] = processedLine.line;
            result.score += processedLine.score;
        }

        return result;
    }

    /**
     * 向右移动网格
     * @param {number[][]} grid - 4x4游戏网格
     * @returns {{grid: number[][], score: number, moved: boolean}} 移动结果
     */
    static moveRight(grid) {
        const result = {
            grid: grid.map(row => [...row]), // 深拷贝网格
            score: 0,
            moved: false
        };

        // 处理每一行（反转后处理，再反转回来）
        for (let row = 0; row < 4; row++) {
            const reversedLine = [...result.grid[row]].reverse();
            const processedLine = this.processLine(reversedLine);
            const finalLine = processedLine.line.reverse();

            // 检查这一行是否发生了变化
            if (!this.arraysEqual(result.grid[row], finalLine)) {
                result.moved = true;
            }

            result.grid[row] = finalLine;
            result.score += processedLine.score;
        }

        return result;
    }

    /**
     * 向上移动网格
     * @param {number[][]} grid - 4x4游戏网格
     * @returns {{grid: number[][], score: number, moved: boolean}} 移动结果
     */
    static moveUp(grid) {
        const result = {
            grid: grid.map(row => [...row]), // 深拷贝网格
            score: 0,
            moved: false
        };

        // 处理每一列
        for (let col = 0; col < 4; col++) {
            // 提取列数据
            const column = [];
            for (let row = 0; row < 4; row++) {
                column.push(result.grid[row][col]);
            }

            const processedLine = this.processLine(column);

            // 检查这一列是否发生了变化
            if (!this.arraysEqual(column, processedLine.line)) {
                result.moved = true;
            }

            // 将处理后的列数据写回网格
            for (let row = 0; row < 4; row++) {
                result.grid[row][col] = processedLine.line[row];
            }

            result.score += processedLine.score;
        }

        return result;
    }

    /**
     * 向下移动网格
     * @param {number[][]} grid - 4x4游戏网格
     * @returns {{grid: number[][], score: number, moved: boolean}} 移动结果
     */
    static moveDown(grid) {
        const result = {
            grid: grid.map(row => [...row]), // 深拷贝网格
            score: 0,
            moved: false
        };

        // 处理每一列（反转后处理，再反转回来）
        for (let col = 0; col < 4; col++) {
            // 提取列数据并反转
            const column = [];
            for (let row = 3; row >= 0; row--) {
                column.push(result.grid[row][col]);
            }

            const processedLine = this.processLine(column);
            const finalColumn = processedLine.line.reverse();

            // 检查这一列是否发生了变化
            const originalColumn = [];
            for (let row = 0; row < 4; row++) {
                originalColumn.push(result.grid[row][col]);
            }

            if (!this.arraysEqual(originalColumn, finalColumn)) {
                result.moved = true;
            }

            // 将处理后的列数据写回网格
            for (let row = 0; row < 4; row++) {
                result.grid[row][col] = finalColumn[row];
            }

            result.score += processedLine.score;
        }

        return result;
    }

    /**
     * 处理单行/列的移动和合并逻辑
     * 这是核心算法，实现滑动和合并的完整逻辑
     * @param {number[]} line - 要处理的行或列数组
     * @returns {{line: number[], score: number}} 处理结果
     */
    static processLine(line) {
        // 1. 移除零值并向左聚集（滑动）
        const filtered = line.filter(val => val !== 0);

        // 2. 合并相同相邻元素
        const merged = [];
        let score = 0;
        let i = 0;

        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                // 找到相同的相邻元素，进行合并
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);
                score += mergedValue; // 合并获得的分数等于合并后的数值
                i += 2; // 跳过已合并的两个元素
            } else {
                // 没有相邻相同元素，直接添加
                merged.push(filtered[i]);
                i++;
            }
        }

        // 3. 用零填充到原长度（4个元素）
        while (merged.length < 4) {
            merged.push(0);
        }

        return {
            line: merged,
            score: score
        };
    }

    /**
     * 比较两个数组是否相等
     * @param {number[]} arr1 - 第一个数组
     * @param {number[]} arr2 - 第二个数组
     * @returns {boolean} 数组是否相等
     */
    static arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * 检查网格是否可以向指定方向移动
     * @param {number[][]} grid - 4x4游戏网格
     * @param {string} direction - 移动方向 ('left', 'right', 'up', 'down')
     * @returns {boolean} 是否可以移动
     */
    static canMove(grid, direction) {
        // 创建网格的深拷贝进行测试
        const testGrid = grid.map(row => [...row]);

        let result;
        switch (direction) {
            case 'left':
                result = this.moveLeft(testGrid);
                break;
            case 'right':
                result = this.moveRight(testGrid);
                break;
            case 'up':
                result = this.moveUp(testGrid);
                break;
            case 'down':
                result = this.moveDown(testGrid);
                break;
            default:
                return false;
        }

        return result.moved;
    }

    /**
     * 检查网格是否可以向任意方向移动
     * @param {number[][]} grid - 4x4游戏网格
     * @returns {boolean} 是否可以移动
     */
    static canMoveAnyDirection(grid) {
        return this.canMove(grid, 'left') ||
               this.canMove(grid, 'right') ||
               this.canMove(grid, 'up') ||
               this.canMove(grid, 'down');
    }

    /**
     * 获取网格中的最大值
     * @param {number[][]} grid - 4x4游戏网格
     * @returns {number} 网格中的最大值
     */
    static getMaxValue(grid) {
        let maxValue = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] > maxValue) {
                    maxValue = grid[row][col];
                }
            }
        }
        return maxValue;
    }

    /**
     * 检查网格中是否包含指定值
     * @param {number[][]} grid - 4x4游戏网格
     * @param {number} value - 要查找的值
     * @returns {boolean} 是否包含指定值
     */
    static hasValue(grid, value) {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col] === value) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 验证网格格式是否正确
     * @param {number[][]} grid - 要验证的网格
     * @returns {boolean} 网格是否有效
     */
    static isValidGrid(grid) {
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
     * 打印网格到控制台（用于调试）
     * @param {number[][]} grid - 要打印的网格
     * @param {string} title - 标题
     */
    static printGrid(grid, title = 'Grid') {
        console.log(`\n${title}:`);
        for (let row = 0; row < 4; row++) {
            console.log(grid[row].map(val => val.toString().padStart(4)).join(' '));
        }
        console.log('');
    }
}
