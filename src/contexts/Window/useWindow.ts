import { useContext } from 'react';
import { WindowContext } from './WindowContext';

/**
 * Hook for using the window management context
 */
export const useWindow = () => useContext(WindowContext);

export default useWindow;