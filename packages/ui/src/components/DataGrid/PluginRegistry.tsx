import React from 'react';
import { CellComponentProps } from './types';

type RendererFunction = (props: CellComponentProps) => JSX.Element;
type EditorFunction = (props: CellComponentProps) => JSX.Element;

/**
 * PluginRegistry manages component registration for the DataGrid.
 * It allows registering custom cell renderers and editors that can be
 * referenced by name in column configurations.
 */
class PluginRegistry {
  private static components: Record<string, { 
    view: RendererFunction; 
    edit?: EditorFunction 
  }> = {};

  /**
   * Register a component pair (renderer and editor) by name
   * @param name Unique identifier for the component
   * @param view Component for displaying the cell value (view mode)
   * @param edit Optional component for editing the cell value
   */
  static registerComponent(name: string, view: RendererFunction, edit?: EditorFunction) {
    this.components[name] = { view, edit };
  }

  /**
   * Get a component by name and mode
   * @param name Component identifier
   * @param mode Whether to get the view or edit component
   * @returns The requested component function or null if not found
   */
  static getComponent(name: string, mode: "view" | "edit"): RendererFunction | null {
    if (mode === "view") {
      return this.components[name]?.view || null;
    } else {
      return this.components[name]?.edit || null;
    }
  }

  /**
   * Check if a component exists in the registry
   * @param name Component identifier
   * @param mode Component mode to check
   * @returns True if the component exists
   */
  static hasComponent(name: string, mode: "view" | "edit"): boolean {
    if (mode === "view") {
      return !!this.components[name]?.view;
    } else {
      return !!this.components[name]?.edit;
    }
  }

  /**
   * Get all registered component names
   * @returns Array of registered component names
   */
  static getRegisteredComponents(): string[] {
    return Object.keys(this.components);
  }
}

export default PluginRegistry;