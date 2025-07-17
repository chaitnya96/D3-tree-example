import { TreeNode, JsonValue, JsonObject, JsonArray } from '../types';

export const parseJsonToTree = (jsonData: JsonValue, parentId = ''): TreeNode => {
  const generateId = (parent: string, key: string | number) =>
    parent ? `${parent}.${key}` : key.toString();

  const getNodeType = (value: JsonValue): TreeNode['type'] => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value as TreeNode['type'];
  };

  const detectArrayType = (key: string, value: JsonArray, parentValue?: JsonValue): TreeNode['arrayMetadata'] => {
    // Detect Redfish collection patterns
    if (key === 'Members' && Array.isArray(value) && value.length > 0) {
      const hasODataId = value.every(item => item && typeof item === 'object' && '@odata.id' in item);
      if (hasODataId) {
        const countProperty = `${key}@odata.count`;
        const itemCount = parentValue && typeof parentValue === 'object' && parentValue !== null && countProperty in parentValue
          ? (parentValue as JsonObject)[countProperty]
          : value.length;
        return {
          arrayType: 'collection',
          itemCount: typeof itemCount === 'number' ? itemCount : value.length,
          countProperty,
          itemPattern: '@odata.id'
        };
      }
    }

    // Detect message arrays
    if (key === '@Message.ExtendedInfo' && Array.isArray(value) && value.length > 0) {
      const hasOemStructure = value.some(item => item && typeof item === 'object' && 'Oem' in item);
      if (hasOemStructure) {
        return {
          arrayType: 'messages',
          itemCount: value.length
        };
      }
    }

    // Detect reference arrays (arrays of objects with @odata.id)
    if (Array.isArray(value) && value.length > 0 && value.every(item => item && typeof item === 'object' && '@odata.id' in item)) {
      return {
        arrayType: 'references',
        itemCount: value.length,
        itemPattern: '@odata.id'
      };
    }

    // Generic array
    return {
      arrayType: 'generic',
      itemCount: value.length
    };
  };

  const createNode = (key: string | number, value: JsonValue, parent = '', parentValue?: JsonValue): TreeNode => {
    const id = generateId(parent, key);
    const type = getNodeType(value);

    const node: TreeNode = {
      id,
      name: key.toString(),
      value,
      type,
      expanded: true,
      children: []
    };

    // Add array metadata for arrays
    if (type === 'array' && Array.isArray(value)) {
      node.arrayMetadata = detectArrayType(key.toString(), value, parentValue);
    }

    if (type === 'object' && value !== null) {
      node.children = Object.entries(value as JsonObject).map(([k, v]) => {
        const childNode = createNode(k, v, id, value);
        childNode.parent = node;
        return childNode;
      });
    } else if (type === 'array') {
      node.children = (value as JsonArray).map((item: JsonValue, index: number) => {
        const childNode = createNode(index, item, id, value);
        childNode.parent = node;
        return childNode;
      });
    }

    return node;
  };

  return createNode('root', jsonData);
};

export const validateJson = (jsonString: string): { valid: boolean; data?: JsonValue; error?: string } => {
  try {
    const data = JSON.parse(jsonString);
    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format'
    };
  }
};

export const treeToJson = (node: TreeNode): JsonValue => {
  if (node.type === 'object' && node.children) {
    const result: JsonObject = {};
    node.children.forEach(child => {
      result[child.name] = treeToJson(child);
    });
    return result;
  } else if (node.type === 'array' && node.children) {
    return node.children.map(child => treeToJson(child));
  } else {
    return node.value ?? null;
  }
};