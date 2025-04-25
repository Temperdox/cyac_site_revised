import React, { useState, useRef, useEffect } from 'react';
import styles from './QuickMenu.module.css';

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

    // Mock file system data - this would be replaced with actual data from context
    const getDirectoryContents = (path: string): FileItem[] => {
        // This needs to get data from the file system
        //TODO get data from the file system
        if (path === '/home') {
            return [
                { name: 'documents', type: 'directory' },
                { name: 'programs', type: 'directory' },
                { name: 'games', type: 'directory' },
                { name: 'system', type: 'directory' },
                { name: 'user', type: 'directory' },
                { name: 'readme.txt', type: 'file' },
                { name: 'welcome', type: 'scene' }
            ];
        } else if (path === '/home/programs') {
            return [
                { name: 'browser', type: 'directory' },
                { name: 'utilities', type: 'directory' },
                { name: 'admin', type: 'directory', restricted: true },
                { name: 'text_editor', type: 'scene' },
                { name: 'calculator', type: 'scene' },
                { name: 'terminal', type: 'scene' }
            ];
        } else if (path === '/home/games') {
            return [
                { name: 'tetris', type: 'scene' },
                { name: 'snake', type: 'scene' },
                { name: 'spaceinvaders', type: 'scene' },
                { name: 'tictactoe', type: 'scene' }
            ];
        } else if (path.includes('restricted') && !isLoggedIn) {
            return [
                { name: 'Access Denied', type: 'file', restricted: true }
            ];
        }

        // Default empty directory
        return [];
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
                { name: 'tetris', type: 'scene' },
                { name: 'snake', type: 'scene' },
                { name: 'games', type: 'directory' }
            );
        }

        if (searchQuery.includes('doc') || searchQuery.includes('file')) {
            results.push(
                { name: 'documents', type: 'directory' },
                { name: 'readme.txt', type: 'file' },
                { name: 'manual.txt', type: 'file' }
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
            // For scenes, subscenes, and files
            const command = `cd ${targetDir} && cat ${item.name}`;
            onExecuteCommand(command);
            onClose();
        }
    };

    // Mock login function
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate authentication for now, just to get the site running, need to factor in Discord's OAuth2 and impl
        // JWT tokenization of user ID
        //TODO add Discord's OAuth2 auth flow and save user ID as part of JWT Token for API calls to external sources
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
        return searchResults || getDirectoryContents(currentPath);
    };

    // Filter content by type
    const contents = getCurrentContents();
    const directories = contents.filter(i => i.type === 'directory');
    const scenes = contents.filter(i => i.type === 'scene');
    const subscenes = contents.filter(i => i.type === 'subscene');
    const files = contents.filter(i => i.type === 'file');

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

                        {scenes.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.scenesHeader}`}>SCENES</div>
                                {scenes.map((item, idx) => (
                                    <div
                                        key={`scene-${idx}`}
                                        className={`${styles.item} ${styles.scene} ${!canAccess(item) ? styles.locked : ''}`}
                                        onClick={() => canAccess(item) && executeWithFullPath(item)}
                                    >
                                        <span>📺</span>
                                        <span className={styles.itemName}>
                      {item.name}
                                            {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                    </span>
                                    </div>
                                ))}
                            </>
                        )}

                        {subscenes.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.subscenesHeader}`}>SUB-SCENES</div>
                                {subscenes.map((item, idx) => (
                                    <div
                                        key={`subscene-${idx}`}
                                        className={`${styles.item} ${styles.subscene} ${!canAccess(item) ? styles.locked : ''}`}
                                        onClick={() => canAccess(item) && executeWithFullPath(item)}
                                    >
                                        <span>🪟</span>
                                        <span className={styles.itemName}>
                      {item.name}
                                            {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                    </span>
                                    </div>
                                ))}
                            </>
                        )}

                        {files.length > 0 && (
                            <>
                                <div className={`${styles.sectionHeader} ${styles.filesHeader}`}>FILES</div>
                                {files.map((item, idx) => (
                                    <div
                                        key={`file-${idx}`}
                                        className={`${styles.item} ${styles.file} ${!canAccess(item) ? styles.locked : ''}`}
                                        onClick={() => canAccess(item) && executeWithFullPath(item)}
                                    >
                                        <span>📄</span>
                                        <span className={styles.itemName}>
                      {item.name}
                                            {searchResults && <span className={styles.itemPath}>{currentPath}</span>}
                    </span>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* No items message */}
                        {(directories.length === 0 && scenes.length === 0 && subscenes.length === 0 && files.length === 0) && (
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