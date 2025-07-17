/* eslint-disable no-console */
// Integration test that uses the actual useTreeData hook
import { useTreeData } from '../hooks/useTreeData';
import { TreeNode } from '../types';

// Test data
const testData = {
  'user': {
    'name': 'John Doe',
    'age': 30,
    'settings': {
      'theme': 'dark',
      'notifications': true
    }
  },
  'items': [1, 2, 3]
};

// Test case interface
interface TestCase {
  name: string;
  test: (hook: ReturnType<typeof useTreeData>) => Promise<boolean>;
  description: string;
}

// Helper function to find node by ID
const findNodeById = (root: TreeNode, id: string): TreeNode | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
};

// Test cases
const testCases: TestCase[] = [
  {
    name: 'Load JSON Data',
    description: 'Should load JSON data and create proper tree structure',
    test: async (hook) => {
      hook.loadJsonData(testData);
      return hook.treeData !== null &&
             hook.treeData.name === 'root' &&
             hook.treeData.children?.length === 2;
    }
  },

  {
    name: 'Toggle Node',
    description: 'Should toggle node expand/collapse state',
    test: async (hook) => {
      hook.loadJsonData(testData);
      const userNode = findNodeById(hook.treeData!, 'root.user');
      const initialExpanded = userNode?.expanded;

      hook.toggleNode('root.user');

      const userNodeAfterToggle = findNodeById(hook.treeData!, 'root.user');
      return userNodeAfterToggle?.expanded === !initialExpanded;
    }
  },

  {
    name: 'Add Node',
    description: 'Should add new node to tree',
    test: async (hook) => {
      hook.loadJsonData(testData);
      const initialChildrenCount = hook.treeData?.children?.length || 0;

      hook.addNode('root', {
        name: 'newField',
        value: 'newValue',
        type: 'string'
      });

      return hook.treeData?.children?.length === initialChildrenCount + 1;
    }
  },

  {
    name: 'Edit Node',
    description: 'Should edit existing node',
    test: async (hook) => {
      hook.loadJsonData(testData);

      hook.editNode('root.user.name', {
        value: 'Jane Doe'
      });

      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      return nameNode?.value === 'Jane Doe';
    }
  },

  {
    name: 'Delete Node',
    description: 'Should delete node from tree',
    test: async (hook) => {
      hook.loadJsonData(testData);

      hook.deleteNode('root.user.age');

      const ageNode = findNodeById(hook.treeData!, 'root.user.age');
      return ageNode === null;
    }
  },

  {
    name: 'Undo Toggle',
    description: 'Should undo toggle operation',
    test: async (hook) => {
      hook.loadJsonData(testData);
      const userNode = findNodeById(hook.treeData!, 'root.user');
      const initialExpanded = userNode?.expanded;

      hook.toggleNode('root.user');
      hook.undo();

      const userNodeAfterUndo = findNodeById(hook.treeData!, 'root.user');
      return userNodeAfterUndo?.expanded === initialExpanded;
    }
  },

  {
    name: 'Undo Add',
    description: 'Should undo add operation',
    test: async (hook) => {
      hook.loadJsonData(testData);
      const initialChildrenCount = hook.treeData?.children?.length || 0;

      hook.addNode('root', {
        name: 'newField',
        value: 'newValue',
        type: 'string'
      });

      hook.undo();

      return hook.treeData?.children?.length === initialChildrenCount;
    }
  },

  {
    name: 'Undo Edit',
    description: 'Should undo edit operation',
    test: async (hook) => {
      hook.loadJsonData(testData);
      const originalValue = findNodeById(hook.treeData!, 'root.user.name')?.value;

      hook.editNode('root.user.name', {
        value: 'Jane Doe'
      });

      hook.undo();

      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      return nameNode?.value === originalValue;
    }
  },

  {
    name: 'Undo Delete',
    description: 'Should undo delete operation',
    test: async (hook) => {
      hook.loadJsonData(testData);
      const originalAgeNode = findNodeById(hook.treeData!, 'root.user.age');

      hook.deleteNode('root.user.age');
      hook.undo();

      const restoredAgeNode = findNodeById(hook.treeData!, 'root.user.age');
      return restoredAgeNode !== null && restoredAgeNode.value === originalAgeNode?.value;
    }
  },

  {
    name: 'Redo Operation',
    description: 'Should redo after undo',
    test: async (hook) => {
      hook.loadJsonData(testData);

      hook.editNode('root.user.name', {
        value: 'Jane Doe'
      });

      hook.undo();
      hook.redo();

      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      return nameNode?.value === 'Jane Doe';
    }
  },

  {
    name: 'Can Undo/Redo Flags',
    description: 'Should properly track undo/redo availability',
    test: async (hook) => {
      hook.loadJsonData(testData);

      // Initially no undo/redo
      const initialState = !hook.canUndo && !hook.canRedo;

      // After operation, can undo but not redo
      hook.editNode('root.user.name', { value: 'Jane Doe' });
      const afterEdit = hook.canUndo && !hook.canRedo;

      // After undo, can redo but not undo
      hook.undo();
      const afterUndo = !hook.canUndo && hook.canRedo;

      // After redo, can undo but not redo
      hook.redo();
      const afterRedo = hook.canUndo && !hook.canRedo;

      return initialState && afterEdit && afterUndo && afterRedo;
    }
  },

  {
    name: 'Add Note',
    description: 'Should add note to node',
    test: async (hook) => {
      hook.loadJsonData(testData);

      hook.addNote('root.user.name', 'Test note');

      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      return nameNode?.note === 'Test note';
    }
  },

  {
    name: 'Undo Note',
    description: 'Should undo note operation',
    test: async (hook) => {
      hook.loadJsonData(testData);

      hook.addNote('root.user.name', 'Test note');
      hook.undo();

      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      return nameNode?.note === undefined;
    }
  },

  {
    name: 'Multiple Operations Sequence',
    description: 'Should handle multiple operations correctly',
    test: async (hook) => {
      hook.loadJsonData(testData);

      // Perform multiple operations
      hook.editNode('root.user.name', { value: 'Jane Doe' });
      hook.toggleNode('root.user.settings');
      hook.addNote('root.user.age', 'Age note');

      // Check they all worked
      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      const settingsNode = findNodeById(hook.treeData!, 'root.user.settings');
      const ageNode = findNodeById(hook.treeData!, 'root.user.age');

      return nameNode?.value === 'Jane Doe' &&
             settingsNode?.expanded === false &&
             ageNode?.note === 'Age note';
    }
  },

  {
    name: 'Multiple Operations Undo Sequence',
    description: 'Should undo multiple operations in reverse order',
    test: async (hook) => {
      hook.loadJsonData(testData);

      // Store original values
      const originalName = findNodeById(hook.treeData!, 'root.user.name')?.value;
      const originalExpanded = findNodeById(hook.treeData!, 'root.user.settings')?.expanded;

      // Perform operations
      hook.editNode('root.user.name', { value: 'Jane Doe' });
      hook.toggleNode('root.user.settings');
      hook.addNote('root.user.age', 'Age note');

      // Undo in reverse order
      hook.undo(); // Undo note
      hook.undo(); // Undo toggle
      hook.undo(); // Undo edit

      // Check they're all back to original
      const nameNode = findNodeById(hook.treeData!, 'root.user.name');
      const settingsNode = findNodeById(hook.treeData!, 'root.user.settings');
      const ageNode = findNodeById(hook.treeData!, 'root.user.age');

      return nameNode?.value === originalName &&
             settingsNode?.expanded === originalExpanded &&
             ageNode?.note === undefined;
    }
  }
];

