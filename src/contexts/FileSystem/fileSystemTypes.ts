// File system item types
export enum FileType {
    Directory = 'directory',
    File = 'file',
    Scene = 'scene',
    Subscene = 'subscene',
    Program = 'program'
}

// File metadata interface
export interface FileMetadata {
    path?: string;
    matchesContent?: boolean;
    lastModified?: string;
    createdBy?: string;
    size?: number;
    permissions?: string;
    [key: string]: string | number | boolean | undefined;
}

// Component props for file system items
export interface FileSystemComponentProps {
    fromPreview?: boolean;
    onClose?: () => void;
    [key: string]: unknown;
}

// File system item interface
export interface FileSystemItem {
    name: string;
    type: FileType;
    content?: string;
    children?: FileSystemItem[];
    component?: React.ComponentType<FileSystemComponentProps>;
    props?: FileSystemComponentProps;
    metadata?: FileMetadata;
    restricted?: boolean;
}

// Context interface
export interface FileSystemContextType {
    fileSystem: FileSystemItem[];
    currentPath: string;
    isLoggedIn: boolean;
    navigateTo: (path: string) => boolean;
    readFile: (path: string) => string | null;
    listDirectory: (path: string) => FileSystemItem[];
    getItemAtPath: (path: string) => FileSystemItem | null;
    createDirectory: (path: string, name: string) => boolean;
    createFile: (path: string, name: string, content: string) => boolean;
    updateFile: (path: string, content: string) => boolean;
    deleteItem: (path: string) => boolean;
    searchFileSystem: (query: string) => FileSystemItem[];
    login: (username: string, password: string) => boolean;
    logout: () => void;
}