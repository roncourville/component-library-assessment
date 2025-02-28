import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { CellComponentProps } from '../types';
import PluginRegistry from '../PluginRegistry';
import { Input } from "@workspace/ui/components/input";

/**
 * Example of a custom Avatar component that displays a user's avatar
 */
const CustomAvatarRenderer = ({ value }: CellComponentProps<{ name: string; image?: string }>) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={value.image} alt={value.name} />
        <AvatarFallback>{value.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
      </Avatar>
      <span>{value.name}</span>
    </div>
  );
};

/**
 * Example of a custom editor for a color field that shows a color picker
 */
const ColorValueRenderer = ({ value }: CellComponentProps<string>) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded-full border border-gray-200" 
        style={{ backgroundColor: value }}
      />
      <span>{value}</span>
    </div>
  );
};

const ColorValueEditor = ({ value, onChange }: CellComponentProps<string>) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-8 h-8 rounded"
      />
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-24"
      />
    </div>
  );
};

/**
 * Register all custom components with the PluginRegistry
 */
export function registerCustomComponents() {
  // Register custom avatar component (view-only)
  PluginRegistry.registerComponent('custom-avatar', CustomAvatarRenderer);
  
  // Register color value component (with editor)
  PluginRegistry.registerComponent('color-value', ColorValueRenderer, ColorValueEditor);
}

// Export individual components for custom use
export {
  CustomAvatarRenderer,
  ColorValueRenderer,
  ColorValueEditor
};