/* eslint-disable no-console */
// Manual test runner for browser testing
import { parseJsonToTree } from './jsonParser';
import { TreeNode, NodeAction } from '../types';

// Test data
const testJsonData = {
  'name': 'John Doe',
  'age': 30,
  'address': {
    'street': '123 Main St',
    'city': 'New York',
    'zipcode': '10001'
  },
  'hobbies': ['reading', 'swimming', 'coding'],
  'isActive': true,
  'spouse': null
};

// Test results tracker
interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private treeData: TreeNode | null = null;
  private history: NodeAction[] = [];
  private historyIndex = -1;

  constructor() {
    this.loadTestData();
  }

  private loadTestData() {
    this.treeData = parseJsonToTree(testJsonData);
    this.history = [];
    this.historyIndex = -1;
  }

  private addTest(testName: string, passed: boolean, error?: string, details?: string) {
    this.results.push({ testName, passed, error, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${testName}`);
    if (error) console.error(`   Error: ${error}`);
    if (details) console.log(`   Details: ${details}`);
  }

  private findNodeById(root: TreeNode, id: string): TreeNode | null {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  private simulateToggleNode(nodeId: string) {
    const node = this.findNodeById(this.treeData!, nodeId);
    if (node) {
      const previousExpanded = node.expanded;
      node.expanded = !node.expanded;
      this.history.push({
        type: 'toggle',
        nodeId,
        data: { expanded: node.expanded },
        previousData: { expanded: previousExpanded }
      });
      this.historyIndex = this.history.length - 1;
    }
  }

  private simulateEditNode(nodeId: string, updates: Partial<TreeNode>) {
    const node = this.findNodeById(this.treeData!, nodeId);
    if (node) {
      const previousData = {
        name: node.name,
        value: node.value,
        type: node.type,
        note: node.note
      };

      Object.assign(node, updates);

      this.history.push({
        type: 'edit',
        nodeId,
        data: updates,
        previousData
      });
      this.historyIndex = this.history.length - 1;
    }
  }

  private simulateUndo() {
    if (this.historyIndex >= 0) {
      const action = this.history[this.historyIndex];
      this.applyAction(action, true);
      this.historyIndex--;
    }
  }

  private simulateRedo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const action = this.history[this.historyIndex];
      this.applyAction(action, false);
    }
  }

  private applyAction(action: NodeAction, reverse: boolean) {
    const node = this.findNodeById(this.treeData!, action.nodeId);
    if (!node) return;

    if (action.type === 'toggle') {
      const expandedValue = reverse ? action.previousData?.expanded : action.data?.expanded;
      node.expanded = expandedValue;
    } else if (action.type === 'edit') {
      const dataToApply = reverse ? action.previousData : action.data;
      Object.assign(node, dataToApply);
    }
  }

  // Test 1: JSON Loading and Parsing
  testJsonLoading() {
    try {
      this.loadTestData();

      const passed = this.treeData !== null &&
                    this.treeData.name === 'root' &&
                    this.treeData.type === 'object' &&
                    this.treeData.children?.length === 6;

      this.addTest('JSON Loading and Parsing', passed,
        passed ? undefined : 'Tree data structure is incorrect');
    } catch (error) {
      this.addTest('JSON Loading and Parsing', false, (error as Error).message);
    }
  }

  // Test 2: Node ID Generation
  testNodeIdGeneration() {
    try {
      const nameNode = this.treeData?.children?.find(child => child.name === 'name');
      const addressNode = this.treeData?.children?.find(child => child.name === 'address');

      const passed = nameNode?.id === 'root.name' &&
                    addressNode?.id === 'root.address' &&
                    addressNode?.children?.[0]?.id === 'root.address.street';

      this.addTest('Node ID Generation', passed,
        passed ? undefined : 'Node IDs are not generated correctly');
    } catch (error) {
      this.addTest('Node ID Generation', false, (error as Error).message);
    }
  }

  // Test 3: Node Type Detection
  testNodeTypeDetection() {
    try {
      const nodes = this.treeData?.children || [];
      const nameNode = nodes.find(n => n.name === 'name');
      const ageNode = nodes.find(n => n.name === 'age');
      const addressNode = nodes.find(n => n.name === 'address');
      const hobbiesNode = nodes.find(n => n.name === 'hobbies');
      const isActiveNode = nodes.find(n => n.name === 'isActive');
      const spouseNode = nodes.find(n => n.name === 'spouse');

      const passed = nameNode?.type === 'string' &&
                    ageNode?.type === 'number' &&
                    addressNode?.type === 'object' &&
                    hobbiesNode?.type === 'array' &&
                    isActiveNode?.type === 'boolean' &&
                    spouseNode?.type === 'null';

      this.addTest('Node Type Detection', passed,
        passed ? undefined : 'Node types are not detected correctly');
    } catch (error) {
      this.addTest('Node Type Detection', false, (error as Error).message);
    }
  }

  // Test 4: Toggle Functionality
  testToggleFunctionality() {
    try {
      const addressNode = this.treeData?.children?.find(n => n.name === 'address');
      const initialExpanded = addressNode?.expanded;

      this.simulateToggleNode('root.address');

      const afterToggle = this.treeData?.children?.find(n => n.name === 'address')?.expanded;
      const passed = afterToggle === !initialExpanded;

      this.addTest('Toggle Functionality', passed,
        passed ? undefined : `Expected ${!initialExpanded}, got ${afterToggle}`);
    } catch (error) {
      this.addTest('Toggle Functionality', false, (error as Error).message);
    }
  }

  // Test 5: Edit Functionality
  testEditFunctionality() {
    try {
      // Store original value for potential future use
      // const originalValue = this.treeData?.children?.find(n => n.name === 'name')?.value;

      this.simulateEditNode('root.name', { value: 'Jane Doe' });

      const newValue = this.treeData?.children?.find(n => n.name === 'name')?.value;
      const passed = newValue === 'Jane Doe';

      this.addTest('Edit Functionality', passed,
        passed ? undefined : `Expected 'Jane Doe', got '${newValue}'`);
    } catch (error) {
      this.addTest('Edit Functionality', false, (error as Error).message);
    }
  }

  // Test 6: Undo Toggle
  testUndoToggle() {
    try {
      const addressNode = this.treeData?.children?.find(n => n.name === 'address');
      const initialExpanded = addressNode?.expanded;

      this.simulateToggleNode('root.address');
      this.simulateUndo();

      const afterUndo = this.treeData?.children?.find(n => n.name === 'address')?.expanded;
      const passed = afterUndo === initialExpanded;

      this.addTest('Undo Toggle', passed,
        passed ? undefined : `Expected ${initialExpanded}, got ${afterUndo}`);
    } catch (error) {
      this.addTest('Undo Toggle', false, (error as Error).message);
    }
  }

  // Test 7: Undo Edit
  testUndoEdit() {
    try {
      const originalValue = this.treeData?.children?.find(n => n.name === 'name')?.value;

      this.simulateEditNode('root.name', { value: 'Jane Doe' });
      this.simulateUndo();

      const afterUndo = this.treeData?.children?.find(n => n.name === 'name')?.value;
      const passed = afterUndo === originalValue;

      this.addTest('Undo Edit', passed,
        passed ? undefined : `Expected '${originalValue}', got '${afterUndo}'`);
    } catch (error) {
      this.addTest('Undo Edit', false, (error as Error).message);
    }
  }

  // Test 8: Redo Functionality
  testRedoFunctionality() {
    try {
      this.simulateEditNode('root.name', { value: 'Jane Doe' });
      this.simulateUndo();
      this.simulateRedo();

      const afterRedo = this.treeData?.children?.find(n => n.name === 'name')?.value;
      const passed = afterRedo === 'Jane Doe';

      this.addTest('Redo Functionality', passed,
        passed ? undefined : `Expected 'Jane Doe', got '${afterRedo}'`);
    } catch (error) {
      this.addTest('Redo Functionality', false, (error as Error).message);
    }
  }

  // Test 9: Multiple Operations and Undo Order
  testMultipleOperationsUndoOrder() {
    try {
      // Perform multiple operations
      this.simulateEditNode('root.name', { value: 'Jane Doe' });
      this.simulateToggleNode('root.address');
      this.simulateEditNode('root.age', { value: 31 });

      // Undo operations in reverse order
      this.simulateUndo(); // Should undo age edit
      const ageAfterFirstUndo = this.treeData?.children?.find(n => n.name === 'age')?.value;

      this.simulateUndo(); // Should undo address toggle
      const addressAfterSecondUndo = this.treeData?.children?.find(n => n.name === 'address')?.expanded;

      this.simulateUndo(); // Should undo name edit
      const nameAfterThirdUndo = this.treeData?.children?.find(n => n.name === 'name')?.value;

      const passed = ageAfterFirstUndo === 30 &&
                    addressAfterSecondUndo === true &&
                    nameAfterThirdUndo === 'John Doe';

      this.addTest('Multiple Operations Undo Order', passed,
        passed ? undefined : `Age: ${ageAfterFirstUndo}, Address: ${addressAfterSecondUndo}, Name: ${nameAfterThirdUndo}`);
    } catch (error) {
      this.addTest('Multiple Operations Undo Order', false, (error as Error).message);
    }
  }

  // Test 10: History State Management
  testHistoryStateManagement() {
    try {
      const initialHistoryLength = this.history.length;

      this.simulateEditNode('root.name', { value: 'Test' });
      const afterEdit = this.history.length === initialHistoryLength + 1 && this.historyIndex === this.history.length - 1;

      this.simulateUndo();
      const afterUndo = this.historyIndex === this.history.length - 2;

      this.simulateRedo();
      const afterRedo = this.historyIndex === this.history.length - 1;

      const passed = afterEdit && afterUndo && afterRedo;

      this.addTest('History State Management', passed,
        passed ? undefined : `AfterEdit: ${afterEdit}, AfterUndo: ${afterUndo}, AfterRedo: ${afterRedo}`);
    } catch (error) {
      this.addTest('History State Management', false, (error as Error).message);
    }
  }

  // Run all tests
  runAllTests() {
    console.log('🧪 Starting Manual Tests...\n');

    this.testJsonLoading();
    this.testNodeIdGeneration();
    this.testNodeTypeDetection();
    this.testToggleFunctionality();
    this.testEditFunctionality();
    this.testUndoToggle();
    this.testUndoEdit();
    this.testRedoFunctionality();
    this.testMultipleOperationsUndoOrder();
    this.testHistoryStateManagement();

    this.printSummary();
  }

  // Print test summary
  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   • ${result.testName}: ${result.error || result.details || 'Unknown error'}`);
      });
    }
  }

  // Get results for programmatic access
  getResults() {
    return {
      results: this.results,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      total: this.results.length
    };
  }
}

// Export for browser console usage
(window as typeof window & { runManualTests?: () => ReturnType<TestRunner['getResults']> }).runManualTests = () => {
  const runner = new TestRunner();
  runner.runAllTests();
  return runner.getResults();
};

// Auto-run on import (for testing)
if (typeof window !== 'undefined') {
  console.log('📝 Manual tests loaded. Run window.runManualTests() to execute.');
}

export { TestRunner };