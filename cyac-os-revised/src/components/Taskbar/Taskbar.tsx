import React, { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { WindowContext } from '../../contexts/Window/WindowContext.tsx';
import QuickMenu from '../QuickMenu/QuickMenu';
import styles from './Taskbar.module.css';

// Define global window extension
declare global {
    interface Window {
        terminalHasFocus: boolean;
    }
}

interface TaskbarItem {
    id: string;
    title: string;
    minimized: boolean;
}

interface TaskbarProps {
    items: TaskbarItem[];
    onItemClick: (id: string) => void;
    onCloseWindow: (id: string) => void;
    activeWindowId: string | null;
    onAuthChange?: (isLoggedIn: boolean) => void;
    onCommandExecute: (command: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
                                             items,
                                             onItemClick,
                                             onCloseWindow,
                                             activeWindowId,
                                             onAuthChange,
                                             onCommandExecute
                                         }) => {
    const [currentTime, setCurrentTime] = useState<string>(getCurrentTime());
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [previewPos, setPreviewPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
    const [quickMenuOpen, setQuickMenuOpen] = useState<boolean>(false);
    const [currentPath, setCurrentPath] = useState<string>('/home');

    // Use React.RefCallback type for refs with button elements
    const iconsRef = useRef<Record<string, HTMLButtonElement | null>>({});
    const windowContext = useContext(WindowContext);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Whenever hoveredId changes, measure its icon to position popup
    useEffect(() => {
        if (hoveredId && iconsRef.current[hoveredId]) {
            const rect = iconsRef.current[hoveredId]!.getBoundingClientRect();
            setPreviewPos({
                left: rect.left + rect.width/2,
                top: rect.top - 8
            });
        }
    }, [hoveredId]);

    // Helper to execute one or multiple commands
    const executeCommand = (cmdOrArray: string | string[]) => {
        // Clear terminal focus when executing commands from taskbar
        window.terminalHasFocus = false;

        if (Array.isArray(cmdOrArray)) {
            cmdOrArray.forEach(cmd => onCommandExecute(cmd));
        } else {
            onCommandExecute(cmdOrArray);
        }
        setQuickMenuOpen(false);
    };

    // Toggle quick menu
    const toggleQuickMenu = () => {
        // Clear terminal focus when opening the quick menu
        if (!quickMenuOpen) {
            window.terminalHasFocus = false;
            setCurrentPath('/home');
        }
        setQuickMenuOpen(!quickMenuOpen);
    };

    // Handle hover start
    const handleItemHover = (id: string) => {
        // Set hover ID immediately
        setHoveredId(id);

        // Position the preview above the taskbar item
        if (iconsRef.current[id]) {
            const rect = iconsRef.current[id]!.getBoundingClientRect();
            setPreviewPos({
                left: rect.left + rect.width/2,
                top: rect.top - 8
            });
        }
    };

    // Handle hover end
    const handleItemLeave = () => {
        setHoveredId(null);
    };

    // Handle closing a window from the preview
    const handlePreviewClose = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        // Tell App to close the window
        onCloseWindow(id);

        // Hide the preview popup
        setHoveredId(null);
    };

    // Helper to create a simplified synthetic mouse event
    const createSyntheticMouseEvent = (): Pick<React.MouseEvent, 'stopPropagation'> => {
        return {
            stopPropagation: () => {}
        };
    };

    // Render window preview when hovering over taskbar item
    const renderPreview = () => {
        if (!hoveredId) return null;

        const item = items.find(i => i.id === hoveredId);
        if (!item) return null;

        // Get the window from context to get its component
        const windowItem = windowContext.windows.find(w => w.id === hoveredId);

        return (
            <div
                className={styles.preview}
                style={{
                    position: 'absolute',
                    left: previewPos.left,
                    top: previewPos.top,
                    transform: 'translate(-50%, -100%)'
                }}
                onMouseEnter={() => setHoveredId(hoveredId)}
                onMouseLeave={handleItemLeave}
                onClick={() => {
                    // Clear terminal focus when interacting with window preview
                    if (window.terminalHasFocus) {
                        window.terminalHasFocus = false;
                    }
                }}
            >
                <div className={styles.previewHeader}>
                    <span className={styles.previewTitle}>{item.title}</span>
                    <button
                        className={styles.previewCloseBtn}
                        onClick={(e) => handlePreviewClose(e, item.id)}
                        aria-label="Close window"
                    >
                        ×
                    </button>
                </div>
                <div className={styles.previewContent}>
                    {windowItem?.component ? (
                        <div className={styles.previewActualContent}>
                            {React.createElement(windowItem.component, {
                                ...windowItem.props,
                                fromPreview: true,
                                onClose: () => {
                                    const syntheticEvent = createSyntheticMouseEvent();
                                    handlePreviewClose(syntheticEvent as React.MouseEvent, item.id);
                                }
                            })}
                        </div>
                    ) : (
                        <div className={styles.previewPlaceholder}>
                            <span>{item.title}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className={styles.taskbar}>
                {/* System button */}
                <div className={styles.systemButton} onClick={toggleQuickMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                         className={styles.icon} aria-hidden="true">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" x2="20" y1="19" y2="19"></line>
                    </svg>
                    <span>CYBERACME</span>
                </div>

                {/* Quick access buttons */}
                <div className={styles.quickAccess}>
                    <button
                        className={styles.quickAccessButton}
                        title="Open Terminal"
                        onClick={() => {
                            executeCommand('clear');
                            // Explicitly set terminal focus
                            window.terminalHasFocus = true;
                        }}
                    >
                        <span className={styles.buttonIcon}>⌨</span>
                    </button>
                    <button
                        className={styles.quickAccessButton}
                        title="Open Clock"
                        onClick={() => executeCommand('cat clock')}
                    >
                        <span className={styles.buttonIcon}>⏰</span>
                    </button>
                    <button
                        className={styles.quickAccessButton}
                        title="Open Tetris"
                        onClick={() => executeCommand('cat tetris')}
                    >
                        <span className={styles.buttonIcon}>🎮</span>
                    </button>
                    <button
                        className={styles.quickAccessButton}
                        title="Return Home"
                        onClick={() => {
                            executeCommand('home');
                            // Restore terminal focus when returning home
                            window.terminalHasFocus = true;
                        }}
                    >
                        <span className={styles.buttonIcon}>🏠</span>
                    </button>
                </div>

                {/* Open windows */}
                <div className={styles.items}>
                    {items.map(item => (
                        <button
                            key={item.id}
                            ref={(el) => { iconsRef.current[item.id] = el; }}
                            className={`${styles.item} ${item.minimized ? styles.minimized : styles.active} ${activeWindowId === item.id ? styles.focused : ''}`}
                            onClick={() => onItemClick(item.id)}
                            onMouseEnter={() => handleItemHover(item.id)}
                            onMouseLeave={handleItemLeave}
                            aria-label={item.minimized ? `Restore ${item.title}` : `Minimize ${item.title}`}
                            title={item.title}
                        >
                            <span className={styles.itemTitle}>{item.title}</span>
                            {item.minimized && (
                                <span className={styles.itemIcon}>▲</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Status */}
                <div className={styles.status}>
                    <div className={styles.statusItem}>
                        <div className={`${styles.statusIndicator} ${styles.online}`}></div>
                        <span>ONLINE</span>
                    </div>
                    <div className={styles.statusItem}>
                        <span className={styles.clock}>{currentTime}</span>
                    </div>
                </div>

                {renderPreview()}
            </div>

            {/* Quick Menu */}
            {quickMenuOpen && (
                <QuickMenu
                    onClose={() => setQuickMenuOpen(false)}
                    currentPath={currentPath}
                    onNavigate={setCurrentPath}
                    onExecuteCommand={executeCommand}
                    onMinimizeAll={() => windowContext.minimizeAllWindows()}
                    onCloseAll={() => windowContext.closeAllWindows()}
                    onAuthChange={onAuthChange}
                />
            )}
        </>
    );
};

/**
 * Get the current time formatted as HH:MM:SS
 * @returns {string} Formatted time
 */
const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
};

export default Taskbar;