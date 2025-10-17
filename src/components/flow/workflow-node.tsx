/**
 * @deprecated 此文件已废弃，请使用新的独立节点文件
 * - ModuleNode: 从 './module-node' 导入
 * - FunctionNode: 从 './function-node' 导入
 * 
 * 保留此文件仅用于向后兼容
 */

// 重新导出新的节点组件
export { ModuleNode, type ModuleNodeData } from './module-node'
export { FunctionNode, type FunctionNodeData } from './function-node'

// 向后兼容的默认导出
export { ModuleNode as WorkflowNode } from './module-node'

