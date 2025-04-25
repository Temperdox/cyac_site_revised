import React, { useState, useRef, useEffect } from 'react';
import styles from './Window.module.css';

interface WindowPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
}

interface WindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
    position: WindowPosition;
    maximized: boolean;
    minimized: boolean;
    onAction: (action: 'minimize' | 'maximize' | 'close') => void;
    onFocus: () => void;
    onClick?: () => void;
    onMove: (x: number, y: number) => void;
    onResize: (width: number, height: number) => void;
    isActive: boolean;
}

const Window: React.FC<WindowProps> = ({
                                           id,
                                           title,
                                           children,
                                           position,
                                           maximized,
                                           minimized,
                                           onAction,
                                           onFocus,
                                           onClick,
                                           onMove,
                                           onResize,
                                           isActive
                                       }) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
    const [terminalHeight, setTerminalHeight] = useState<number>(250); // Default terminal height
    const [windowHasFocus, setWindowHasFocus] = useState<boolean>(false);

    // Prevent multiple focus events in quick succession
    const lastFocusTime = useRef<number>(0);

    const windowRef = useRef<HTMLDivElement>(null);

    // Find the terminal height on component mount and window resize
    useEffect(() => {
        const updateTerminalHeight = () => {
            const terminalElement = document.querySelector('[class^="Terminal_container"]');
            if (terminalElement) {
                const height = terminalElement.clientHeight;
                setTerminalHeight(height);
            }
        };

        updateTerminalHeight();
        window.addEventListener('resize', updateTerminalHeight);
        const timeoutId = setTimeout(updateTerminalHeight, 500);

        return () => {
            window.removeEventListener('resize', updateTerminalHeight);
            clearTimeout(timeoutId);
        };
    }, []);

    // Set up keyboard event listener for the window
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle keyboard events if this window is active and terminal doesn't have focus
            if (isActive && windowHasFocus && (!(window as any).terminalHasFocus)) {
                // Handle specific key events for the window
                // For example: Escape to close, etc.
                if (e.key === 'Escape') {
                    onAction && onAction('close');
                    e.preventDefault();
                }

                // Don't stop propagation here - let the event continue to propagate
                // to parent windows if needed
            }
        };

        // Add the event listener to document
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive, windowHasFocus, onAction]);

    // Update focus state when isActive changes
    useEffect(() => {
        setWindowHasFocus(isActive);
    }, [isActive]);

    // Handle mouse movement for dragging and resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && !maximized) {
                const newX = Math.max(0, e.clientX - dragOffset.x);
                const newY = Math.max(0, e.clientY - dragOffset.y);
                onMove && onMove(newX, newY);
            } else if (isResizing && !maximized) {
                const width = resizeStart.width + (e.clientX - resizeStart.x);
                const height = resizeStart.height + (e.clientY - resizeStart.y);
                const newWidth = Math.max(300, width);
                const newHeight = Math.max(200, height);
                onResize && onResize(newWidth, newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            document.body.classList.remove(styles.resizing);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            if (isResizing) {
                document.body.classList.add(styles.resizing);
            }
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove(styles.resizing);
        };
    }, [isDragging, isResizing, dragOffset, resizeStart, onMove, onResize, maximized]);

    // Improved window click handler
    const handleWindowClick = (e: React.MouseEvent) => {
        // Only handle left mouse button
        if (e.button !== 0) return;

        // Don't handle click events during dragging or resizing
        if (isDragging || isResizing) return;

        // Clear terminal focus when clicking on window
        if ((window as any).terminalHasFocus) {
            (window as any).terminalHasFocus = false;
        }

        // Set this window as focused
        setWindowHasFocus(true);

        // Always call the focus handler when window is clicked
        if (onFocus) {
            const now = Date.now();
            // Throttle focus events to prevent rapid succession
            if (now - lastFocusTime.current > 100) {
                lastFocusTime.current = now;
                onFocus();
            }
        }

        // Call the click handler
        if (onClick) {
            onClick();
        }
    };

    // Start dragging the window
    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        // Only initiate drag on left mouse button
        if (e.button !== 0 || maximized) return;

        // Don't initiate drag if clicked on window controls
        if (e.target instanceof Element && e.target.closest(`.${styles.controls}`)) return;

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });

        // Clear terminal focus when dragging window
        if ((window as any).terminalHasFocus) {
            (window as any).terminalHasFocus = false;
        }

        // Focus the window when starting to drag
        if (onFocus) {
            const now = Date.now();
            if (now - lastFocusTime.current > 100) {
                lastFocusTime.current = now;
                onFocus();
            }
        }

        // Set window focus
        setWindowHasFocus(true);
    };

    // Start resizing the window
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();

        if (maximized) return;

        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: position.width,
            height: position.height
        });

        // Clear terminal focus when resizing window
        if ((window as any).terminalHasFocus) {
            (window as any).terminalHasFocus = false;
        }

        // Focus the window when starting to resize
        if (onFocus) {
            const now = Date.now();
            if (now - lastFocusTime.current > 100) {
                lastFocusTime.current = now;
                onFocus();
            }
        }

        // Set window focus
        setWindowHasFocus(true);
    };

    // Get window style based on position and maximized state
    const getWindowStyle = () => {
        if (maximized) {
            return {
                top: '0',
                left: '0',
                width: '100%',
                height: `calc(100% - ${terminalHeight}px)`,
                zIndex: position.zIndex,
                transform: 'none'
            };
        }

        return {
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
            zIndex: position.zIndex
        };
    };

    // Handle button clicks with explicit stopPropagation
    const handleButtonClick = (action: 'minimize' | 'maximize' | 'close') => (e: React.MouseEvent) => {
        e.stopPropagation();
        onAction && onAction(action);
    };

    // Load focus when component mounts
    useEffect(() => {
        if (isActive && onFocus && !minimized) {
            onFocus();
            setWindowHasFocus(true);
        }
    }, [isActive, onFocus, minimized]);

    if (minimized) {
        return null; // Don't render if minimized
    }

    return (
        <div
            ref={windowRef}
            className={`${styles.window} ${maximized ? styles.maximized : ''} ${isDragging ? styles.dragging : ''} ${isActive ? styles.active : ''} ${windowHasFocus ? styles.hasFocus : ''}`}
            style={getWindowStyle()}
            onClick={handleWindowClick}
            data-window-id={id}
            onMouseDown={handleWindowClick}
        >
            <div
                className={styles.header}
                onMouseDown={handleHeaderMouseDown}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    onAction && onAction('maximize');
                }}
            >
                <div className={styles.title}>{title}</div>
                <div className={styles.controls}>
                    <button
                        className={`${styles.control} ${styles.minimize}`}
                        onClick={handleButtonClick('minimize')}
                        aria-label="Minimize"
                    >
                        <span>-</span>
                    </button>
                    <button
                        className={`${styles.control} ${styles.maximize}`}
                        onClick={handleButtonClick('maximize')}
                        aria-label="Maximize"
                    >
                        <span>{maximized ? '❐' : '□'}</span>
                    </button>
                    <button
                        className={`${styles.control} ${styles.close}`}
                        onClick={handleButtonClick('close')}
                        aria-label="Close"
                    >
                        <span>×</span>
                    </button>
                </div>
            </div>

            <div className={styles.content} onClick={handleWindowClick}>
                {children}
            </div>

            {!maximized && (
                <div
                    className={`${styles.resizeHandle} ${styles.resizeSe}`}
                    onMouseDown={handleResizeMouseDown}
                ></div>
            )}
        </div>
    );
};

export default Window;