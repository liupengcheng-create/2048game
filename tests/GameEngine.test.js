/**
 * GameEngine类的单元测试
 * 测试游戏引擎的核心功能
 */

// 简单的测试框架（复用）
class TestFramework {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    run() {
        console.log('🧪 开始运行GameEngine单元测试...\n');
        
        for (const test of this.tests) {
            try {
                test.testFunction();
                console.log(`✅ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 测试结果: ${this.passed} 通过, ${this.failed} 失败`);
        
        if (this.failed === 0) {
            console.log('🎉 所有测试通过！');
        } else {
            console.log('⚠️ 有测试失败，请检查代码。');
        }
    }

    assertEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}\n期望: ${JSON.stringify(expected)}\n实际: ${JSON.stringify(actual)}`);
        }
    }

    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(message || '期望条件为真');
        }
    }

    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(message || '期望条件为假');
        }
    }

    assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(message || '期望值不为null');
        }
    }
}

// 创建测试实例
const engineTest = new TestFramework();

// 测试GameEngine构造函数
engineTest.test('GameEngine构造函数 - 正常初始化', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    engineTest.assertNotNull(gameEngine);
    engineTest.assertEqual(gameEngine.getVersion(), '1.0.0');
});

engineTest.test('GameEngine构造函数 - 无效参数', () => {
    try {
        const gameEngine = new GameEngine(null);
        engineTest.assertTrue(false, '应该抛出错误');
    } catch (error) {
        engineTest.assertTrue(error.message.includes('GameEngine requires a valid GameState instance'));
    }
});

// 测试游戏初始化
engineTest.test('initGame - 正常初始化', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    gameEngine.initGame();
    
    engineTest.assertTrue(gameState.isGameStarted());
    engineTest.assertFalse(gameState.isGameOver());
    engineTest.assertFalse(gameState.hasWon());
    engineTest.assertEqual(gameState.getScore(), 0);
    
    // 应该有2个初始方块
    const emptyTiles = gameState.getEmptyTiles();
    engineTest.assertEqual(emptyTiles.length, 14); // 16 - 2 = 14
});

// 测试随机方块生成
engineTest.test('addRandomTile - 生成随机方块', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const result = gameEngine.addRandomTile();
    
    engineTest.assertTrue(result);
    
    // 检查是否有方块被生成
    const emptyTiles = gameState.getEmptyTiles();
    engineTest.assertEqual(emptyTiles.length, 15); // 16 - 1 = 15
    
    // 检查生成的值是否为2或4
    const grid = gameState.getGrid();
    let foundValue = false;
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] !== 0) {
                engineTest.assertTrue(grid[row][col] === 2 || grid[row][col] === 4);
                foundValue = true;
            }
        }
    }
    engineTest.assertTrue(foundValue);
});

engineTest.test('addRandomTile - 网格已满', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    // 填满网格
    const fullGrid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    gameState.setGrid(fullGrid);
    
    const result = gameEngine.addRandomTile();
    
    engineTest.assertFalse(result);
});

// 测试移动操作
engineTest.test('move - 有效移动', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    // 设置测试网格
    const testGrid = [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    gameState.setGameStarted(true);
    
    const result = gameEngine.move('left');
    
    engineTest.assertTrue(result);
    engineTest.assertEqual(gameState.getScore(), 4); // 2+2=4的合并分数
    engineTest.assertTrue(gameState.wasLastMoveValid());
});

engineTest.test('move - 无效移动', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    // 设置无法移动的网格
    const testGrid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    gameState.setGrid(testGrid);
    gameState.setGameStarted(true);
    
    const result = gameEngine.move('left');
    
    engineTest.assertFalse(result);
    engineTest.assertFalse(gameState.wasLastMoveValid());
});

engineTest.test('move - 无效方向', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    gameState.setGameStarted(true);
    
    const result = gameEngine.move('invalid');
    
    engineTest.assertFalse(result);
});

engineTest.test('move - 游戏已结束', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    gameState.setGameOver(true);
    
    const result = gameEngine.move('left');
    
    engineTest.assertFalse(result);
});

// 测试游戏状态检查
engineTest.test('checkGameStatus - 游戏继续', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const testGrid = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    
    const status = gameEngine.checkGameStatus();
    
    engineTest.assertEqual(status, 'continue');
    engineTest.assertFalse(gameState.isGameOver());
    engineTest.assertFalse(gameState.hasWon());
});

engineTest.test('checkGameStatus - 游戏获胜', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const testGrid = [
        [2048, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    
    const status = gameEngine.checkGameStatus();
    
    engineTest.assertEqual(status, 'won');
    engineTest.assertTrue(gameState.hasWon());
});

engineTest.test('checkGameStatus - 游戏结束', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    // 设置无法移动的满网格
    const testGrid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    gameState.setGrid(testGrid);
    
    const status = gameEngine.checkGameStatus();
    
    engineTest.assertEqual(status, 'game_over');
    engineTest.assertTrue(gameState.isGameOver());
});

// 测试canMove
engineTest.test('canMove - 可以移动', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const testGrid = [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    
    engineTest.assertTrue(gameEngine.canMove());
});

engineTest.test('canMove - 不能移动', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const testGrid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    gameState.setGrid(testGrid);
    
    engineTest.assertFalse(gameEngine.canMove());
});

// 测试游戏统计信息
engineTest.test('getGameStats - 获取统计信息', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    gameState.setScore(100);
    gameState.setBestScore(200);
    
    const testGrid = [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    
    const stats = gameEngine.getGameStats();
    
    engineTest.assertNotNull(stats);
    engineTest.assertEqual(stats.score, 100);
    engineTest.assertEqual(stats.bestScore, 200);
    engineTest.assertEqual(stats.maxTile, 4);
    engineTest.assertEqual(stats.emptyTiles, 14);
    engineTest.assertEqual(stats.totalTiles, 2);
});

// 测试可能的移动方向
engineTest.test('getPossibleMoves - 获取可能移动', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const testGrid = [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    
    const possibleMoves = gameEngine.getPossibleMoves();
    
    engineTest.assertTrue(possibleMoves.length > 0);
    engineTest.assertTrue(possibleMoves.includes('left'));
    engineTest.assertTrue(possibleMoves.includes('right'));
    engineTest.assertTrue(possibleMoves.includes('up'));
    engineTest.assertTrue(possibleMoves.includes('down'));
});

// 测试移动预览
engineTest.test('previewMove - 预览移动结果', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    const testGrid = [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameState.setGrid(testGrid);
    gameState.setScore(50);
    
    const preview = gameEngine.previewMove('left');
    
    engineTest.assertNotNull(preview);
    engineTest.assertEqual(preview.direction, 'left');
    engineTest.assertEqual(preview.score, 4);
    engineTest.assertEqual(preview.newScore, 54);
    engineTest.assertTrue(preview.moved);
    
    // 原网格不应该改变
    engineTest.assertEqual(gameState.getGrid(), testGrid);
    engineTest.assertEqual(gameState.getScore(), 50);
});

// 测试游戏状态验证
engineTest.test('validateGameState - 有效状态', () => {
    const gameState = new GameState();
    const gameEngine = new GameEngine(gameState);
    
    gameEngine.initGame();
    
    engineTest.assertTrue(gameEngine.validateGameState());
});

// 运行所有测试
engineTest.run();
