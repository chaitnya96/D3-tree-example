// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { TreeNode, NodeActionData, JsonValue, EditingNodeState } from '../types';
import {
  Upload,
  Download,
  RotateCcw,
  RotateCw,
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  ChevronUp,
  ChevronDown,
  Copy,
  Save,
  X
} from 'lucide-react';

interface PropertyPanelProps {
  treeData: TreeNode | null;
  selectedNode: TreeNode | null;
  onFileUpload: () => void;
  onExport: (includeNotes: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSearch: (query: string, type: 'key' | 'value' | 'note') => void;
  onNodeAdd: (parentId: string, nodeData: NodeActionData) => void;
  onNodeEdit: (nodeId: string, nodeData: NodeActionData) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeNote: (nodeId: string, note: string) => void;
  onSearchNext: () => void;
  onSearchPrevious: () => void;
  searchResults: TreeNode[];
  searchIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  hasData: boolean;
  isPanelOpen: boolean;
  onPanelClose: () => void;
  onSyncArrayCount: (arrayNodeId: string) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  treeData,
  selectedNode,
  onFileUpload,
  onExport,
  onUndo,
  onRedo,
  onSearch,
  onNodeAdd,
  onNodeEdit,
  onNodeDelete,
  onNodeNote,
  onSearchNext,
  onSearchPrevious,
  searchResults,
  searchIndex,
  canUndo,
  canRedo,
  hasData,
  isPanelOpen,
  onPanelClose,
  onSyncArrayCount
}) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'search' | 'node' | 'export'>('actions');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'key' | 'value' | 'note'>('key');
  const [exportIncludeNotes, setExportIncludeNotes] = useState(false);
  const [editingNode, setEditingNode] = useState<EditingNodeState | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setActiveTab('node');
      setEditingNode({
        name: selectedNode.name,
        value: selectedNode.type === 'object' || selectedNode.type === 'array' ?
          JSON.stringify(selectedNode.value, null, 2) :
          selectedNode.value?.toString() || '',
        type: selectedNode.type,
        note: selectedNode.note || ''
      });
    }
  }, [selectedNode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery, searchType);
    } else {
      // Clear search if query is empty
      onSearch('', searchType);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Auto-search as user types (debounced)
    if (value.trim()) {
      onSearch(value, searchType);
    } else {
      onSearch('', searchType);
    }
  };

  const handleNodeSave = () => {
    if (!selectedNode || !editingNode) return;

    let processedValue: JsonValue = editingNode.value;

    try {
      if (editingNode.type === 'number') {
        processedValue = Number(editingNode.value);
      } else if (editingNode.type === 'boolean') {
        processedValue = editingNode.value === 'true';
      } else if (editingNode.type === 'null') {
        processedValue = null;
      } else if (editingNode.type === 'object') {
        processedValue = JSON.parse(editingNode.value || '{}');
      } else if (editingNode.type === 'array') {
        processedValue = JSON.parse(editingNode.value || '[]');
      }
    } catch (error) {
      alert('Invalid JSON format for object/array types');
      return;
    }

    onNodeEdit(selectedNode.id, {
      name: editingNode.name,
      value: processedValue,
      type: editingNode.type,
      note: editingNode.note
    });
  };

  const handleNodeAdd = () => {
    if (!selectedNode) return;

    const newNodeData = {
      name: 'newNode',
      value: '',
      type: 'string' as TreeNode['type'],
      note: ''
    };

    onNodeAdd(selectedNode.id, newNodeData);
  };

  const handleExport = () => {
    onExport(exportIncludeNotes);
  };

  const copyJsonToClipboard = async () => {
    if (!treeData) return;

    try {
      const jsonString = JSON.stringify(treeData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert('JSON copied to clipboard!');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Array operation handlers
  const handleAddReference = () => {
    if (!selectedNode) return;

    const newReference = {
      name: selectedNode.children?.length.toString() || '0',
      value: { '@odata.id': '/redfish/v1/NewResource' },
      type: 'object' as TreeNode['type'],
      note: ''
    };

    onNodeAdd(selectedNode.id, newReference);
  };

  const handleAddMessage = () => {
    if (!selectedNode) return;

    const newMessage = {
      name: selectedNode.children?.length.toString() || '0',
      value: {
        'Oem': {
          'Microsoft': {
            '@odata.type': '#Ocs.v1_0_0.Message',
            'CompletionCode': 'Success'
          }
        }
      },
      type: 'object' as TreeNode['type'],
      note: ''
    };

    onNodeAdd(selectedNode.id, newMessage);
  };

  const handleValidateReferences = () => {
    if (!selectedNode || !selectedNode.children) return;

    const invalidRefs = selectedNode.children.filter(child => {
      const odataId = child.value?.['@odata.id'];
      return !odataId || typeof odataId !== 'string' || !odataId.startsWith('/redfish/v1/');
    });

    if (invalidRefs.length > 0) {
      alert(`Found ${invalidRefs.length} invalid references. Check console for details.`);
      // eslint-disable-next-line no-console
      console.warn('Invalid references:', invalidRefs);
    } else {
      alert('All references are valid!');
    }
  };

  const handleSyncCount = () => {
    if (!selectedNode || !selectedNode.arrayMetadata?.countProperty) return;

    onSyncArrayCount(selectedNode.id);
    alert('Array count synchronized!');
  };

  return (
    <div className={`property-panel ${isPanelOpen ? 'open' : ''}`}>
      <div className="panel-header">
        {/* Mobile close button */}
        <button
          type="button"
          className="mobile-close-btn"
          onClick={onPanelClose}
          title="Close panel"
        >
          <X size={20} />
        </button>

        <div className="panel-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            <Edit size={16} />
            Actions
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={16} />
            Search
          </button>
          {selectedNode && (
            <button
              type="button"
              className={`tab-button ${activeTab === 'node' ? 'active' : ''}`}
              onClick={() => setActiveTab('node')}
            >
              <FileText size={16} />
              Node
            </button>
          )}
          <button
            type="button"
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="panel-content">
        {activeTab === 'actions' && (
          <div className="actions-panel">
            <h3>File Actions</h3>
            <button type="button" className="panel-btn primary" onClick={onFileUpload}>
              <Upload size={16} />
              Import JSON
            </button>

            <h3>History</h3>
            <div className="button-group">
              <button
                type="button"
                className="panel-btn"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <RotateCcw size={16} />
                Undo
              </button>
              <button
                type="button"
                className="panel-btn"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <RotateCw size={16} />
                Redo
              </button>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-panel">
            <h3>Search Tree</h3>
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group">
                <label>Search by:</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'key' | 'value' | 'note')}
                  className="form-select"
                >
                  <option value="key">Key/Name</option>
                  <option value="value">Value</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder={`Search by ${searchType}...`}
                  className="form-input"
                />
                <button type="submit" className="panel-btn primary">
                  <Search size={16} />
                  Search
                </button>
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="search-results">
                <div className="search-header">
                  <span className="search-count">
                    {searchIndex >= 0 ? `${searchIndex + 1} of ${searchResults.length}` : `0 of ${searchResults.length}`}
                  </span>
                  <div className="search-navigation">
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={onSearchPrevious}
                      disabled={searchResults.length === 0}
                      aria-label="Previous search result"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="nav-btn"
                      onClick={onSearchNext}
                      disabled={searchResults.length === 0}
                      aria-label="Next search result"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
                <div className="results-preview">
                  {searchResults.slice(0, 5).map((node, index) => (
                    <div
                      key={node.id}
                      className={`result-item ${index === searchIndex ? 'active' : ''}`}
                      onClick={() => {
                        const actualIndex = searchResults.findIndex(r => r.id === node.id);
                        if (actualIndex !== -1) {
                          // This would need to be implemented to jump to specific result
                          // eslint-disable-next-line no-console
                          console.log('Jump to result:', actualIndex);
                        }
                      }}
                    >
                      <div className="result-header">
                        <div className="result-name">{node.name}</div>
                        <div className="result-type">{node.type}</div>
                      </div>
                      <div className="result-path">{node.id}</div>
                      {node.value && (
                        <div className="result-value">
                          {typeof node.value === 'string' ? node.value : JSON.stringify(node.value)}
                        </div>
                      )}
                      {node.note && (
                        <div className="result-note">{node.note}</div>
                      )}
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="result-item more">
                      +{searchResults.length - 5} more results
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'node' && selectedNode && (
          <div className="node-panel">
            <h3>Edit Node</h3>
            <div className="node-info">
              <div className="info-row">
                <span className="label">ID:</span>
                <span className="value">{selectedNode.id}</span>
              </div>
              <div className="info-row">
                <span className="label">Type:</span>
                <span className="value">{selectedNode.type}</span>
              </div>
              {selectedNode.type === 'array' && selectedNode.arrayMetadata && (
                <>
                  <div className="info-row">
                    <span className="label">Array Type:</span>
                    <span className="value">{selectedNode.arrayMetadata.arrayType}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Item Count:</span>
                    <span className="value">{selectedNode.arrayMetadata.itemCount}</span>
                  </div>
                  {selectedNode.arrayMetadata.countProperty && (
                    <div className="info-row">
                      <span className="label">Count Property:</span>
                      <span className="value">{selectedNode.arrayMetadata.countProperty}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="form-group">
              <label>Name/Key:</label>
              <input
                type="text"
                value={editingNode?.name || ''}
                onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Type:</label>
              <select
                value={editingNode?.type || 'string'}
                onChange={(e) => setEditingNode({ ...editingNode, type: e.target.value })}
                className="form-select"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="null">Null</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
              </select>
            </div>

            {editingNode?.type !== 'null' && (
              <div className="form-group">
                <label>Value:</label>
                {editingNode?.type === 'boolean' ? (
                  <select
                    value={editingNode?.value || 'false'}
                    onChange={(e) => setEditingNode({ ...editingNode, value: e.target.value })}
                    className="form-select"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : editingNode?.type === 'object' || editingNode?.type === 'array' ? (
                  <textarea
                    value={editingNode?.value || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, value: e.target.value })}
                    className="form-textarea"
                    rows={4}
                    placeholder={editingNode?.type === 'object' ? '{"key": "value"}' : '[1, 2, 3]'}
                  />
                ) : (
                  <input
                    type={editingNode?.type === 'number' ? 'number' : 'text'}
                    value={editingNode?.value || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, value: e.target.value })}
                    className="form-input"
                  />
                )}
              </div>
            )}

            <div className="form-group">
              <label>Note:</label>
              <textarea
                value={editingNode?.note || ''}
                onChange={(e) => setEditingNode({ ...editingNode, note: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="Add a note for this node"
              />
            </div>

            <div className="button-group">
              <button type="button" className="panel-btn primary" onClick={handleNodeSave}>
                <Save size={16} />
                Save Changes
              </button>
              <button type="button" className="panel-btn" onClick={handleNodeAdd}>
                <Plus size={16} />
                Add Child
              </button>
              <button
                type="button"
                className="panel-btn danger"
                onClick={() => onNodeDelete(selectedNode.id)}
              >
                <Trash2 size={16} />
                Delete Node
              </button>
            </div>

            {/* Array-specific operations */}
            {selectedNode.type === 'array' && selectedNode.arrayMetadata && (
              <div className="array-operations">
                <h4>Array Operations</h4>
                {selectedNode.arrayMetadata.arrayType === 'collection' && (
                  <div className="button-group">
                    <button type="button" className="panel-btn" onClick={() => handleAddReference()}>
                      <Plus size={16} />
                      Add Reference
                    </button>
                    <button type="button" className="panel-btn" onClick={() => handleValidateReferences()}>
                      <Search size={16} />
                      Validate References
                    </button>
                  </div>
                )}
                {selectedNode.arrayMetadata.arrayType === 'messages' && (
                  <div className="button-group">
                    <button type="button" className="panel-btn" onClick={() => handleAddMessage()}>
                      <Plus size={16} />
                      Add Message
                    </button>
                  </div>
                )}
                {selectedNode.arrayMetadata.countProperty && (
                  <button type="button" className="panel-btn" onClick={() => handleSyncCount()}>
                    <RotateCw size={16} />
                    Sync Count
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="export-panel">
            <h3>Export Options</h3>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exportIncludeNotes}
                  onChange={(e) => setExportIncludeNotes(e.target.checked)}
                />
                Include notes in export
              </label>
            </div>

            <div className="button-group">
              <button type="button" className="panel-btn primary" onClick={handleExport}>
                <Download size={16} />
                Download JSON
              </button>
              <button type="button" className="panel-btn" onClick={copyJsonToClipboard}>
                <Copy size={16} />
                Copy to Clipboard
              </button>
            </div>

            {hasData && (
              <div className="export-preview">
                <h4>Preview:</h4>
                <pre className="json-preview">
                  {JSON.stringify(treeData, null, 2).substring(0, 500)}
                  {JSON.stringify(treeData, null, 2).length > 500 && '...'}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;