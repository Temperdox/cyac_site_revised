import { createContext, useContext } from 'react';

// CRT effects settings interface
export interface CrtEffectsSettings {
    enabled: boolean;
    scanlines: boolean;
    verticalLines: boolean;
    paintLine: boolean;
    vignette: boolean;
    glow: boolean;
    flicker: boolean;
    glitch: boolean;
    curvature: boolean;
    dotPattern: boolean;
}

// Context type
export interface CrtEffectsContextType {
    effects: CrtEffectsSettings;
    toggleEffect: (effectName: keyof CrtEffectsSettings) => void;
    toggleAllEffects: () => void;
}

// Default settings
export const defaultSettings: CrtEffectsSettings = {
    enabled: true,
    scanlines: true,
    verticalLines: true,
    paintLine: true,
    vignette: true,
    glow: true,
    flicker: true,
    glitch: true,
    curvature: true,
    dotPattern: true
};

// Create context for CRT effects
export const CrtEffectsContext = createContext<CrtEffectsContextType>({
    effects: defaultSettings,
    toggleEffect: () => {},
    toggleAllEffects: () => {}
});

// Hook to use CRT effects context
export const useCrtEffects = () => useContext(CrtEffectsContext);