"use client";

import { initializeComponents } from './components';
import PluginRegistry from './PluginRegistry';

// Initialize all components
// Make sure this runs when the module is first loaded
import { registerBuiltInComponents } from './components/BuiltInComponents';
import { registerCustomComponents } from './components/CustomComponents';
registerBuiltInComponents();
registerCustomComponents();

// Re-export types and registry
export * from './types';
export { default as PluginRegistry } from './PluginRegistry';
export * from './components/BuiltInComponents';
export * from './components/CustomComponents';

// Export DataGrid as default
export { default } from './DataGrid';