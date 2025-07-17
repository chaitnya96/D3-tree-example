import { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import TreeVisualization from './components/TreeVisualization';
import PropertyPanel from './components/PropertyPanel';
import { useTreeData } from './hooks/useTreeData';
import { TreeNode, JsonValue, NodeActionData } from './types';
import { TestRunner } from './utils/manualTests';
import { Menu } from 'lucide-react';

function App() {
  const {
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
    canUndo,
    canRedo
  } = useTreeData();

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<TreeNode[]>([]);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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

  const handleFileLoad = (data: JsonValue) => {
    loadJsonData(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleNodeEdit = (node: TreeNode) => {
    setSelectedNode(node);
    setIsPanelOpen(true); // Open panel on mobile when node is selected
  };

  const handleNodeDelete = (node: TreeNode) => {
    deleteNode(node.id);
    setSelectedNode(null);
  };

  const handleNodeAdd = (parent: TreeNode) => {
    setSelectedNode(parent);
  };

  const handleNodeNote = (node: TreeNode) => {
    setSelectedNode(node);
  };

  const handleExport = (includeNotes: boolean) => {
    const data = exportData(includeNotes);
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = 'exported_data.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const searchTree = (node: TreeNode, searchQuery: string, type: 'key' | 'value' | 'note'): TreeNode[] => {
    const matches: TreeNode[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    const checkMatch = (node: TreeNode): boolean => {
      switch (type) {
      case 'key':
        return node.name.toLowerCase().includes(lowerQuery);
      case 'value':
        if (node.value == null) return false;
        const valueStr = typeof node.value === 'string' ? node.value : JSON.stringify(node.value);
        return valueStr.toLowerCase().includes(lowerQuery);
      case 'note':
        return Boolean(node.note && node.note.toLowerCase().includes(lowerQuery));
      default:
        return false;
      }
    };

    if (checkMatch(node)) {
      matches.push(node);
    }

    if (node.children) {
      node.children.forEach(child => {
        matches.push(...searchTree(child, searchQuery, type));
      });
    }

    return matches;
  };

  const handleSearch = (query: string, type: 'key' | 'value' | 'note') => {
    if (!treeData || !query.trim()) {
      setSearchResults([]);
      setSearchIndex(-1);
      return;
    }

    const results = searchTree(treeData, query, type);
    setSearchResults(results);
    setSearchIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      handleNodeFound(results[0]);
    }
  };

  const handleSearchNext = () => {
    if (searchResults.length > 0) {
      const nextIndex = (searchIndex + 1) % searchResults.length;
      setSearchIndex(nextIndex);
      handleNodeFound(searchResults[nextIndex]);
    }
  };

  const handleSearchPrevious = () => {
    if (searchResults.length > 0) {
      const prevIndex = searchIndex <= 0 ? searchResults.length - 1 : searchIndex - 1;
      setSearchIndex(prevIndex);
      handleNodeFound(searchResults[prevIndex]);
    }
  };

  const handleNodeFound = (node: TreeNode) => {
    setHighlightedNodeId(node.id);
    // Auto-expand parent nodes to make the node visible
    const expandParents = (nodeId: string) => {
      const parts = nodeId.split('.');
      for (let i = 1; i < parts.length; i++) {
        const parentId = parts.slice(0, i + 1).join('.');
        // Find the parent node and check if it's already expanded
        const parentNode = findNodeById(treeData!, parentId);
        if (parentNode && !parentNode.expanded) {
          toggleNode(parentId);
        }
      }
    };
    expandParents(node.id);
  };

  const handleFileUpload = () => {
    document.getElementById('json-file-input')?.click();
  };

  const handlePanelNodeEdit = (nodeId: string, nodeData: NodeActionData) => {
    editNode(nodeId, nodeData);
  };

  const handlePanelNodeDelete = (nodeId: string) => {
    deleteNode(nodeId);
    setSelectedNode(null);
  };

  const handlePanelNodeAdd = (parentId: string, nodeData: NodeActionData) => {
    // @ts-ignore
    addNode(parentId, nodeData);
  };

  const handlePanelNodeNote = (nodeId: string, note: string) => {
    addNote(nodeId, note);
  };

  const runTests = () => {
    const runner = new TestRunner();
    runner.runAllTests();
    return runner.getResults();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>JSON Tree Editor</h1>
            <p>Upload, visualize, and edit JSON data with an interactive tree interface</p>
          </div>
          <button
            type="button"
            className="test-button"
            onClick={runTests}
            title="Run functionality tests"
          >
            🧪 Run Tests
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="app-body">
        <main className="app-main">
          {!treeData ? (
            <div className="welcome-section">
              <FileUpload onFileLoad={handleFileLoad} onError={handleError} />
              <div className="welcome-text">
                <h2>Welcome to JSON Tree Editor</h2>
                <p>Upload a JSON file to start visualizing and editing your data structure.</p>
                <div className="features">
                  <h3>Features:</h3>
                  <ul>
                    <li>Interactive tree visualization</li>
                    <li>Add, edit, and delete nodes</li>
                    <li>Attach notes to nodes</li>
                    <li>Expand/collapse branches</li>
                    <li>Export modified data</li>
                    <li>Undo/redo functionality</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="tree-container">
              <TreeVisualization
                data={treeData}
                onNodeEdit={handleNodeEdit}
                onNodeDelete={handleNodeDelete}
                onNodeAdd={handleNodeAdd}
                onNodeNote={handleNodeNote}
                onNodeToggle={(node) => toggleNode(node.id)}
                onLevelToggle={toggleLevel}
                highlightedNodeId={highlightedNodeId}
              />
            </div>
          )}
        </main>

        {/* Mobile Panel Toggle Button */}
        <button
          type="button"
          className={`mobile-panel-toggle ${isPanelOpen ? 'hidden' : ''}`}
          onClick={() => setIsPanelOpen(true)}
          title="Open property panel"
        >
          <Menu size={20} />
        </button>

        <PropertyPanel
          treeData={treeData}
          selectedNode={selectedNode}
          onFileUpload={handleFileUpload}
          onExport={handleExport}
          onUndo={undo}
          onRedo={redo}
          onSearch={handleSearch}
          onNodeAdd={handlePanelNodeAdd}
          onNodeEdit={handlePanelNodeEdit}
          onNodeDelete={handlePanelNodeDelete}
          onNodeNote={handlePanelNodeNote}
          onSearchNext={handleSearchNext}
          onSearchPrevious={handleSearchPrevious}
          searchResults={searchResults}
          searchIndex={searchIndex}
          canUndo={canUndo}
          canRedo={canRedo}
          hasData={!!treeData}
          isPanelOpen={isPanelOpen}
          onPanelClose={() => setIsPanelOpen(false)}
          onSyncArrayCount={syncArrayCount}
        />
      </div>
    </div>
  );
}

export default App;