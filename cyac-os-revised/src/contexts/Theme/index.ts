import { ThemeContext, ThemeProvider } from './ThemeContext';
import useTheme from './useTheme';
import { ThemeType, themes } from './themeData';
// Import types explicitly for type-only exports
import type { ThemeProperties } from './themeData';

// Value exports
export {
    ThemeContext,
    ThemeProvider,
    useTheme,
    ThemeType,
    themes
};

// Type-only exports
export type { ThemeProperties };

// Default export
export default ThemeProvider;