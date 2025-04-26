import { FileSystemContextType, FileType } from '../FileSystem/fileSystemTypes.ts';
import { CommandResponse } from './commandTypes.ts';
import { resolvePath } from './commandUtils.ts';

/**
 * Handle ls command - List directory contents
 */
export const handleLsCommand = (
    args: string[],
    currentPath: string,
    fileSystem: FileSystemContextType
): CommandResponse => {
    const response: CommandResponse = { output: [], success: true };

    // Determine target directory
    const targetPath = args.length > 0
        ? resolvePath(args[0], currentPath)
        : currentPath;

    // Get directory contents
    const contents = fileSystem.listDirectory(targetPath);

    if (contents.length === 0) {
        response.output = ['No files or directories found'];
        return response;
    }

    // Format output
    const directories = contents.filter(item => item.type === FileType.Directory);
    const scenes = contents.filter(item => item.type === FileType.Scene);
    const subscenes = contents.filter(item => item.type === FileType.Subscene);
    const files = contents.filter(item =>
        item.type === FileType.File ||
        item.type !== FileType.Directory &&
        item.type !== FileType.Scene &&
        item.type !== FileType.Subscene
    );

    if (directories.length > 0) {
        response.output.push(`[g]Directories:[/g] ${directories.map(d =>
            d.restricted
                ? `[rst]${d.name}/ (restricted access)[/rst]`
                : `[dir]${d.name}/[/dir]`
        ).join(' ')}`);
    }

    if (scenes.length > 0) {
        response.output.push(`[c]Scenes:[/c] ${scenes.map(s =>
            s.restricted
                ? `[rst]${s.name} (restricted access)[/rst]`
                : `[scene]${s.name}[/scene]`
        ).join(' ')}`);
    }

    if (subscenes.length > 0) {
        response.output.push(`[b]Sub-Scenes:[/b] ${subscenes.map(s =>
            s.restricted
                ? `[rst]${s.name} (restricted access)[/rst]`
                : `[subscene]${s.name}[/subscene]`
        ).join(' ')}`);
    }

    if (files.length > 0) {
        response.output.push(`[y]Files:[/y] ${files.map(f =>
            f.restricted
                ? `[rst]${f.name} (restricted access)[/rst]`
                : `[file]${f.name}[/file]`
        ).join(' ')}`);
    }

    return response;
};

/**
 * Handle cd command - Change directory
 */
export const handleCdCommand = (
    args: string[],
    currentPath: string,
    fileSystem: FileSystemContextType
): CommandResponse => {
    const response: CommandResponse = { output: [], success: true };

    if (args.length === 0) {
        // No args, navigate to home
        fileSystem.navigateTo('/home');
        response.output = ['Changed directory to /home'];
        response.action = { type: 'navigate', payload: '/home' };
        return response;
    }

    // Resolve target path
    const targetPath = resolvePath(args[0], currentPath);

    // Try to navigate
    const success = fileSystem.navigateTo(targetPath);

    if (success) {
        response.output = [`Changed directory to ${targetPath}`];
        response.action = { type: 'navigate', payload: targetPath };
    } else {
        response.output = [`ERROR: Cannot change to ${targetPath} - directory not found or access denied`];
        response.success = false;
    }

    return response;
};

/**
 * Handle cat command - View file or launch application
 */
export const handleCatCommand = (
    args: string[],
    currentPath: string,
    fileSystem: FileSystemContextType
): CommandResponse => {
    const response: CommandResponse = { output: [], success: true };

    if (args.length === 0) {
        response.output = ['ERROR: Missing filename argument'];
        response.success = false;
        return response;
    }

    // Resolve target path
    const filename = args[0];
    const targetPath = currentPath === '/'
        ? `/${filename}`
        : `${currentPath}/${filename}`;

    // Get item at path
    const item = fileSystem.getItemAtPath(targetPath);

    if (!item) {
        response.output = [`ERROR: File not found: ${filename}`];
        response.success = false;
        return response;
    }

    // Handle restricted access
    if (item.restricted && !fileSystem.isLoggedIn) {
        response.output = ['ACCESS DENIED: You need to be logged in to access this item.'];
        response.success = false;
        return response;
    }

    // Handle different file types
    if (item.type === FileType.Directory) {
        response.output = [`ERROR: ${filename} is a directory. Use 'ls ${filename}' to view its contents.`];
        response.success = false;
    } else if (item.type === FileType.File) {
        // Show file content
        if (item.content) {
            response.output = [
                `File: ${filename}`,
                '---',
                ...item.content.split('\n')
            ];
        } else {
            response.output = [`File: ${filename} (empty)`];
        }
    } else if (item.type === FileType.Scene || item.type === FileType.Subscene || item.type === FileType.Program) {
        // Open scene/program in window
        response.output = [`OPENING: ${filename}`];

        // If component exists, open window with that component
        if (item.component) {
            response.action = {
                type: 'openWindow',
                payload: {
                    id: `window-${filename}`,
                    title: filename,
                    component: item.component,
                    props: item.props || {}
                }
            };
        } else {
            // Handle case where component isn't defined
            response.output = [`ERROR: Unable to load ${filename} - component not found`];
            response.success = false;
        }
    } else {
        response.output = [`ERROR: Unknown file type: ${filename}`];
        response.success = false;
    }

    return response;
};