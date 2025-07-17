# JSON Tree Editor

A powerful, interactive JSON tree visualization and editing tool built with React, D3.js, and TypeScript. This application allows users to upload, visualize, edit, and export JSON data through an intuitive tree interface.

## ✨ Features

### 🌳 Interactive Tree Visualization
- **D3.js-powered tree layout** with smooth animations and zooming
- **Dynamic node sizing** and intelligent text handling for large datasets
- **Zoom and pan** functionality with mouse wheel and drag controls
- **Expand/collapse nodes** with visual indicators (+/-)
- **Level-based expand/collapse** controls for efficient navigation
- **Smart text wrapping** and truncation for long content with tooltips

### 🎨 Rich Node Types & Visual Indicators
- **Object nodes** (red) - `{}` with expandable properties
- **Array nodes** with enhanced metadata and type detection:
  - Collections (green) - `[]` for standard arrays
  - Messages (purple) - specialized message arrays
  - References (blue) - @odata.id reference arrays
- **String nodes** (blue) - `"text"` with value preview
- **Number nodes** (yellow) - `123` with numeric validation
- **Boolean nodes** (purple) - `true/false` toggle editing
- **Null nodes** (gray) - `null` values

### 📝 Advanced Editing Capabilities
- **Node editing** with type conversion and validation
- **Add/delete nodes** with full undo/redo support
- **Note system** for documentation and annotations
- **Array operations** for specialized data types (OData, messages)
- **Value validation** and error handling for different data types
- **Bulk operations** for efficient large-scale editing

### 🔍 Powerful Search & Navigation
- **Multi-type search** (key, value, note) with real-time results
- **Search navigation** with next/previous controls
- **Auto-expand** parent nodes for found items
- **Search result highlighting** in tree visualization
- **Path-based navigation** for deep data structures

### 🔄 State Management & History
- **Full undo/redo** support with unlimited action history
- **Persistent state** during editing sessions
- **Action tracking** for all operations (add, edit, delete, toggle)
- **State validation** and error recovery
- **Export history** with change tracking

### 📱 Responsive Design
- **Mobile-friendly** interface with touch support
- **Collapsible panels** for smaller screens
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** controls and gestures

### 🚀 Additional Features
- **JSON import/export** with validation and error handling
- **Copy to clipboard** functionality
- **Note inclusion** in exports
- **Array count synchronization** for metadata
- **Automated testing** suite with comprehensive coverage
- **Performance optimizations** for large datasets

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Visualization**: D3.js v7 for tree rendering
- **Styling**: CSS3 with CSS Variables and responsive design
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Create React App with TypeScript template
- **Testing**: Custom test runner with automated validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/json-tree-editor.git
   cd json-tree-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Basic Operations
1. **Upload JSON**: Click "Import JSON" or drag-and-drop a file
2. **Navigate**: Use zoom/pan or expand/collapse nodes
3. **Edit**: Click nodes to select and edit in the property panel
4. **Search**: Use the search tab to find specific data
5. **Export**: Save your modified JSON with optional notes

### Advanced Features

#### Level-based Operations
Use the dropdown in tree controls to:
- **Expand All** - Open all nodes for complete overview
- **Collapse All** - Close all nodes for clean view
- **Expand/Collapse Level X** - Control specific tree levels

#### Array Operations
For specialized arrays:
- **Collections**: Add references, validate @odata.id patterns
- **Messages**: Add structured message objects
- **References**: Manage OData reference arrays
- **Count Sync**: Synchronize array counts with parent properties

#### Text Handling
The editor automatically:
- Truncates long text with ellipsis and tooltips
- Wraps text across multiple lines for readability
- Scales font size based on tree depth
- Provides hover effects for better UX

### Property Panel Tabs
- **Actions**: File operations, undo/redo controls
- **Search**: Multi-type search with navigation
- **Node**: Edit selected node properties
- **Export**: Download options and preview

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── TreeVisualization.tsx  # Main D3 tree component
│   ├── PropertyPanel.tsx      # Node editing panel
│   └── FileUpload.tsx         # JSON upload component
├── hooks/              # Custom React hooks
│   └── useTreeData.ts  # Tree state management
├── types/              # TypeScript definitions
│   └── index.ts        # Core data types
├── utils/              # Utility functions
│   ├── jsonParser.ts   # JSON to tree conversion
│   └── manualTests.ts  # Testing utilities
└── App.tsx             # Main application component
```

### Key Components

#### TreeVisualization
- D3.js integration for interactive tree rendering
- Mouse and touch event handling
- Zoom/pan functionality with boundaries
- Dynamic text rendering with performance optimization

#### PropertyPanel
- Multi-tab interface for different operations
- Form handling with validation
- Search functionality with real-time results
- Export options with preview

#### useTreeData Hook
- Centralized state management with Redux-like actions
- Undo/redo implementation with action history
- Tree manipulation functions
- Data validation and error handling

### Testing
Run the automated test suite:
```bash
# In browser console
window.runManualTests()

# Or click "🧪 Run Tests" in the header
```

**Test Coverage:**
- JSON parsing and tree generation
- Node operations (add, edit, delete, toggle)
- Undo/redo functionality
- Search and navigation
- State management and validation
- Edge cases and error handling

## 🎨 Customization

### Themes
The application uses CSS variables for easy theming:
```css
:root {
  --primary-color: #ff6b35;
  --secondary-color: #4ecdc4;
  --text-color: #333;
  --background-color: #f5f5f5;
  --node-object: #ff6b6b;
  --node-array: #4ecdc4;
  --node-string: #45b7d1;
  --node-number: #f9ca24;
  --node-boolean: #6c5ce7;
  --node-null: #a0a0a0;
}
```

### Node Styling
Customize node appearance in `TreeVisualization.tsx`:
```typescript
const nodeStyles = {
  radius: 8,
  strokeWidth: 2,
  fontSize: 12,
  fontFamily: 'monospace'
};
```

## 🚀 Performance

### Optimizations
- **Efficient rendering**: Only update changed nodes
- **Text measurement caching**: Avoid repeated canvas operations
- **Debounced search**: Prevent excessive re-renders
- **Memory management**: Clean up unused D3 elements
- **Lazy loading**: Load tree sections on demand

### Best Practices
- Use level controls for large datasets
- Leverage search for quick navigation
- Collapse unnecessary branches
- Regular cleanup of unused nodes

## 🧪 Testing

### Test Suite Features
- **Automated validation** of core functionality
- **Edge case testing** for error conditions
- **Performance benchmarking** for large datasets
- **User interaction simulation**
- **State consistency checks**

### Running Tests
```bash
# Manual test runner (in browser)
window.runManualTests()

# Future: Jest integration
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use semantic commit messages
- Maintain backward compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js** for powerful data visualization capabilities
- **React** for component-based architecture
- **TypeScript** for type safety and developer experience
- **Lucide React** for beautiful, consistent icons
- **Create React App** for development setup

## 🐛 Known Issues

- Large JSON files (>5MB) may experience performance issues
- Mobile gesture support needs refinement
- Some edge cases in undo/redo for complex nested operations
- Text rendering performance with very deep trees

## 🔮 Future Enhancements

- [ ] **JSON Schema validation** and enforcement
- [ ] **Plugin system** for custom node types
- [ ] **Real-time collaboration** features
- [ ] **Data import** from APIs and databases
- [ ] **Custom themes** and layout options
- [ ] **Performance profiling** tools
- [ ] **Export to other formats** (XML, CSV, YAML)
- [ ] **Advanced search** with regex support
- [ ] **Keyboard shortcuts** for power users
- [ ] **Accessibility improvements**

## 📞 Support

For questions, issues, or contributions:
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/json-tree-editor/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/json-tree-editor/discussions)
- 📧 **Email**: support@jsontreeeditor.com

---

**Built with ❤️ for the developer community**