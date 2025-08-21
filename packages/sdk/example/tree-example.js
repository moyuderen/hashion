import { arrayToTree, treeToArray, findNodeInTree, getNodePath, traverseTree } from '../dist/index.js'

// 示例数据：扁平的部门数组
const departments = [
  { id: 1, name: '总公司', parentId: null },
  { id: 2, name: '技术部', parentId: 1 },
  { id: 3, name: '销售部', parentId: 1 },
  { id: 4, name: '前端组', parentId: 2 },
  { id: 5, name: '后端组', parentId: 2 },
  { id: 6, name: '华北区', parentId: 3 },
  { id: 7, name: '华南区', parentId: 3 },
  { id: 8, name: 'React团队', parentId: 4 },
  { id: 9, name: 'Vue团队', parentId: 4 }
]

console.log('=== 数组转树示例 ===')

// 1. 基础数组转树
console.log('\n1. 基础数组转树:')
const tree = arrayToTree(departments)
console.log(JSON.stringify(tree, null, 2))

// 2. 自定义字段名的数组转树
console.log('\n2. 自定义字段名示例:')
const customData = [
  { key: 'A', parent: null, title: '根节点A' },
  { key: 'B', parent: 'A', title: '子节点B' },
  { key: 'C', parent: 'A', title: '子节点C' },
  { key: 'D', parent: 'B', title: '孙节点D' }
]

const customTree = arrayToTree(customData, {
  idField: 'key',
  parentIdField: 'parent',
  childrenField: 'items'
})
console.log(JSON.stringify(customTree, null, 2))

// 3. 树转数组
console.log('\n3. 树转数组:')
const flatArray = treeToArray(tree)
console.log('扁平化后的数组:', flatArray.map(item => ({ id: item.id, name: item.name, parentId: item.parentId })))

// 4. 在树中查找节点
console.log('\n4. 查找节点示例:')
const foundNode = findNodeInTree(tree, node => node.name === '前端组')
console.log('找到的节点:', foundNode ? { id: foundNode.id, name: foundNode.name } : '未找到')

// 5. 获取节点路径
console.log('\n5. 获取节点路径:')
const path = getNodePath(tree, 8) // React团队的路径
console.log('React团队的路径:', path.map(node => node.name).join(' -> '))

// 6. 遍历树
console.log('\n6. 遍历树结构:')
traverseTree(tree, (node, level, parent) => {
  const indent = '  '.repeat(level)
  const parentName = parent ? parent.name : '根'
  console.log(`${indent}${node.name} (层级: ${level}, 父节点: ${parentName})`)
})

// 7. 复杂场景：多根节点
console.log('\n7. 多根节点示例:')
const multiRootData = [
  { id: 1, name: '公司A', parentId: null },
  { id: 2, name: '公司B', parentId: null },
  { id: 3, name: '部门A1', parentId: 1 },
  { id: 4, name: '部门B1', parentId: 2 },
  { id: 5, name: '团队A1-1', parentId: 3 }
]

const multiRootTree = arrayToTree(multiRootData)
console.log('多根节点树结构:')
multiRootTree.forEach((root, index) => {
  console.log(`根节点 ${index + 1}:`, root.name)
  traverseTree([root], (node, level) => {
    if (level > 0) {
      const indent = '  '.repeat(level)
      console.log(`${indent}${node.name}`)
    }
  })
})

// 8. 错误处理示例
console.log('\n8. 错误处理示例:')
try {
  arrayToTree('not an array')
} catch (error) {
  console.log('捕获错误:', error.message)
}

try {
  treeToArray('not an array')
} catch (error) {
  console.log('捕获错误:', error.message)
}