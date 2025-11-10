import { Injectable } from '@angular/core';

export interface PropertyMapping {
  entity: string;
  property: string;
  csvHeader: string;
}

export interface TreeNode {
  name: string;
  fullPath: string;
  properties: Array<{
    property: string;
    csvHeader: string;
  }>;
  children: TreeNode[];
}

@Injectable({
  providedIn: 'root'
})
export class PropertyMappingService {

  /**
   * Maps property mappings array to a hierarchical tree structure
   * @param propertyMappings - Array of property mapping objects
   * @returns Root tree node containing the hierarchical structure
   */
  mapToTree(propertyMappings: PropertyMapping[]): TreeNode[] {
    const entityMap = new Map<string, TreeNode>();
    
    // First pass: create all entities and group properties
    propertyMappings.forEach(mapping => {
      const entityPath = mapping.entity;
      
      if (!entityMap.has(entityPath)) {
        const pathParts = entityPath.split('.');
        const entityName = pathParts[pathParts.length - 1];
        
        entityMap.set(entityPath, {
          name: entityName,
          fullPath: entityPath,
          properties: [],
          children: []
        });
      }
      
      // Add property to the entity
      entityMap.get(entityPath)!.properties.push({
        property: mapping.property,
        csvHeader: mapping.csvHeader
      });
    });
    
    // Second pass: build the hierarchy
    const rootNodes: TreeNode[] = [];
    const processedEntities = new Set<string>();
    
    // Sort entities by depth (number of dots) to process parents before children
    const sortedEntities = Array.from(entityMap.keys()).sort((a, b) => {
      return a.split('.').length - b.split('.').length;
    });
    
    sortedEntities.forEach(entityPath => {
      if (processedEntities.has(entityPath)) return;
      
      const node = entityMap.get(entityPath)!;
      const pathParts = entityPath.split('.');
      
      if (pathParts.length === 1) {
        // Root level entity
        rootNodes.push(node);
      } else {
        // Find parent entity
        const parentPath = pathParts.slice(0, -1).join('.');
        const parentNode = entityMap.get(parentPath);
        
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // If parent doesn't exist, treat as root (fallback)
          rootNodes.push(node);
        }
      }
      
      processedEntities.add(entityPath);
    });
    
    // Sort children recursively for consistent ordering
    this.sortTreeNodes(rootNodes);
    
    return rootNodes;
  }
  
  /**
   * Recursively sorts tree nodes and their children by name
   * @param nodes - Array of tree nodes to sort
   */
  private sortTreeNodes(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children.length > 0) {
        this.sortTreeNodes(node.children);
      }
    });
  }
  
  /**
   * Pretty prints the tree structure for debugging
   * @param nodes - Root nodes of the tree
   * @param indent - Current indentation level
   */
  printTree(nodes: TreeNode[], indent: string = ''): void {
    nodes.forEach(node => {
      node.properties.forEach(prop => {
      });
      if (node.children.length > 0) {
        this.printTree(node.children, indent + '    ');
      }
    });
  }
  
  /**
   * Flattens the tree back to a list of entities with their full paths
   * @param nodes - Root nodes of the tree
   * @returns Flattened array of entities
   */
  flattenTree(nodes: TreeNode[]): string[] {
    const result: string[] = [];
    
    const traverse = (node: TreeNode) => {
      result.push(node.fullPath);
      node.children.forEach(child => traverse(child));
    };
    
    nodes.forEach(node => traverse(node));
    return result;
  }
}