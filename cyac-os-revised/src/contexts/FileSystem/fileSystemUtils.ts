import { FileSystemItem, FileType } from './fileSystemTypes.ts';

/**
 * Convert path string to array of path segments
 */
export const getPathSegments = (path: string): string[] => {
    if (!path) return [];
    return path.split('/').filter(segment => segment !== '');
};

/**
 * Update an item in the file system
 */
export const updateItemInFileSystem = (
    fileSystem: FileSystemItem[],
    path: string,
    updateFn: (item: FileSystemItem) => FileSystemItem
): boolean => {
    // Handle root path
    if (path === '/' || path === '') {
        return false; // Cannot update root directly
    }

    const segments = getPathSegments(path);

    // Helper function to update nested items
    const updateNestedItem = (
        items: FileSystemItem[],
        currentSegments: string[],
        segmentIndex: number
    ): boolean => {
        // If we've processed all segments, we found the item to update
        if (segmentIndex === currentSegments.length) {
            return false; // Should never happen at root level
        }

        const currentSegment = currentSegments[segmentIndex];
        const itemIndex = items.findIndex(item => item.name === currentSegment);

        if (itemIndex === -1) {
            return false; // Item not found
        }

        const item = items[itemIndex];

        // If this is the last segment, update the item
        if (segmentIndex === currentSegments.length - 1) {
            items[itemIndex] = updateFn(item);
            return true;
        }

        // Otherwise, continue recursive updates
        if (item.type === FileType.Directory && item.children) {
            return updateNestedItem(item.children, currentSegments, segmentIndex + 1);
        }

        return false; // Not a directory or no children
    };

    return updateNestedItem(fileSystem, segments, 0);
};

/**
 * Get item at path
 */
export const getItemAtPath = (
    fileSystem: FileSystemItem[],
    path: string
): FileSystemItem | null => {
    // Handle root path
    if (path === '/' || path === '') {
        return { name: '', type: FileType.Directory, children: fileSystem };
    }

    // Split path into segments
    const segments = getPathSegments(path);

    let currentItem: FileSystemItem | null = {
        name: '',
        type: FileType.Directory,
        children: fileSystem
    };

    // Traverse the file system using path segments
    for (const segment of segments) {
        if (!currentItem || !currentItem.children) {
            return null;
        }

        currentItem = currentItem.children.find(item => item.name === segment) || null;
    }

    return currentItem;
};

/**
 * Search file system for items matching query
 */
export const searchFileSystem = (
    fileSystem: FileSystemItem[],
    query: string,
    isLoggedIn: boolean
): FileSystemItem[] => {
    if (!query.trim()) {
        return [];
    }

    const searchQuery = query.toLowerCase();
    const results: FileSystemItem[] = [];

    // Helper to recursively search the file system
    const searchInItem = (item: FileSystemItem, parentPath: string) => {
        const currentPath = parentPath + '/' + item.name;

        // Skip restricted items if not logged in
        if (item.restricted && !isLoggedIn) {
            return;
        }

        // Check if name matches
        if (item.name.toLowerCase().includes(searchQuery)) {
            // Add current metadata for path
            const resultItem: FileSystemItem = {
                ...item,
                metadata: {
                    ...item.metadata,
                    path: currentPath
                }
            };
            results.push(resultItem);
        }

        // Check file content
        if (item.type === FileType.File && item.content &&
            item.content.toLowerCase().includes(searchQuery)) {
            // Add current item if not already added
            if (!results.find(r => r.name === item.name && r.metadata?.path === currentPath)) {
                const resultItem: FileSystemItem = {
                    ...item,
                    metadata: {
                        ...item.metadata,
                        path: currentPath,
                        matchesContent: true
                    }
                };
                results.push(resultItem);
            }
        }

        // Recursively search children
        if (item.children) {
            item.children.forEach(child => searchInItem(child, currentPath));
        }
    };

    // Search starting from root
    fileSystem.forEach(rootItem => searchInItem(rootItem, ''));

    return results;
};