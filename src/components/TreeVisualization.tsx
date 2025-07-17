// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '../types';
// Icons are now rendered as text emojis in the visualization

interface TreeVisualizationProps {
  data: TreeNode;
  onNodeEdit: (node: TreeNode) => void;
  onNodeDelete: (node: TreeNode) => void;
  onNodeAdd: (parent: TreeNode) => void;
  onNodeNote: (node: TreeNode) => void;
  onNodeToggle: (node: TreeNode) => void;
  onLevelToggle?: (level: number, expand: boolean) => void;
  highlightedNodeId?: string;
}

const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  data,
  onNodeEdit,
  onNodeDelete,
  onNodeAdd,
  onNodeNote,
  onNodeToggle,
  onLevelToggle,
  highlightedNodeId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [maxDepth, setMaxDepth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Set up container
    svg.attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Initialize zoom only once
    if (!zoomRef.current) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .filter((event) => {
          // Allow zoom with wheel, but not with pinch on mobile
          return !event.ctrlKey && !event.button;
        })
        .on('zoom', (event) => {
          if (gRef.current) {
            d3.select(gRef.current).attr('transform', event.transform);
          }
        });

      svg.call(zoom);
      zoomRef.current = zoom;
    }

    // Initialize or get existing g element
    let g: d3.Selection<SVGGElement, unknown, null, undefined>;
    if (!gRef.current) {
      g = svg.append('g');
      const node = g.node();
      if (node) {
        gRef.current = node;
      }
      g.attr('transform', `translate(${margin.left},${margin.top})`);
    } else {
      g = d3.select(gRef.current);
    }

    // Clear only the content, not the transform
    g.selectAll('*').remove();

    const tree = d3.tree<TreeNode>()
      .size([height, width])
      .nodeSize([30, 200]);

    const hierarchy = d3.hierarchy(data, d => d.expanded ? d.children : undefined);
    const treeData = tree(hierarchy);

    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);
    
    // Calculate max depth for level controls
    const currentMaxDepth = Math.max(...nodes.map(n => n.depth));
    if (currentMaxDepth !== maxDepth) {
      setMaxDepth(currentMaxDepth);
    }

    g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => {
        const parent = d.parent!;
        return `M${d.y},${d.x}C${(d.y + parent.y) / 2},${d.x} ${(d.y + parent.y) / 2},${parent.x} ${parent.y},${parent.x}`;
      })
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', '2px');

    const node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    node.append('circle')
      .attr('r', d => {
        const nodeData = d.data;
        if (highlightedNodeId === nodeData.id) return 12;
        return 8;
      })
      .style('fill', d => {
        const nodeData = d.data;
        if (highlightedNodeId === nodeData.id) return '#ff6b35';
        if (nodeData.type === 'object') return '#ff6b6b';
        if (nodeData.type === 'array') {
          // Different colors for different array types
          if (nodeData.arrayMetadata?.arrayType === 'collection') return '#2ecc71'; // Green for collections
          if (nodeData.arrayMetadata?.arrayType === 'messages') return '#9b59b6'; // Purple for messages
          if (nodeData.arrayMetadata?.arrayType === 'references') return '#3498db'; // Blue for references
          return '#4ecdc4'; // Default teal for generic arrays
        }
        if (nodeData.type === 'string') return '#45b7d1';
        if (nodeData.type === 'number') return '#f9ca24';
        if (nodeData.type === 'boolean') return '#6c5ce7';
        return '#a0a0a0';
      })
      .style('stroke', d => {
        const nodeData = d.data;
        if (highlightedNodeId === nodeData.id) return '#ff3300';
        if (selectedNode?.id === nodeData.id) return '#333';
        return '#fff';
      })
      .style('stroke-width', d => {
        const nodeData = d.data;
        if (highlightedNodeId === nodeData.id) return '6px';
        if (selectedNode?.id === nodeData.id) return '3px';
        return '2px';
      })
      .style('filter', d => {
        const nodeData = d.data;
        if (highlightedNodeId === nodeData.id) return 'drop-shadow(0 0 8px #ff6b35)';
        return 'none';
      });

    // Helper function to calculate text width
    const getTextWidth = (text: string, fontSize: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = `${fontSize} monospace`;
        return context.measureText(text).width;
      }
      return text.length * 7; // fallback estimation
    };

    // Helper function to truncate text intelligently
    const truncateText = (text: string, maxWidth: number, fontSize: string) => {
      if (getTextWidth(text, fontSize) <= maxWidth) return text;

      let truncated = text;
      while (getTextWidth(truncated + '...', fontSize) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      return truncated + '...';
    };

    // Helper function to wrap text into multiple lines
    const wrapText = (text: string, maxWidth: number, fontSize: string) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        if (getTextWidth(testLine, fontSize) <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, truncate it
            lines.push(truncateText(word, maxWidth, fontSize));
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      return lines.slice(0, 3); // Limit to 3 lines max
    };

    node.append('g')
      .attr('class', 'node-text')
      .each(function(d) {
        const nodeData = d.data;
        let displayText = nodeData.name;

        // Enhanced array display
        if (nodeData.type === 'array' && nodeData.arrayMetadata) {
          const metadata = nodeData.arrayMetadata;
          const countText = metadata.itemCount ? `[${metadata.itemCount}]` : '';
          const typeText = metadata.arrayType === 'collection' ? ' (Collection)' :
            metadata.arrayType === 'messages' ? ' (Messages)' :
              metadata.arrayType === 'references' ? ' (References)' : '';
          displayText += ` ${countText}${typeText}`;
        }
        // Enhanced array element display for reference arrays
        else if (nodeData.parent?.arrayMetadata?.itemPattern === '@odata.id' && nodeData.value?.['@odata.id']) {
          displayText = `[${nodeData.name}] → ${nodeData.value['@odata.id']}`;
        }
        // Standard value display
        else if (nodeData.type !== 'object' && nodeData.type !== 'array') {
          displayText += `: ${JSON.stringify(nodeData.value)}`;
        }

        // Dynamic font sizing based on depth and content
        const depth = d.depth;
        const baseFontSize = window.innerWidth <= 768 ? 11 : 12;
        const fontSize = Math.max(baseFontSize - (depth * 0.5), 9);

        // Calculate available space based on tree layout
        const availableWidth = window.innerWidth <= 768 ? 120 : 160;
        const maxTextWidth = availableWidth - 20; // padding

        const textGroup = d3.select(this);
        const isLeftSide = d.children || d.data.children;
        const textAnchor = isLeftSide ? 'end' : 'start';
        const xOffset = isLeftSide ? -13 : 13;

        // Check if text needs wrapping (for very long content)
        if (displayText.length > 40 && nodeData.type === 'string') {
          const lines = wrapText(displayText, maxTextWidth, `${fontSize}px`);
          lines.forEach((line, index) => {
            textGroup.append('text')
              .attr('x', xOffset)
              .attr('dy', `${index * 1.2}em`)
              .style('text-anchor', textAnchor)
              .style('font-family', 'monospace')
              .style('font-size', `${fontSize}px`)
              .style('font-weight', selectedNode?.id === nodeData.id ? 'bold' : 'normal')
              .text(line)
              .attr('title', displayText)
              .style('cursor', 'pointer')
              .on('mouseover', function() {
                d3.select(this).style('fill', '#0066cc');
              })
              .on('mouseout', function() {
                d3.select(this).style('fill', 'inherit');
              });
          });
        } else {
          const finalText = truncateText(displayText, maxTextWidth, `${fontSize}px`);
          textGroup.append('text')
            .attr('x', xOffset)
            .attr('dy', '.35em')
            .style('text-anchor', textAnchor)
            .style('font-family', 'monospace')
            .style('font-size', `${fontSize}px`)
            .style('font-weight', selectedNode?.id === nodeData.id ? 'bold' : 'normal')
            .text(finalText)
            .attr('title', displayText)
            .style('cursor', 'pointer')
            .on('mouseover', function() {
              d3.select(this).style('fill', '#0066cc');
            })
            .on('mouseout', function() {
              d3.select(this).style('fill', 'inherit');
            });
        }
      });

    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(d.data);
      onNodeEdit(d.data); // Trigger selection in parent component
    });

    // Add expand/collapse indicators and double-click handler
    node.filter(d => Boolean(d.data.children && d.data.children.length > 0))
      .each(function(d) {
        const nodeGroup = d3.select(this);
        const isExpanded = d.data.expanded;

        // Add expand/collapse indicator
        nodeGroup.append('text')
          .attr('class', 'expand-indicator')
          .attr('x', 0)
          .attr('y', -15)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', '#666')
          .style('cursor', 'pointer')
          .text(isExpanded ? '−' : '+')
          .on('click', (event) => {
            event.stopPropagation();
            onNodeToggle(d.data);
          });
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        onNodeToggle(d.data);
      });

    svg.on('click', () => {
      setSelectedNode(null);
    });

    // Center the highlighted node in view
    if (highlightedNodeId) {
      const highlightedNode = nodes.find(n => n.data.id === highlightedNodeId);
      if (highlightedNode && zoomRef.current && svg.node()) {
        const transform = d3.zoomTransform(svg.node()!);
        const scale = transform.k;
        const x = -highlightedNode.y * scale + dimensions.width / 2;
        const y = -highlightedNode.x * scale + dimensions.height / 2;

        svg.transition()
          .duration(750)
          .call(
            zoomRef.current.transform,
            d3.zoomIdentity.translate(x, y).scale(scale)
          );
      }
    }

  }, [data, dimensions, onNodeEdit, onNodeDelete, onNodeAdd, onNodeNote, onNodeToggle, highlightedNodeId, selectedNode]);

  // Separate effect for handling node selection UI
  useEffect(() => {
    if (!data || !svgRef.current || !gRef.current) return;

    const g = d3.select(gRef.current);

    // Remove previous actions
    g.selectAll('.node-actions').remove();

    // Update circle styles for selection
    g.selectAll('.node circle')
      .style('stroke', (d: unknown) => {
        const node = d as d3.HierarchyPointNode<TreeNode>;
        return selectedNode?.id === node.data.id ? '#333' : '#fff';
      })
      .style('stroke-width', (d: unknown) => {
        const node = d as d3.HierarchyPointNode<TreeNode>;
        return selectedNode?.id === node.data.id ? '3px' : '2px';
      });

    // Update text styles for selection
    g.selectAll('.node-text text')
      .style('font-weight', (d: unknown) => {
        const node = d as d3.HierarchyPointNode<TreeNode>;
        return selectedNode?.id === node.data.id ? 'bold' : 'normal';
      });

  }, [selectedNode, data]);

  const resetZoom = () => {
    if (zoomRef.current && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity
      );
    }
  };

  return (
    <div className="tree-visualization">
      <svg ref={svgRef} className="tree-svg"></svg>
      <div className="tree-controls">
        <button type="button" className="zoom-reset-btn" onClick={resetZoom}>
          Reset Zoom
        </button>
        
        {onLevelToggle && (
          <div className="level-controls">
            <label htmlFor="level-select">Expand/Collapse Level:</label>
            <select 
              id="level-select"
              onChange={(e) => {
                const action = e.target.value;
                if (action === 'expand-all') {
                  onLevelToggle(-1, true); // -1 indicates all levels
                } else if (action === 'collapse-all') {
                  onLevelToggle(-1, false); // -1 indicates all levels
                } else if (action.startsWith('expand-')) {
                  const level = parseInt(action.replace('expand-', ''));
                  onLevelToggle(level, true);
                } else if (action.startsWith('collapse-')) {
                  const level = parseInt(action.replace('collapse-', ''));
                  onLevelToggle(level, false);
                }
                e.target.value = '';
              }}
              defaultValue=""
            >
              <option value="">Select Action</option>
              <option value="expand-all">Expand All</option>
              <option value="collapse-all">Collapse All</option>
              {Array.from({ length: maxDepth + 1 }, (_, i) => (
                <React.Fragment key={i}>
                  <option value={`expand-${i}`}>Expand Level {i}</option>
                  <option value={`collapse-${i}`}>Collapse Level {i}</option>
                </React.Fragment>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="legend">
        <h4>Node Types</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></span>
            Object
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#2ecc71' }}></span>
            Collection
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#9b59b6' }}></span>
            Messages
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#3498db' }}></span>
            References
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4ecdc4' }}></span>
            Array
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#45b7d1' }}></span>
            String
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f9ca24' }}></span>
            Number
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#6c5ce7' }}></span>
            Boolean
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#a0a0a0' }}></span>
            Null
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualization;