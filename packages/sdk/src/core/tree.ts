import type { TreeNode, ArrayToTreeOptions, TreeToArrayOptions } from '../types/tree'

/**
 * 将扁平数组转换为树形结构
 * @param array 扁平数组
 * @param options 配置选项
 * @returns 树形结构数组
 */
export function arrayToTree<T extends TreeNode>(
  array: T[],
  options: ArrayToTreeOptions = {}
): TreeNode<T>[] {
  const {
    idField = 'id',
    parentIdField = 'parentId',
    childrenField = 'children',
    rootParentId = null
  } = options

  if (!Array.isArray(array)) {
    throw new Error('Input must be an array')
  }

  // 创建节点映射表，用于快速查找
  const nodeMap = new Map<string | number, TreeNode<T>>()
  const roots: TreeNode<T>[] = []

  // 第一步：创建所有节点的副本并建立映射
  array.forEach(item => {
    const node: TreeNode<T> = { ...item }
    nodeMap.set(item[idField], node)
  })

  // 第二步：建立父子关系
  array.forEach(item => {
    const node = nodeMap.get(item[idField])!
    const parentId = item[parentIdField]

    if (parentId === rootParentId || parentId === undefined) {
      // 根节点
      roots.push(node)
    } else {
      // 子节点
      const parent = nodeMap.get(parentId)
      if (parent) {
        if (!parent[childrenField]) {
          parent[childrenField] = []
        }
        parent[childrenField].push(node)
      } else {
        // 找不到父节点，视为根节点
        roots.push(node)
      }
    }
  })

  return roots
}

/**
 * 将树形结构转换为扁平数组
 * @param tree 树形结构数组
 * @param options 配置选项
 * @returns 扁平数组
 */
export function treeToArray<T extends TreeNode>(
  tree: T[],
  options: TreeToArrayOptions = {}
): T[] {
  const {
    childrenField = 'children',
    keepChildren = false
  } = options

  if (!Array.isArray(tree)) {
    throw new Error('Input must be an array')
  }

  const result: T[] = []

  function traverse(nodes: T[]) {
    nodes.forEach(node => {
      const item = { ...node }
      
      // 处理子节点
      if (item[childrenField] && Array.isArray(item[childrenField])) {
        const children = item[childrenField] as T[]
        
        if (!keepChildren) {
          delete item[childrenField]
        }
        
        result.push(item)
        traverse(children)
      } else {
        result.push(item)
      }
    })
  }

  traverse(tree)
  return result
}

/**
 * 在树中查找节点
 * @param tree 树形结构数组
 * @param predicate 查找条件函数
 * @param childrenField 子节点字段名
 * @returns 找到的节点或 undefined
 */
export function findNodeInTree<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenField = 'children'
): T | undefined {
  for (const node of tree) {
    if (predicate(node)) {
      return node
    }
    
    if (node[childrenField] && Array.isArray(node[childrenField])) {
      const found = findNodeInTree(node[childrenField], predicate, childrenField)
      if (found) {
        return found
      }
    }
  }
  
  return undefined
}

/**
 * 获取节点在树中的路径
 * @param tree 树形结构数组
 * @param targetId 目标节点ID
 * @param idField ID字段名
 * @param childrenField 子节点字段名
 * @returns 从根到目标节点的路径数组
 */
export function getNodePath<T extends TreeNode>(
  tree: T[],
  targetId: string | number,
  idField = 'id',
  childrenField = 'children'
): T[] {
  function findPath(nodes: T[], path: T[] = []): T[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node]
      
      if (node[idField] === targetId) {
        return currentPath
      }
      
      if (node[childrenField] && Array.isArray(node[childrenField])) {
        const found = findPath(node[childrenField], currentPath)
        if (found) {
          return found
        }
      }
    }
    
    return null
  }
  
  return findPath(tree) || []
}

/**
 * 遍历树的所有节点
 * @param tree 树形结构数组
 * @param callback 遍历回调函数
 * @param childrenField 子节点字段名
 */
export function traverseTree<T extends TreeNode>(
  tree: T[],
  callback: (node: T, level: number, parent?: T) => void,
  childrenField = 'children'
): void {
  function traverse(nodes: T[], level = 0, parent?: T) {
    nodes.forEach(node => {
      callback(node, level, parent)
      
      if (node[childrenField] && Array.isArray(node[childrenField])) {
        traverse(node[childrenField], level + 1, node)
      }
    })
  }
  
  traverse(tree)
}