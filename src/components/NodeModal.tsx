import React, { useState, useEffect } from 'react';
import { TreeNode, NodeActionData, JsonValue } from '../types';
import { X, Save, Trash2 } from 'lucide-react';

interface NodeModalProps {
  node: TreeNode | null;
  isOpen: boolean;
  mode: 'edit' | 'add' | 'note';
  onClose: () => void;
  onSave: (data: NodeActionData) => void;
  onDelete?: () => void;
}

const NodeModal: React.FC<NodeModalProps> = ({
  node,
  isOpen,
  mode,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    type: 'string' as TreeNode['type'],
    note: ''
  });

  useEffect(() => {
    if (node && isOpen) {
      setFormData({
        name: node.name || '',
        value: node.type === 'object' || node.type === 'array' ? '' : JSON.stringify(node.value) || '',
        type: node.type,
        note: node.note || ''
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        value: '',
        type: 'string',
        note: ''
      });
    }
  }, [node, isOpen, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'note') {
      onSave({ note: formData.note });
      return;
    }

    let processedValue: JsonValue = formData.value;

    try {
      if (formData.type === 'number') {
        processedValue = Number(formData.value);
      } else if (formData.type === 'boolean') {
        processedValue = formData.value === 'true';
      } else if (formData.type === 'null') {
        processedValue = null;
      } else if (formData.type === 'object') {
        processedValue = JSON.parse(formData.value || '{}');
      } else if (formData.type === 'array') {
        processedValue = JSON.parse(formData.value || '[]');
      }
    } catch (error) {
      alert('Invalid JSON format for object/array types');
      return;
    }

    onSave({
      name: formData.name,
      value: processedValue,
      type: formData.type,
      note: formData.note
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {mode === 'edit' ? 'Edit Node' :
              mode === 'add' ? 'Add New Node' :
                'Add Note'}
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mode !== 'note' && (
            <>
              <div className="form-group">
                <label htmlFor="name">Name/Key:</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter key name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type:</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TreeNode['type'] })}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="null">Null</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
              </div>

              {formData.type !== 'null' && (
                <div className="form-group">
                  <label htmlFor="value">Value:</label>
                  {formData.type === 'boolean' ? (
                    <select
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : formData.type === 'object' || formData.type === 'array' ? (
                    <textarea
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={formData.type === 'object' ? '{"key": "value"}' : '[1, 2, 3]'}
                      rows={4}
                    />
                  ) : (
                    <input
                      id="value"
                      type={formData.type === 'number' ? 'number' : 'text'}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={`Enter ${formData.type} value`}
                    />
                  )}
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label htmlFor="note">Note:</label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note for this node"
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Save
            </button>
            {mode === 'edit' && onDelete && (
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeModal;