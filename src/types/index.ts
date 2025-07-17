// JSON value types
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}

// Node action data structure
export interface NodeActionData {
  name?: string;
  value?: JsonValue;
  type?: TreeNode['type'];
  note?: string;
  expanded?: boolean;
  parent?: TreeNode | null;
  id?: string;
  children?: TreeNode[];
}

// Form editing state
export interface EditingNodeState {
  name: string;
  value: string;
  type: TreeNode['type'];
  note: string;
}

export interface TreeNode {
  id: string;
  name: string;
  value?: JsonValue;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: TreeNode[];
  parent?: TreeNode | null;
  expanded?: boolean;
  note?: string;
  x?: number;
  y?: number;
  depth?: number;
  // Array metadata for enhanced display
  arrayMetadata?: {
    arrayType: 'collection' | 'messages' | 'references' | 'generic';
    itemCount?: number;
    countProperty?: string; // e.g., 'Members@odata.count'
    itemPattern?: string; // e.g., for @odata.id references
  };
}

export interface JsonTreeData {
  nodes: TreeNode[];
  links: Array<{
    source: TreeNode;
    target: TreeNode;
  }>;
}

export interface NodeAction {
  type: 'add' | 'edit' | 'delete' | 'note' | 'toggle';
  nodeId: string;
  data?: NodeActionData;
  previousData?: NodeActionData;
}