import { useContext } from 'react';
import { FileSystemContext } from './FileSystemContext.tsx';

/**
 * Hook for using the file system context
 */
export const useFileSystem = () => useContext(FileSystemContext);

export default useFileSystem;