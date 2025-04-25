import React, { createContext, useState, useCallback, ReactNode, ComponentType } from 'react';

// Window interface
export interface Window {
    id: string;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    maximized: boolean;
    minimized: boolean;
    component: ComponentType<any> | null;
    props?: Record<string, any>;
}

// Window context interface
interface WindowContextType {
    windows: Window[];
    activeWindowId: string | null;
    openWindow: (
        id: string,
        title: string,
        component: ComponentType<any>,
        props?: Record<string, any>,
        position?: { x: number, y: number, width: number, height: number }
    ) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    setActiveWindowId: (id: string | null) => void;
    updateWindowPosition: (id: string, x: number, y: number) => void;
    updateWindowSize: (id: string, width: number, height: number) => void;
    closeAllWindows: () => void;
    minimizeAllWindows: () => void;
}

// Default context value
const defaultContextValue: WindowContextType = {
    windows: [],
    activeWindowId: null,
    openWindow: () => {},
    closeWindow: () => {},
    minimizeWindow: () => {},
    maximizeWindow: () => {},
    setActiveWindowId: () => {},
    updateWindowPosition: () => {},
    updateWindowSize: () => {},
    closeAllWindows: () => {},
    minimizeAllWindows: () => {}
};

// Create context
export const WindowContext = createContext<WindowContextType>(defaultContextValue);

// Provider component
interface WindowProviderProps {
    children: ReactNode;
}

export const WindowProvider: React.FC<WindowProviderProps> = ({ children }) => {
    const [windows, setWindows] = useState<Window[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [highestZIndex, setHighestZIndex] = useState(1000);

    // Open a new window
    const openWindow = useCallback((
        id: string,
        title: string,
        component: ComponentType<any>,
        props?: Record<string, any>,
        position = {
            x: 100,
            y: 100,
            width: 800,
            height: 600
        }
    ) => {
        // Check if window with this ID already exists
        const existingWindowIndex = windows.findIndex(w => w.id === id);

        if (existingWindowIndex >= 0) {
            // Window exists, just bring it to front
            const newZIndex = highestZIndex + 1;
            setHighestZIndex(newZIndex);

            setWindows(prevWindows => {
                const updatedWindows = [...prevWindows];
                updatedWindows[existingWindowIndex] = {
                    ...updatedWindows[existingWindowIndex],
                    minimized: false,
                    zIndex: newZIndex
                };
                return updatedWindows;
            });

            setActiveWindowId(id);
            return;
        }

        // Create new window
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        const newWindow: Window = {
            id,
            title,
            x: position.x,
            y: position.y,
            width: position.width,
            height: position.height,
            zIndex: newZIndex,
            maximized: false,
            minimized: false,
            component,
            props
        };

        setWindows(prevWindows => [...prevWindows, newWindow]);
        setActiveWindowId(id);
    }, [windows, highestZIndex]);

    // Close a window
    const closeWindow = useCallback((id: string) => {
        setWindows(prevWindows => prevWindows.filter(window => window.id !== id));

        // If we closed the active window, find another window to focus
        if (activeWindowId === id) {
            const remainingWindows = windows.filter(window => window.id !== id);
            if (remainingWindows.length > 0) {
                // Find the window with the highest zIndex that isn't minimized
                const newActiveWindow = remainingWindows
                    .filter(w => !w.minimized)
                    .sort((a, b) => b.zIndex - a.zIndex)[0];

                setActiveWindowId(newActiveWindow ? newActiveWindow.id : null);
            } else {
                setActiveWindowId(null);
            }
        }
    }, [windows, activeWindowId]);

    // Minimize a window
    const minimizeWindow = useCallback((id: string) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, minimized: true }
                    : window
            )
        );

        // If we minimized the active window, find another window to focus
        if (activeWindowId === id) {
            const visibleWindows = windows
                .filter(w => w.id !== id && !w.minimized)
                .sort((a, b) => b.zIndex - a.zIndex);

            setActiveWindowId(visibleWindows.length > 0 ? visibleWindows[0].id : null);
        }
    }, [windows, activeWindowId]);

    // Maximize or restore a window
    const maximizeWindow = useCallback((id: string) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, maximized: !window.maximized }
                    : window
            )
        );

        // Make this window active
        setActiveWindowId(id);
    }, []);

    // Update window position
    const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, x, y }
                    : window
            )
        );
    }, []);

    // Update window size
    const updateWindowSize = useCallback((id: string, width: number, height: number) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, width, height }
                    : window
            )
        );
    }, []);

    // Close all windows
    const closeAllWindows = useCallback(() => {
        setWindows([]);
        setActiveWindowId(null);
    }, []);

    // Minimize all windows
    const minimizeAllWindows = useCallback(() => {
        setWindows(prevWindows =>
            prevWindows.map(window => ({ ...window, minimized: true }))
        );
        setActiveWindowId(null);
    }, []);

    // When setting an active window, bring it to front by updating its zIndex
    const setActiveWindowWithFocus = useCallback((id: string | null) => {
        if (id === null) {
            setActiveWindowId(null);
            return;
        }

        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, zIndex: newZIndex }
                    : window
            )
        );

        setActiveWindowId(id);
    }, [highestZIndex]);

    const contextValue: WindowContextType = {
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        setActiveWindowId: setActiveWindowWithFocus,
        updateWindowPosition,
        updateWindowSize,
        closeAllWindows,
        minimizeAllWindows
    };

    return (
        <WindowContext.Provider value={contextValue}>
            {children}
        </WindowContext.Provider>
    );
};