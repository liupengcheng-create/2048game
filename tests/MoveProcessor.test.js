/**
 * MoveProcessor类的单元测试
 * 测试移动和合并算法的正确性
 */

// 简单的测试框架
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
        console.log('🧪 开始运行MoveProcessor单元测试...\n');
        
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
}

// 创建测试实例
const test = new TestFramework();

// 测试processLine函数
test.test('processLine - 基本滑动', () => {
    const result = MoveProcessor.processLine([2, 0, 2, 0]);
    test.assertEqual(result.line, [4, 0, 0, 0]);
    test.assertEqual(result.score, 4);
});

test.test('processLine - 无合并滑动', () => {
    const result = MoveProcessor.processLine([2, 0, 4, 0]);
    test.assertEqual(result.line, [2, 4, 0, 0]);
    test.assertEqual(result.score, 0);
});

test.test('processLine - 多重合并', () => {
    const result = MoveProcessor.processLine([2, 2, 4, 4]);
    test.assertEqual(result.line, [4, 8, 0, 0]);
    test.assertEqual(result.score, 12); // 4 + 8 = 12
});

test.test('processLine - 连续相同数字', () => {
    const result = MoveProcessor.processLine([2, 2, 2, 2]);
    test.assertEqual(result.line, [4, 4, 0, 0]);
    test.assertEqual(result.score, 8); // 4 + 4 = 8
});

test.test('processLine - 空行', () => {
    const result = MoveProcessor.processLine([0, 0, 0, 0]);
    test.assertEqual(result.line, [0, 0, 0, 0]);
    test.assertEqual(result.score, 0);
});

test.test('processLine - 已满行无合并', () => {
    const result = MoveProcessor.processLine([2, 4, 8, 16]);
    test.assertEqual(result.line, [2, 4, 8, 16]);
    test.assertEqual(result.score, 0);
});

// 测试向左移动
test.test('moveLeft - 基本移动', () => {
    const grid = [
        [2, 0, 2, 0],
        [0, 4, 0, 4],
        [8, 0, 0, 8],
        [0, 0, 0, 0]
    ];
    
    const result = MoveProcessor.moveLeft(grid);
    
    const expectedGrid = [
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [16, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    test.assertEqual(result.grid, expectedGrid);
    test.assertEqual(result.score, 28); // 4 + 8 + 16 = 28
    test.assertTrue(result.moved);
});

test.test('moveLeft - 无移动', () => {
    const grid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    
    const result = MoveProcessor.moveLeft(grid);
    
    test.assertEqual(result.grid, grid);
    test.assertEqual(result.score, 0);
    test.assertFalse(result.moved);
});

// 测试向右移动
test.test('moveRight - 基本移动', () => {
    const grid = [
        [2, 0, 2, 0],
        [0, 4, 0, 4],
        [8, 0, 0, 8],
        [0, 0, 0, 0]
    ];
    
    const result = MoveProcessor.moveRight(grid);
    
    const expectedGrid = [
        [0, 0, 0, 4],
        [0, 0, 0, 8],
        [0, 0, 0, 16],
        [0, 0, 0, 0]
    ];
    
    test.assertEqual(result.grid, expectedGrid);
    test.assertEqual(result.score, 28); // 4 + 8 + 16 = 28
    test.assertTrue(result.moved);
});

// 测试向上移动
test.test('moveUp - 基本移动', () => {
    const grid = [
        [2, 0, 8, 0],
        [0, 4, 0, 0],
        [2, 0, 8, 0],
        [0, 4, 0, 0]
    ];
    
    const result = MoveProcessor.moveUp(grid);
    
    const expectedGrid = [
        [4, 8, 16, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    test.assertEqual(result.grid, expectedGrid);
    test.assertEqual(result.score, 28); // 4 + 8 + 16 = 28
    test.assertTrue(result.moved);
});

// 测试向下移动
test.test('moveDown - 基本移动', () => {
    const grid = [
        [2, 0, 8, 0],
        [0, 4, 0, 0],
        [2, 0, 8, 0],
        [0, 4, 0, 0]
    ];
    
    const result = MoveProcessor.moveDown(grid);
    
    const expectedGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [4, 8, 16, 0]
    ];
    
    test.assertEqual(result.grid, expectedGrid);
    test.assertEqual(result.score, 28); // 4 + 8 + 16 = 28
    test.assertTrue(result.moved);
});

// 测试canMove函数
test.test('canMove - 可以移动', () => {
    const grid = [
        [2, 0, 2, 0],
        [0, 4, 0, 4],
        [8, 0, 0, 8],
        [0, 0, 0, 0]
    ];
    
    test.assertTrue(MoveProcessor.canMove(grid, 'left'));
    test.assertTrue(MoveProcessor.canMove(grid, 'right'));
    test.assertTrue(MoveProcessor.canMove(grid, 'up'));
    test.assertTrue(MoveProcessor.canMove(grid, 'down'));
});

test.test('canMove - 不能移动', () => {
    const grid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    
    test.assertFalse(MoveProcessor.canMove(grid, 'left'));
    test.assertFalse(MoveProcessor.canMove(grid, 'right'));
    test.assertFalse(MoveProcessor.canMove(grid, 'up'));
    test.assertFalse(MoveProcessor.canMove(grid, 'down'));
});

// 测试canMoveAnyDirection函数
test.test('canMoveAnyDirection - 可以移动', () => {
    const grid = [
        [2, 0, 2, 0],
        [0, 4, 0, 4],
        [8, 0, 0, 8],
        [0, 0, 0, 0]
    ];
    
    test.assertTrue(MoveProcessor.canMoveAnyDirection(grid));
});

test.test('canMoveAnyDirection - 不能移动', () => {
    const grid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    
    test.assertFalse(MoveProcessor.canMoveAnyDirection(grid));
});

// 测试getMaxValue函数
test.test('getMaxValue - 获取最大值', () => {
    const grid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    
    test.assertEqual(MoveProcessor.getMaxValue(grid), 65536);
});

// 测试hasValue函数
test.test('hasValue - 包含指定值', () => {
    const grid = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [8192, 16384, 32768, 65536]
    ];
    
    test.assertTrue(MoveProcessor.hasValue(grid, 2048));
    test.assertFalse(MoveProcessor.hasValue(grid, 131072));
});

// 测试isValidGrid函数
test.test('isValidGrid - 有效网格', () => {
    const validGrid = [
        [0, 2, 4, 8],
        [16, 32, 64, 128],
        [256, 512, 1024, 2048],
        [0, 0, 0, 0]
    ];
    
    test.assertTrue(MoveProcessor.isValidGrid(validGrid));
});

test.test('isValidGrid - 无效网格', () => {
    const invalidGrid1 = [
        [0, 2, 4],  // 只有3列
        [16, 32, 64, 128],
        [256, 512, 1024, 2048],
        [0, 0, 0, 0]
    ];
    
    const invalidGrid2 = [
        [0, 2, 4, 3],  // 3不是2的幂次
        [16, 32, 64, 128],
        [256, 512, 1024, 2048],
        [0, 0, 0, 0]
    ];
    
    test.assertFalse(MoveProcessor.isValidGrid(invalidGrid1));
    test.assertFalse(MoveProcessor.isValidGrid(invalidGrid2));
});

// 运行所有测试
test.run();
