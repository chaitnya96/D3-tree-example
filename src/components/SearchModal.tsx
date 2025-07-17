// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { TreeNode } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  treeData: TreeNode | null;
  onNodeFound: (node: TreeNode) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  treeData,
  onNodeFound
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TreeNode[]>([]);
  const [searchType, setSearchType] = useState<'key' | 'value' | 'note'>('key');
  const [currentIndex, setCurrentIndex] = useState(-1);

  const searchTree = useCallback((node: TreeNode, searchQuery: string, type: 'key' | 'value' | 'note'): TreeNode[] => {
    const matches: TreeNode[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    const checkMatch = (node: TreeNode): boolean => {
      switch (type) {
      case 'key':
        return node.name.toLowerCase().includes(lowerQuery);
      case 'value':
        return node.value &&
                 typeof node.value === 'string' &&
                 node.value.toLowerCase().includes(lowerQuery);
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
  }, []);

  useEffect(() => {
    if (query && treeData) {
      const searchResults = searchTree(treeData, query, searchType);
      setResults(searchResults);
      setCurrentIndex(-1);
    } else {
      setResults([]);
      setCurrentIndex(-1);
    }
  }, [query, treeData, searchType, searchTree]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query && treeData) {
      const searchResults = searchTree(treeData, query, searchType);
      setResults(searchResults);
    }
  };

  const handleResultClick = (node: TreeNode, index: number) => {
    setCurrentIndex(index);
    onNodeFound(node);
  };

  const handleNext = () => {
    if (results.length > 0) {
      const nextIndex = (currentIndex + 1) % results.length;
      setCurrentIndex(nextIndex);
      onNodeFound(results[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (results.length > 0) {
      const prevIndex = currentIndex <= 0 ? results.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      onNodeFound(results[prevIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Search Tree</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close search modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label htmlFor="search-type">Search by:</label>
              <select
                id="search-type"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'key' | 'value' | 'note')}
              >
                <option value="key">Key/Name</option>
                <option value="value">Value</option>
                <option value="note">Note</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="search-query">Search query:</label>
              <div className="search-input-group">
                <input
                  id="search-query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search by ${searchType}...`}
                />
                <button type="submit" className="search-btn" aria-label="Search">
                  <Search size={16} />
                </button>
              </div>
            </div>
          </form>

          <div className="search-results">
            <div className="search-header">
              <h4>Results ({results.length})</h4>
              {results.length > 0 && (
                <div className="search-navigation">
                  <span className="search-counter">
                    {currentIndex >= 0 ? `${currentIndex + 1} of ${results.length}` : `0 of ${results.length}`}
                  </span>
                  <button
                    type="button"
                    className="nav-btn"
                    onClick={handlePrevious}
                    disabled={results.length === 0}
                    aria-label="Previous result"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="nav-btn"
                    onClick={handleNext}
                    disabled={results.length === 0}
                    aria-label="Next result"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </div>
            {results.length === 0 ? (
              <p className="no-results">No results found</p>
            ) : (
              <div className="results-list">
                {results.map((node, index) => (
                  <div
                    key={`${node.id}-${index}`}
                    className={`result-item ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => handleResultClick(node, index)}
                  >
                    <div className="result-header">
                      <span className="result-name">{node.name}</span>
                      <span className="result-type">{node.type}</span>
                    </div>
                    <div className="result-path">{node.id}</div>
                    {searchType === 'value' && (
                      <div className="result-value">
                        {JSON.stringify(node.value)}
                      </div>
                    )}
                    {searchType === 'note' && node.note && (
                      <div className="result-note">{node.note}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;