import React, { useContext } from 'react';
import Window from '../Window/Window';
import { WindowContext } from '../../contexts/Window/WindowContext.tsx';
import styles from './WindowManager.module.css';

/*interface WindowManagerProps {
    // Add any additional props if needed
}*/

type WindowManagerProps = object

const WindowManager: React.FC<WindowManagerProps> = () => {
    const {
        windows,
        activeWindowId,
        setActiveWindowId,
        updateWindowPosition,
        updateWindowSize,
        minimizeWindow,
        maximizeWindow,
        closeWindow
    } = useContext(WindowContext);

    const handleWindowFocus = (id: string) => {
        setActiveWindowId(id);
    };

    const handleWindowAction = (id: string, action: 'minimize' | 'maximize' | 'close') => {
        switch (action) {
            case 'minimize':
                minimizeWindow(id);
                break;
            case 'maximize':
                maximizeWindow(id);
                break;
            case 'close':
                closeWindow(id);
                break;
        }
    };

    const handleWindowMove = (id: string, x: number, y: number) => {
        updateWindowPosition(id, x, y);
    };

    const handleWindowResize = (id: string, width: number, height: number) => {
        updateWindowSize(id, width, height);
    };

    return (
        <div className={styles.container}>
            {windows.map((window) => (
                <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    position={{
                        x: window.x,
                        y: window.y,
                        width: window.width,
                        height: window.height,
                        zIndex: window.zIndex
                    }}
                    maximized={window.maximized}
                    minimized={window.minimized}
                    isActive={activeWindowId === window.id}
                    onFocus={() => handleWindowFocus(window.id)}
                    onAction={(action) => handleWindowAction(window.id, action)}
                    onMove={(x, y) => handleWindowMove(window.id, x, y)}
                    onResize={(width, height) => handleWindowResize(window.id, width, height)}
                >
                    {/* Render the component based on the window type */}
                    {window.component && React.createElement(window.component, window.props || {})}
                </Window>
            ))}
        </div>
    );
};

export default WindowManager;