/**
 * Parse command string into command and arguments
 */
export const parseCommand = (commandStr: string): { command: string; args: string[] } => {
    const parts = commandStr.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    return { command, args };
};

/**
 * Resolve a relative path
 */
export const resolvePath = (path: string, currentPath: string): string => {
    // Absolute path
    if (path.startsWith('/')) {
        return path;
    }

    // Home directory
    if (path === '~') {
        return '/home';
    }

    // Current directory
    if (path === '.') {
        return currentPath;
    }

    // Parent directory
    if (path === '..') {
        const segments = currentPath.split('/').filter(s => s);
        if (segments.length === 0) {
            return '/';
        }
        return '/' + segments.slice(0, -1).join('/');
    }

    // Relative path
    if (currentPath === '/') {
        return '/' + path;
    }

    return currentPath + '/' + path;
};