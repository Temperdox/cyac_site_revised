import { useContext } from 'react';
import { CommandContext } from './CommandContext.tsx';

/**
 * Hook for using the command context
 */
export const useCommand = () => useContext(CommandContext);

export default useCommand;