// Test runner that works with actual React hook
export const runIntegrationTests = (hook: ReturnType<typeof useTreeData>) => {
  console.log('🧪 Running Integration Tests...\n');

  let passed = 0;
  let failed = 0;
  const failedTests: string[] = [];

  testCases.forEach(async (testCase, index) => {
    try {
      // Reset state for each test
      hook.loadJsonData({});

      const result = await testCase.test(hook);

      if (result) {
        console.log(`✅ PASS: ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${testCase.name}`);
        console.log(`   Description: ${testCase.description}`);
        failed++;
        failedTests.push(testCase.name);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${testCase.name}`);
      console.log(`   Error: ${error}`);
      failed++;
      failedTests.push(testCase.name);
    }
  });

  // Print summary
  setTimeout(() => {
    console.log('\n📊 Integration Test Summary:');
    console.log(`✅ Passed: ${passed}/${testCases.length}`);
    console.log(`❌ Failed: ${failed}/${testCases.length}`);
    console.log(`📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

    if (failedTests.length > 0) {
      console.log('\n🔍 Failed Tests:');
      failedTests.forEach(test => console.log(`   • ${test}`));
      console.log('\n💡 Recommendations:');
      console.log('   1. Check if undo/redo history is properly maintained');
      console.log('   2. Verify node operations are correctly applied');
      console.log('   3. Ensure tree structure is properly updated');
      console.log('   4. Check if parent-child relationships are maintained');
    }
  }, 100);

  return { passed, failed, total: testCases.length };
};

// Export test cases for reference
export { testCases };