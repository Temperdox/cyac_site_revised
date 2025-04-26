import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

/**
 * Hook for using the theme context
 */
const useTheme = () => useContext(ThemeContext);

export default useTheme;