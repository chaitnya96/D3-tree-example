import React from 'react';
import { Download, Upload, RotateCcw, RotateCw, Search } from 'lucide-react';

interface ToolbarProps {
  onExport: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSearch: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasData: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onExport,
  onImport,
  onUndo,
  onRedo,
  onSearch,
  canUndo,
  canRedo,
  hasData
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button type="button" className="toolbar-btn" onClick={onImport}>
          <Upload size={18} />
          Import
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={onExport}
          disabled={!hasData}
        >
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="toolbar-section">
        <button
          type="button"
          className="toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <RotateCcw size={18} />
          Undo
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <RotateCw size={18} />
          Redo
        </button>
      </div>

      <div className="toolbar-section">
        <button
          type="button"
          className="toolbar-btn"
          onClick={onSearch}
          disabled={!hasData}
        >
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  );
};

export default Toolbar;