// Export built-in components
export * from './BuiltInComponents';

// Export custom components
export * from './CustomComponents';

// Export CellRenderer
export { CellRenderer } from '../cell-renderer';

// Export PluginRegistry
export { default as PluginRegistry } from '../PluginRegistry';

// Main initialization function for all components
export function initializeComponents() {
  // Import and register all components
  const { registerBuiltInComponents } = require('./BuiltInComponents');
  const { registerCustomComponents } = require('./CustomComponents');
  
  // Register all components
  registerBuiltInComponents();
  registerCustomComponents();
}