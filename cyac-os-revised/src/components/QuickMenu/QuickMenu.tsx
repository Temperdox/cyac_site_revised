import React, { useState, useRef, useEffect } from 'react';
import styles from './QuickMenu.module.css';
import useFileSystem from "../../contexts/FileSystem/useFileSystem.ts";
import {FileType} from "../../contexts/FileSystem";


// Define global window extension
declare global {
    interface Window {
        terminalHasFocus: boolean;
    }
}

// Define a simple timeout type instead of using Node.js.Timeout
type TimeoutId = ReturnType<typeof setTimeout>;

interface FileItem {
    name: string;
    type: 'directory' | 'file' | 'scene' | 'subscene';
    restricted?: boolean;
    metadata?: {
        icon?: string;
    };
}

interface QuickMenuProps {
    onClose: () => void;
    currentPath: string;
    onNavigate: (path: string) => void;
    onExecuteCommand: (command: string | string[]) => void;
    onMinimizeAll: () => void;
    onCloseAll: () => void;
    onAuthChange?: (isLoggedIn: boolean) => void;
}

const QuickMenu: React.FC<QuickMenuProps> = ({
                                                 onClose,
                                                 currentPath,
                                                 onNavigate,
                                                 onExecuteCommand,
                                                 onMinimizeAll,
                                                 onCloseAll,
                                                 onAuthChange
                                             }) => {
    const [previousPaths, setPreviousPaths] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<string>('');
    const [showAuthMessage, setShowAuthMessage] = useState<boolean>(false);
    const [authMessageType, setAuthMessageType] = useState<'success' | 'error'>('success');
    const [authMessage, setAuthMessage] = useState<string>('');

    const menuRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<TimeoutId | null>(null);
    const fileSystem = useFileSystem();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Function to get file icon based on name and metadata
    const getFileIcon = (fileName: string, item: FileItem): string => {
        // Check if the item has a custom icon in metadata
        if (item.metadata?.icon && typeof item.metadata.icon === 'string') {
            return item.metadata.icon;
        }

        // Check file extension
        const extension = fileName.split('.').pop()?.toLowerCase();

        // Text files
        if(['md', 'txt', 'rtf'].includes(extension || '')) {
            return '📄'; // Text file icon
        }

        // Executable files
        if(['exe'].includes(extension || '')) {
            // Special application icons
            const baseName = fileName.split('.')[0].toLowerCase();

            // Custom icon mapping for specific applications
            const customIconMap: Record<string, string> = {
                'cyberacme_browser': 'img:/programIcons/browser-icon.png',
                'game_launcher': 'img:/programIcons/game-launcher-icon.png',
                'calculator': 'img:/programIcons/calculator-icon.png',
                'clock': 'img:/programIcons/clock-icon.png',
                'admin_panel': 'img:/programIcons/admin-icon.png',
                'welcome': 'img:/programIcons/welcome-icon.png'
            };

            if(customIconMap[baseName]) {
                return customIconMap[baseName];
            }

            return '⚙️'; // Default executable icon
        }

        // Default icon
        return '📄';
    };

    // Mock file system data - this would be replaced with actual data from context
    const getDirectoryContents = (path: string): FileItem[] => {
        const contents = fileSystem.listDirectory(path);
        return contents.map(item => ({
            name: item.name,
            type: item.type === FileType.Directory ? 'directory' : 'file',
            restricted: item.restricted,
            metadata: item.metadata
        }));
    };

    // Navigate to a directory
    const navigateTo = (path: string) => {
        // Clear terminal focus when navigating in the quick menu
        if (window.terminalHasFocus) {
            window.terminalHasFocus = false;
        }

        setPreviousPaths(prev => [...prev, currentPath]);
        onNavigate(path);
        setSearchResults(null);
        setSearchQuery('');
    };

    // Go back to previous directory
    const goBack = () => {
        // Clear terminal focus when navigating in the quick menu
        if (window.terminalHasFocus) {
            window.terminalHasFocus = false;
        }

        if (searchResults) {
            setSearchResults(null);
            setSearchQuery('');
        } else if (previousPaths.length > 0) {
            const prevPath = previousPaths[previousPaths.length - 1];
            setPreviousPaths(prev => prev.slice(0, -1));
            onNavigate(prevPath);
        }
    };

    // Mock search function
    const performSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }

        // Simple mock search - would be replaced with actual search functionality
        const results: FileItem[] = [];

        // Add some mock results based on search query
        if (searchQuery.includes('game') || searchQuery.includes('play')) {
            results.push(
                { name: 'game_launcher.exe', type: 'file', metadata: { icon: 'img:/programIcons/game-launcher-icon.png' } }
            );
        }

        if (searchQuery.includes('doc') || searchQuery.includes('file')) {
            results.push(
                { name: 'documents', type: 'directory' },
                { name: 'readme.txt', type: 'file' },
                { name: 'user_manual.txt', type: 'file' }
            );
        }

        if (searchQuery.includes('browser') || searchQuery.includes('web')) {
            results.push(
                { name: 'browser', type: 'directory' },
                { name: 'cyberacme_browser.exe', type: 'file', metadata: { icon: 'img:/programIcons/browser-icon.png' } }
            );
        }

        if (searchQuery.includes('admin') || searchQuery.includes('system')) {
            results.push(
                { name: 'system', type: 'directory' },
                { name: 'admin', type: 'directory', restricted: true }
            );
        }

        setSearchResults(results);
    };

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }

        if (e.target.value.trim()) {
            searchTimeoutRef.current = setTimeout(performSearch, 300);
        } else {
            setSearchResults(null);
        }
    };

    // Execute with full path
    const executeWithFullPath = (item: FileItem) => {
        const targetDir = searchResults ? '/home' : currentPath;

        // Clear terminal focus before executing command
        window.terminalHasFocus = false;

        if (item.type === 'directory') {
            const newPath = `${targetDir === '/' ? '' : targetDir}/${item.name}`;
            navigateTo(newPath);
        } else {
            // For files, whether executable or not
            const command = `cd ${targetDir} && cat ${item.name}`;
            onExecuteCommand(command);
            onClose();
        }
    };

    // Mock login function
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === 'admin' && password === 'password') {
            setIsLoggedIn(true);
            setShowLoginModal(false);
            setUsername('');
            setPassword('');
            setLoginError('');

            // Show success message
            setAuthMessage('Login successful!');
            setAuthMessageType('success');
            setShowAuthMessage(true);
            setTimeout(() => setShowAuthMessage(false), 3000);

            // Notify parent
            if (onAuthChange) {
                onAuthChange(true);
            }
        } else {
            setLoginError('Invalid username or password.');
        }
    };

    // Mock logout function
    const handleLogout = () => {
        setIsLoggedIn(false);

        // Show logout message
        setAuthMessage('Logged out successfully.');
        setAuthMessageType('success');
        setShowAuthMessage(true);
        setTimeout(() => setShowAuthMessage(false), 3000);

        // Notify parent
        if (onAuthChange) {
            onAuthChange(false);
        }

        onClose();
    };

    // Get current contents based on path or search results
    const getCurrentContents = () => {
        const contents = searchResults || getDirectoryContents(currentPath);

        // Filter content by type
        const directories = contents.filter(i => i.type === 'directory');

        // Executable files (with .exe extension or scene type)
        const executableFiles = contents.filter(i =>
            (i.type === 'file' && i.name.endsWith('.exe')) ||
            i.type === 'scene'
        );

        // Text files
        const textFiles = contents.filter(i =>
            i.type === 'file' &&
            (i.name.endsWith('.txt') || i.name.endsWith('.md') || i.name.endsWith('.rtf'))
        );

        // Other files
        const otherFiles = contents.filter(i =>
            (i.type === 'file' &&
                !i.name.endsWith('.exe') &&
                !i.name.endsWith('.txt') &&
                !i.name.endsWith('.md') &&
                !i.name.endsWith('.rtf')) ||
            i.type === 'subscene'
        );

        return {
            directories,
            executableFiles,
            textFiles,
            otherFiles
        };
    };

    // Get filtered and categorized contents
    const { directories, executableFiles, textFiles, otherFiles } = getCurrentContents();

    // Can the user access an item?
    const canAccess = (item: FileItem) => {
        if (item.restricted) {
            return isLoggedIn;
        }
        return true;
    };

    // Render login modal
    const renderLoginModal = () => {
        if (!showLoginModal) return null;

        return (
            <div className={styles.loginModalOverlay}>
                <div className={styles.loginModal}>
                    <h3>CYBERACME AUTHENTICATION</h3>

                    {loginError && <div className={styles.loginError}>{loginError}</div>}

                    <form className={styles.loginForm} onSubmit={handleLogin}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">USERNAME:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">PASSWORD:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.loginButtons}>
                            <button type="submit" className={styles.submitButton}>LOGIN</button>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => setShowLoginModal(false)}
                            >
                                CANCEL
                            </button>
                        </div>
                    </form>

                    <div className={styles.loginHint}>
                        (Hint: Username = "admin", Password = "password")
                    </div>
                </div>
            </div>
        );
    };

    // Render authentication message
    const renderAuthMessage = () => {
        if (!showAuthMessage) return null;

        return (
            <div className={styles.authMessageOverlay}>
                <div className={`${styles.authMessage} ${styles[authMessageType]}`}>
                    {authMessage}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={styles.quickMenu} ref={menuRef}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        {searchResults ? 'SEARCH RESULTS' : currentPath.toUpperCase()}
                    </div>
                    <button
                        onClick={goBack}
                        disabled={previousPaths.length === 0 && !searchResults}
                        className={styles.backButton}
                    >
                        ◄ BACK
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.items}>
                        {directories.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.directoriesHeader}`}>DIRECTORIES</div>
                                {directories.map((item, idx) => (
                                    <div
                                        key={`dir-${idx}`}
                                        className={`${styles.item} ${styles.directory} ${!canAccess(item) ? styles.locked : ''}`}
                                        onClick={() => canAccess(item) && executeWithFullPath(item)}
                                    >
                                        <span>{canAccess(item) ? '📁' : '🔒'}</span>
                                        <span className={styles.itemName}>
                                            {item.name}
                                            {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}

                        {executableFiles.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.executablesHeader}`}>EXECUTABLE FILES</div>
                                {executableFiles.map((item, idx) => {
                                    const icon = getFileIcon(item.name, item);
                                    const isImageIcon = typeof icon === 'string' && icon.startsWith('img:');

                                    return (
                                        <div
                                            key={`exe-${idx}`}
                                            className={`${styles.item} ${styles.executable} ${!canAccess(item) ? styles.locked : ''}`}
                                            onClick={() => canAccess(item) && executeWithFullPath(item)}
                                        >
                                            {isImageIcon ? (
                                                <div
                                                    className={styles.itemImage}
                                                    style={{backgroundImage: `url(${icon.substring(4)})`}}
                                                ></div>
                                            ) : (
                                                <span>{canAccess(item) ? icon : '🔒'}</span>
                                            )}
                                            <span className={styles.itemName}>
                                                {item.name}
                                                {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {textFiles.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.filesHeader}`}>TEXT FILES</div>
                                {textFiles.map((item, idx) => (
                                    <div
                                        key={`file-${idx}`}
                                        className={`${styles.item} ${styles.file} ${!canAccess(item) ? styles.locked : ''}`}
                                        onClick={() => canAccess(item) && executeWithFullPath(item)}
                                    >
                                        <span>{canAccess(item) ? '📄' : '🔒'}</span>
                                        <span className={styles.itemName}>
                                            {item.name}
                                            {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}

                        {otherFiles.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.otherFilesHeader}`}>OTHER FILES</div>
                                {otherFiles.map((item, idx) => {
                                    const icon = getFileIcon(item.name, item);
                                    const isImageIcon = typeof icon === 'string' && icon.startsWith('img:');

                                    return (
                                        <div
                                            key={`other-${idx}`}
                                            className={`${styles.item} ${styles.file} ${!canAccess(item) ? styles.locked : ''}`}
                                            onClick={() => canAccess(item) && executeWithFullPath(item)}
                                        >
                                            {isImageIcon ? (
                                                <div
                                                    className={styles.itemImage}
                                                    style={{backgroundImage: `url(${icon.substring(4)})`}}
                                                ></div>
                                            ) : (
                                                <span>{canAccess(item) ? icon : '🔒'}</span>
                                            )}
                                            <span className={styles.itemName}>
                                                {item.name}
                                                {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {/* No items message */}
                        {(directories.length === 0 && executableFiles.length === 0 && textFiles.length === 0 && otherFiles.length === 0) && (
                            <div className={styles.noItemsMessage}>
                                {searchResults ? 'No results found' : 'No items in this directory'}
                            </div>
                        )}
                    </div>

                    <div className={styles.options}>
                        <div className={`${styles.sectionHeader} ${styles.windowsHeader}`}>WINDOWS</div>
                        <div
                            className={`${styles.item} ${styles.option}`}
                            onClick={() => {
                                onMinimizeAll();
                                onClose();
                            }}
                        >
                            <span>▼</span><span>MINIMIZE ALL</span>
                        </div>
                        <div
                            className={`${styles.item} ${styles.option}`}
                            onClick={() => {
                                onCloseAll();
                                onClose();
                            }}
                        >
                            <span>✕</span><span>CLOSE ALL</span>
                        </div>
                    </div>
                </div>

                {/* User authentication bar */}
                <div className={styles.userAuthBar}>
                    <div className={styles.userStatus}>
                        {isLoggedIn ? (
                            <>Status: <span className={styles.userLoggedIn}>ADMIN</span></>
                        ) : (
                            <>Status: <span className={styles.userGuest}>GUEST</span></>
                        )}
                    </div>

                    {isLoggedIn ? (
                        <button className={styles.authButton} onClick={handleLogout}>
                            LOGOUT
                        </button>
                    ) : (
                        <button
                            className={styles.authButton}
                            onClick={() => setShowLoginModal(true)}
                        >
                            LOGIN
                        </button>
                    )}
                </div>

                {/* Search bar */}
                <div className={styles.search}>
                    <input
                        type="text"
                        placeholder="SEARCH..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onClick={(e) => {
                            // Make sure terminal loses focus when clicking search
                            if (window.terminalHasFocus) {
                                window.terminalHasFocus = false;
                            }
                            e.stopPropagation();
                        }}
                    />
                </div>
            </div>

            {renderLoginModal()}
            {renderAuthMessage()}
        </>
    );
};

export default QuickMenu;