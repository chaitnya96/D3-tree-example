import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { validateJson } from '../utils/jsonParser';
import { JsonValue } from '../types';

interface FileUploadProps {
  onFileLoad: (data: JsonValue) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, onError }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      onError('Please select a valid JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const validation = validateJson(content);

      if (validation.valid && validation.data) {
        onFileLoad(validation.data);
      } else {
        onError(validation.error || 'Invalid JSON format');
      }
    };

    reader.onerror = () => {
      onError('Error reading file');
    };

    reader.readAsText(file);
  }, [onFileLoad, onError]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const validation = validateJson(content);

          if (validation.valid && validation.data) {
            onFileLoad(validation.data);
          } else {
            onError(validation.error || 'Invalid JSON format');
          }
        };
        reader.readAsText(file);
      } else {
        onError('Please drop a valid JSON file');
      }
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className="file-upload-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="file-input"
          id="json-file-input"
        />
        <label htmlFor="json-file-input" className="file-upload-label">
          <Upload size={24} />
          <span>Upload JSON File</span>
          <small>or drag and drop a .json file here</small>
        </label>
      </div>
    </div>
  );
};

export default FileUpload;