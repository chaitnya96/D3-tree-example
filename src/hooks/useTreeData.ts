import { useState, useCallback } from 'react';
import { TreeNode, NodeAction, JsonValue, JsonObject } from '../types';
import { parseJsonToTree } from '../utils/jsonParser';

export const useTreeData = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [history, setHistory] = useState<NodeAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((action: NodeAction) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(action);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const loadJsonData = useCallback((jsonData: JsonValue) => {
    const tree = parseJsonToTree(jsonData);
    setTreeData(tree);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const findNodeById = useCallback((root: TreeNode, id: string): TreeNode | null => {
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    if (!treeData) return;

    const updateNodeRecursive = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursive)
        };
      }
      return node;
    };

    setTreeData(updateNodeRecursive(treeData));
  }, [treeData]);

  const addNode = useCallback((parentId: string, newNode: Omit<TreeNode, 'id' | 'parent'>) => {
    if (!treeData) return;

    const generateId = (parentId: string, name: string) => `${parentId}.${name}`;
    const nodeId = generateId(parentId, newNode.name);

    // Find parent node for history tracking
    const parentNode = findNodeById(treeData, parentId);
    if (!parentNode) return;

    const addNodeRecursive = (node: TreeNode): TreeNode => {
      if (node.id === parentId) {
        const newChild: TreeNode = {
          ...newNode,
          id: nodeId,
          parent: node,
          children: newNode.children || []
        };

        return {
          ...node,
          children: [...(node.children || []), newChild]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addNodeRecursive)
        };
      }
      return node;
    };

    setTreeData(addNodeRecursive(treeData));
    addToHistory({
      type: 'add',
      nodeId,
      data: { ...newNode, id: nodeId, parent: parentNode }
    });
  }, [treeData, findNodeById, addToHistory]);

  const editNode = useCallback((nodeId: string, updates: Partial<TreeNode>) => {
    if (!treeData) return;

    const node = findNodeById(treeData, nodeId);
    if (!node) return;

    const previousData = {
      name: node.name,
      value: node.value,
      type: node.type,
      note: node.note
    };

    updateNode(nodeId, updates);
    addToHistory({
      type: 'edit',
      nodeId,
      data: updates,
      previousData
    });
  }, [treeData, findNodeById, updateNode, addToHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!treeData || nodeId === treeData.id) return;

    const node = findNodeById(treeData, nodeId);
    if (!node) return;

    // Find parent node
    const findParent = (root: TreeNode, targetId: string): TreeNode | null => {
      if (root.children) {
        for (const child of root.children) {
          if (child.id === targetId) return root;
          const found = findParent(child, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const parentNode = findParent(treeData, nodeId);
    const nodeWithParent = { ...node, parent: parentNode };

    const deleteNodeRecursive = (node: TreeNode): TreeNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children
            .filter(child => child.id !== nodeId)
            .map(deleteNodeRecursive)
        };
      }
      return node;
    };

    setTreeData(deleteNodeRecursive(treeData));
    addToHistory({
      type: 'delete',
      nodeId,
      previousData: nodeWithParent
    });
  }, [treeData, findNodeById, addToHistory]);

  const addNote = useCallback((nodeId: string, note: string) => {
    if (!treeData) return;

    const node = findNodeById(treeData, nodeId);
    if (!node) return;

    const previousNote = node.note;

    updateNode(nodeId, { note });
    addToHistory({
      type: 'note',
      nodeId,
      data: { note },
      previousData: { note: previousNote }
    });
  }, [treeData, findNodeById, updateNode, addToHistory]);

  const toggleNode = useCallback((nodeId: string) => {
    if (!treeData) return;

    const node = findNodeById(treeData, nodeId);
    if (!node) return;

    const previousExpanded = node.expanded;
    updateNode(nodeId, { expanded: !node.expanded });

    addToHistory({
      type: 'toggle',
      nodeId,
      data: { expanded: !previousExpanded },
      previousData: { expanded: previousExpanded }
    });
  }, [treeData, findNodeById, updateNode, addToHistory]);

  const toggleLevel = useCallback((level: number, expand: boolean) => {
    if (!treeData) return;

    const toggleNodesByLevel = (node: TreeNode, currentLevel: number): TreeNode => {
      const shouldToggle = level === -1 || currentLevel === level;
      const shouldUpdate = shouldToggle && node.children && node.children.length > 0;
      
      const updatedNode = shouldUpdate 
        ? { ...node, expanded: expand }
        : node;

      if (node.children) {
        return {
          ...updatedNode,
          children: node.children.map(child => toggleNodesByLevel(child, currentLevel + 1))
        };
      }
      return updatedNode;
    };

    setTreeData(toggleNodesByLevel(treeData, 0));
  }, [treeData]);

  const syncArrayCount = useCallback((arrayNodeId: string) => {
    if (!treeData) return;

    const arrayNode = findNodeById(treeData, arrayNodeId);
    if (!arrayNode || arrayNode.type !== 'array' || !arrayNode.arrayMetadata?.countProperty) return;

    const actualCount = arrayNode.children?.length || 0;
    const countProperty = arrayNode.arrayMetadata.countProperty;

    // Find the parent node to update the count property
    const parentNode = arrayNode.parent;
    if (!parentNode) return;

    const updateCountRecursive = (node: TreeNode): TreeNode => {
      if (node.id === parentNode.id) {
        const updatedValue = { ...(node.value as JsonObject) };
        updatedValue[countProperty] = actualCount;
        return { ...node, value: updatedValue };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateCountRecursive)
        };
      }
      return node;
    };

    setTreeData(updateCountRecursive(treeData));
  }, [treeData, findNodeById]);

  const exportData = useCallback((includeNotes = false) => {
    if (!treeData) return null;

    const cleanTree = (node: TreeNode): JsonValue => {
      if (node.type === 'object' && node.children) {
        const result: JsonObject = {};
        node.children.forEach(child => {
          result[child.name] = cleanTree(child);
        });
        return result;
      } else if (node.type === 'array' && node.children) {
        return node.children.map(child => cleanTree(child));
      } else {
        return node.value ?? null;
      }
    };

    return cleanTree(treeData);
  }, [treeData]);

  const applyHistoryAction = useCallback((action: NodeAction, reverse = false) => {
    if (!treeData) return;

    const applyAction = (node: TreeNode, action: NodeAction, reverse: boolean): TreeNode => {
      if (action.type === 'delete' && !reverse) {
        // Re-apply delete - remove node
        if (node.children) {
          return {
            ...node,
            children: node.children
              .filter(child => child.id !== action.nodeId)
              .map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      } else if (action.type === 'delete' && reverse) {
        // Undo delete - restore node
        if (action.previousData && action.previousData.parent && node.id === action.previousData.parent.id) {
          const nodeToRestore = { ...action.previousData };
          delete nodeToRestore.parent; // Remove parent reference to avoid circular references
          return {
            ...node,
            children: [...(node.children || []), nodeToRestore as TreeNode]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      } else if (action.type === 'add' && !reverse) {
        // Re-apply add
        if (action.data && action.data.parent && node.id === action.data.parent.id) {
          const nodeToAdd = { ...action.data };
          delete nodeToAdd.parent; // Remove parent reference to avoid circular references
          return {
            ...node,
            children: [...(node.children || []), nodeToAdd as TreeNode]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      } else if (action.type === 'add' && reverse) {
        // Undo add - remove added node
        if (node.children) {
          return {
            ...node,
            children: node.children
              .filter(child => child.id !== action.nodeId)
              .map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      } else if (action.type === 'edit') {
        if (node.id === action.nodeId) {
          const dataToApply = reverse ? action.previousData : action.data;
          return { ...node, ...dataToApply };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      } else if (action.type === 'note') {
        if (node.id === action.nodeId) {
          return { ...node, note: reverse ? action.previousData?.note : action.data?.note };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      } else if (action.type === 'toggle') {
        if (node.id === action.nodeId) {
          const expandedValue = reverse ? action.previousData?.expanded : action.data?.expanded;
          return { ...node, expanded: expandedValue };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => applyAction(child, action, reverse))
          };
        }
        return node;
      }
      return node;
    };

    setTreeData(applyAction(treeData, action, reverse));
  }, [treeData]);

  const undo = useCallback(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
      const action = history[historyIndex];
      applyHistoryAction(action, true);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history, applyHistoryAction]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const action = history[nextIndex];
      applyHistoryAction(action, false);
      setHistoryIndex(nextIndex);
    }
  }, [historyIndex, history, applyHistoryAction]);

  return {
    treeData,
    loadJsonData,
    addNode,
    editNode,
    deleteNode,
    addNote,
    toggleNode,
    toggleLevel,
    exportData,
    syncArrayCount,
    undo,
    redo,
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < history.length - 1,
    history, // For debugging
    historyIndex // For debugging
  };
};