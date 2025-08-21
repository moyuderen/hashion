/**
 * 树节点的基础接口
 */
export interface TreeNode<T = any> {
  id: string | number
  parentId?: string | number | null
  children?: TreeNode<T>[]
  [key: string]: any
}

/**
 * 数组转树的配置选项
 */
export interface ArrayToTreeOptions {
  /** 节点ID字段名，默认为 'id' */
  idField?: string
  /** 父节点ID字段名，默认为 'parentId' */
  parentIdField?: string
  /** 子节点字段名，默认为 'children' */
  childrenField?: string
  /** 根节点的父ID值，默认为 null */
  rootParentId?: string | number | null
}

/**
 * 树转数组的配置选项
 */
export interface TreeToArrayOptions {
  /** 子节点字段名，默认为 'children' */
  childrenField?: string
  /** 是否保留children字段，默认为 false */
  keepChildren?: boolean
}