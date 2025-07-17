/* eslint-disable no-console */
// Test utility for undo/redo functionality
import { TreeNode, NodeAction, JsonValue } from '../types';

export const createTestNode = (name: string, value: JsonValue, type: TreeNode['type']): TreeNode => ({
  id: `test.${name}`,
  name,
  value,
  type,
  expanded: true,
  children: []
});

export const createTestTree = (): TreeNode => ({
  id: 'root',
  name: 'root',
  value: {
    user: 'testUser',
    data: [1, 2, 3],
    settings: {
      theme: 'dark',
      notifications: true
    }
  },
  type: 'object',
  expanded: true,
  children: [
    {
      id: 'root.user',
      name: 'user',
      value: 'testUser',
      type: 'string',
      expanded: true,
      children: []
    },
    {
      id: 'root.data',
      name: 'data',
      value: [1, 2, 3],
      type: 'array',
      expanded: true,
      children: [
        {
          id: 'root.data.0',
          name: '0',
          value: 1,
          type: 'number',
          expanded: true,
          children: []
        },
        {
          id: 'root.data.1',
          name: '1',
          value: 2,
          type: 'number',
          expanded: true,
          children: []
        },
        {
          id: 'root.data.2',
          name: '2',
          value: 3,
          type: 'number',
          expanded: true,
          children: []
        }
      ]
    },
    {
      id: 'root.settings',
      name: 'settings',
      value: {
        theme: 'dark',
        notifications: true
      },
      type: 'object',
      expanded: true,
      children: [
        {
          id: 'root.settings.theme',
          name: 'theme',
          value: 'dark',
          type: 'string',
          expanded: true,
          children: []
        },
        {
          id: 'root.settings.notifications',
          name: 'notifications',
          value: true,
          type: 'boolean',
          expanded: true,
          children: []
        }
      ]
    }
  ]
});

export const logTestResults = (testName: string, passed: boolean, details?: string) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) {
    console.log(`   Details: ${details}`);
  }
};

export const testActions: NodeAction[] = [
  {
    type: 'toggle',
    nodeId: 'root.settings',
    data: { expanded: false },
    previousData: { expanded: true }
  },
  {
    type: 'edit',
    nodeId: 'root.user',
    data: { value: 'updatedUser' },
    previousData: { value: 'testUser' }
  },
  {
    type: 'add',
    nodeId: 'root.newField',
    data: {
      name: 'newField',
      value: 'newValue',
      type: 'string' as TreeNode['type'],
      id: 'root.newField'
    }
  },
  {
    type: 'delete',
    nodeId: 'root.data.1',
    previousData: {
      id: 'root.data.1',
      name: '1',
      value: 2,
      type: 'number' as TreeNode['type'],
      expanded: true,
      children: []
    }
  },
  {
    type: 'note',
    nodeId: 'root.settings.theme',
    data: { note: 'This is a test note' },
    previousData: { note: undefined }
  }
];

// Test scenarios that should be covered:
export const testScenarios = [
  'Toggle expand/collapse -> Undo -> Node should be expanded again',
  'Edit node value -> Undo -> Node should have original value',
  'Add new node -> Undo -> Node should be removed',
  'Delete node -> Undo -> Node should be restored with all children',
  'Add note -> Undo -> Note should be removed',
  'Multiple operations -> Multiple undos -> All changes should be reverted in reverse order',
  'Undo then redo -> Should restore the undone action',
  'Redo without undo -> Should do nothing'
];

console.log('🧪 Undo/Redo Test Scenarios to Verify:');
testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario}`);
});