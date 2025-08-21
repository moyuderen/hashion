# 数组转树功能使用指南

## 概述

`hashion` 包现在提供了强大的数组转树功能，可以将扁平的数组数据转换为树形结构，同时提供了丰富的树操作工具函数。

## 安装

```bash
npm install hashion
# 或
pnpm add hashion
```

## 基础用法

### 数组转树 (arrayToTree)

```javascript
import { arrayToTree } from 'hashion'

// 扁平的部门数据
const departments = [
  { id: 1, name: '总公司', parentId: null },
  { id: 2, name: '技术部', parentId: 1 },
  { id: 3, name: '销售部', parentId: 1 },
  { id: 4, name: '前端组', parentId: 2 },
  { id: 5, name: '后端组', parentId: 2 }
]

// 转换为树结构
const tree = arrayToTree(departments)
console.log(tree)
```

输出结果：
```javascript
[
  {
    id: 1,
    name: '总公司',
    parentId: null,
    children: [
      {
        id: 2,
        name: '技术部',
        parentId: 1,
        children: [
          { id: 4, name: '前端组', parentId: 2 },
          { id: 5, name: '后端组', parentId: 2 }
        ]
      },
      {
        id: 3,
        name: '销售部',
        parentId: 1
      }
    ]
  }
]
```

### 自定义字段名

```javascript
import { arrayToTree } from 'hashion'

const data = [
  { key: 'A', parent: null, title: '根节点' },
  { key: 'B', parent: 'A', title: '子节点' }
]

const tree = arrayToTree(data, {
  idField: 'key',          // 使用 'key' 作为ID字段
  parentIdField: 'parent', // 使用 'parent' 作为父ID字段
  childrenField: 'items'   // 使用 'items' 作为子节点字段
})
```

### 树转数组 (treeToArray)

```javascript
import { treeToArray } from 'hashion'

// 将树结构转回扁平数组
const flatArray = treeToArray(tree)
console.log(flatArray)
```

## 高级功能

### 查找节点 (findNodeInTree)

```javascript
import { findNodeInTree } from 'hashion'

// 查找名称包含"技术"的节点
const techNode = findNodeInTree(tree, node => node.name.includes('技术'))
console.log(techNode) // { id: 2, name: '技术部', ... }
```

### 获取节点路径 (getNodePath)

```javascript
import { getNodePath } from 'hashion'

// 获取ID为4的节点的完整路径
const path = getNodePath(tree, 4)
const pathNames = path.map(node => node.name).join(' → ')
console.log(pathNames) // "总公司 → 技术部 → 前端组"
```

### 遍历树 (traverseTree)

```javascript
import { traverseTree } from 'hashion'

// 遍历所有节点
traverseTree(tree, (node, level, parent) => {
  const indent = '  '.repeat(level)
  console.log(`${indent}${node.name} (层级: ${level})`)
})
```

## 配置选项

### ArrayToTreeOptions

```typescript
interface ArrayToTreeOptions {
  idField?: string        // ID字段名，默认 'id'
  parentIdField?: string  // 父ID字段名，默认 'parentId'
  childrenField?: string  // 子节点字段名，默认 'children'
  rootParentId?: any     // 根节点的父ID值，默认 null
}
```

### TreeToArrayOptions

```typescript
interface TreeToArrayOptions {
  childrenField?: string  // 子节点字段名，默认 'children'
  keepChildren?: boolean  // 是否保留children字段，默认 false
}
```

## 类型定义

```typescript
interface TreeNode<T = any> {
  id: string | number
  parentId?: string | number | null
  children?: TreeNode<T>[]
  [key: string]: any
}
```

## 实际应用场景

### 1. 组织架构管理
```javascript
const employees = [
  { id: 1, name: '张三', position: 'CEO', parentId: null },
  { id: 2, name: '李四', position: 'CTO', parentId: 1 },
  { id: 3, name: '王五', position: '前端工程师', parentId: 2 }
]

const orgChart = arrayToTree(employees)
```

### 2. 菜单系统
```javascript
const menuItems = [
  { id: 1, title: '系统管理', icon: 'settings', parentId: null },
  { id: 2, title: '用户管理', url: '/users', parentId: 1 },
  { id: 3, title: '角色管理', url: '/roles', parentId: 1 }
]

const menuTree = arrayToTree(menuItems)
```

### 3. 分类系统
```javascript
const categories = [
  { id: 1, name: '电子产品', parentId: null },
  { id: 2, name: '手机', parentId: 1 },
  { id: 3, name: 'iPhone', parentId: 2 },
  { id: 4, name: 'Android', parentId: 2 }
]

const categoryTree = arrayToTree(categories)
```

## 性能特点

- **高效算法**: 使用Map进行O(1)查找，整体时间复杂度为O(n)
- **内存优化**: 避免深度递归，适合处理大量数据
- **类型安全**: 完整的TypeScript类型支持
- **错误处理**: 完善的错误处理和边界情况处理

## 错误处理

所有函数都包含完善的错误处理：

```javascript
try {
  const tree = arrayToTree('not an array')
} catch (error) {
  console.log(error.message) // "Input must be an array"
}
```

## 注意事项

1. 确保数组中每个对象都有唯一的ID
2. 父子关系要正确，避免循环引用
3. 如果找不到父节点，该节点会被视为根节点
4. 支持多根节点的树结构

## 在线演示

打开 `example/tree-demo.html` 可以在浏览器中体验完整的功能演示。