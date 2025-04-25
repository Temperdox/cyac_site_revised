import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { FileSystemItem, FileSystemContextType, FileType } from './fileSystemTypes.ts';
import { getItemAtPath, updateItemInFileSystem, searchFileSystem } from './fileSystemUtils.ts';
import { initialFileSystem } from './initialFileSystem.ts';

// Default context
const defaultContext: FileSystemContextType = {
    fileSystem: [],
    currentPath: '/home',
    isLoggedIn: false,
    navigateTo: () => false,
    readFile: () => null,
    listDirectory: () => [],
    getItemAtPath: () => null,
    createDirectory: () => false,
    createFile: () => false,
    updateFile: () => false,
    deleteItem: () => false,
    searchFileSystem: () => [],
    login: () => false,
    logout: () => {}
};

// Create context
export const FileSystemContext = createContext<FileSystemContextType>(defaultContext);

// Provider props
interface FileSystemProviderProps {
    children: ReactNode;
}

// Provider component
export const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ children }) => {
    // State
    const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(initialFileSystem);
    const [currentPath, setCurrentPath] = useState<string>('/home');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Load file system from localStorage if available
    useEffect(() => {
        const savedFileSystem = localStorage.getItem('cyberacme_filesystem');
        if (savedFileSystem) {
            try {
                setFileSystem(JSON.parse(savedFileSystem));
            } catch (error) {
                console.error("Failed to load file system from localStorage:", error);
            }
        }

        const savedLoggedIn = localStorage.getItem('cyberacme_logged_in');
        if (savedLoggedIn) {
            setIsLoggedIn(savedLoggedIn === 'true');
        }
    }, []);

    // Save file system to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('cyberacme_filesystem', JSON.stringify(fileSystem));
    }, [fileSystem]);

    // Save login state when it changes
    useEffect(() => {
        localStorage.setItem('cyberacme_logged_in', isLoggedIn.toString());
    }, [isLoggedIn]);

    // Get item at a path
    const getItemAtPathWrapper = (path: string): FileSystemItem | null => {
        return getItemAtPath(fileSystem, path);
    };

    // Navigate to a path
    const navigateTo = (path: string): boolean => {
        const item = getItemAtPathWrapper(path);
        if (item && item.type === FileType.Directory) {
            setCurrentPath(path);
            return true;
        }
        return false;
    };

    // Read file content
    const readFile = (path: string): string | null => {
        const item = getItemAtPathWrapper(path);

        // Check if item exists, is a file, and is accessible
        if (item && item.type !== FileType.Directory) {
            // Check for restricted access
            if (item.restricted && !isLoggedIn) {
                return "ACCESS DENIED: You need to be logged in to access this file.";
            }

            return item.content || null;
        }

        return null;
    };

    // List directory contents
    const listDirectory = (path: string): FileSystemItem[] => {
        const item = getItemAtPathWrapper(path);

        if (item && item.type === FileType.Directory) {
            // If directory is restricted and user not logged in, show access denied
            if (item.restricted && !isLoggedIn) {
                return [
                    {
                        name: 'ACCESS_DENIED',
                        type: FileType.File,
                        content: 'You need to be logged in to access this directory.'
                    }
                ];
            }

            // Return children or empty array if no children
            return item.children || [];
        }

        return [];
    };

    // Create directory
    const createDirectory = (path: string, name: string): boolean => {
        const parentItem = getItemAtPathWrapper(path);

        if (parentItem && parentItem.type === FileType.Directory) {
            // Check if directory is restricted and user not logged in
            if (parentItem.restricted && !isLoggedIn) {
                return false;
            }

            // Check if item with same name already exists
            if (parentItem.children?.some(item => item.name === name)) {
                return false;
            }

            // Create new directory
            const newDir: FileSystemItem = {
                name,
                type: FileType.Directory,
                children: []
            };

            // Update file system
            setFileSystem(prev => {
                const newFileSystem = [...prev];
                updateItemInFileSystem(newFileSystem, path, (item) => {
                    if (!item.children) {
                        item.children = [];
                    }
                    item.children.push(newDir);
                    return item;
                });
                return newFileSystem;
            });

            return true;
        }

        return false;
    };

    // Create file
    const createFile = (path: string, name: string, content: string): boolean => {
        const parentItem = getItemAtPathWrapper(path);

        if (parentItem && parentItem.type === FileType.Directory) {
            // Check if directory is restricted and user not logged in
            if (parentItem.restricted && !isLoggedIn) {
                return false;
            }

            // Check if item with same name already exists
            if (parentItem.children?.some(item => item.name === name)) {
                return false;
            }

            // Create new file
            const newFile: FileSystemItem = {
                name,
                type: FileType.File,
                content
            };

            // Update file system
            setFileSystem(prev => {
                const newFileSystem = [...prev];
                updateItemInFileSystem(newFileSystem, path, (item) => {
                    if (!item.children) {
                        item.children = [];
                    }
                    item.children.push(newFile);
                    return item;
                });
                return newFileSystem;
            });

            return true;
        }

        return false;
    };

    // Update file content
    const updateFile = (path: string, content: string): boolean => {
        const item = getItemAtPathWrapper(path);

        if (item && item.type !== FileType.Directory) {
            // Check if file is restricted and user not logged in
            if (item.restricted && !isLoggedIn) {
                return false;
            }

            // Update file system
            setFileSystem(prev => {
                const newFileSystem = [...prev];
                const parentPath = path.substring(0, path.lastIndexOf('/'));
                const fileName = path.substring(path.lastIndexOf('/') + 1);

                updateItemInFileSystem(newFileSystem, parentPath, (parent) => {
                    if (parent.children) {
                        const index = parent.children.findIndex(child => child.name === fileName);
                        if (index !== -1) {
                            parent.children[index].content = content;
                        }
                    }
                    return parent;
                });

                return newFileSystem;
            });

            return true;
        }

        return false;
    };

    // Delete item
    const deleteItem = (path: string): boolean => {
        if (path === '/' || path === '/home') {
            return false; // Cannot delete root or home
        }

        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const itemName = path.substring(path.lastIndexOf('/') + 1);
        const parentItem = getItemAtPathWrapper(parentPath);

        if (parentItem && parentItem.children) {
            // Check if parent directory is restricted and user not logged in
            if (parentItem.restricted && !isLoggedIn) {
                return false;
            }

            // Check if item exists
            const itemIndex = parentItem.children.findIndex(item => item.name === itemName);
            if (itemIndex === -1) {
                return false;
            }

            // Check if item is restricted and user not logged in
            if (parentItem.children[itemIndex].restricted && !isLoggedIn) {
                return false;
            }

            // Update file system
            setFileSystem(prev => {
                const newFileSystem = [...prev];
                updateItemInFileSystem(newFileSystem, parentPath, (parent) => {
                    if (parent.children) {
                        parent.children = parent.children.filter(child => child.name !== itemName);
                    }
                    return parent;
                });
                return newFileSystem;
            });

            return true;
        }

        return false;
    };

    // Search the file system
    const searchFileSystemWrapper = (query: string): FileSystemItem[] => {
        return searchFileSystem(fileSystem, query, isLoggedIn);
    };

    // Login
    const login = (username: string, password: string): boolean => {
        // Simple mock authentication
        if (username === 'admin' && password === 'password') {
            setIsLoggedIn(true);
            return true;
        }
        return false;
    };

    // Logout
    const logout = () => {
        setIsLoggedIn(false);
    };

    // Context value
    const contextValue: FileSystemContextType = {
        fileSystem,
        currentPath,
        isLoggedIn,
        navigateTo,
        readFile,
        listDirectory,
        getItemAtPath: getItemAtPathWrapper,
        createDirectory,
        createFile,
        updateFile,
        deleteItem,
        searchFileSystem: searchFileSystemWrapper,
        login,
        logout
    };

    return (
        <FileSystemContext.Provider value={contextValue}>
            {children}
        </FileSystemContext.Provider>
    );
};