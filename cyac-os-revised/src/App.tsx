import React, { useState } from 'react';
import BootSequence from './components/BootSequence/BootSequence';
import Terminal from './components/Terminal/Terminal';
import Taskbar from './components/Taskbar/Taskbar';
import WindowManager from './components/WindowManager/WindowManager';
import NoScene from './components/NoScene/NoScene';
import CrtEffects from './components/CrtEffects/CrtEffects';

// Import context providers from index files
import { FileSystemProvider } from './contexts/FileSystem';
import { CommandProvider } from './contexts/Command';
import { WindowProvider } from './contexts/Window';
import { ThemeProvider } from './contexts/Theme';
import './App.css';

const App: React.FC = () => {
    // Application state
    const [isPoweredOn, setIsPoweredOn] = useState(false);
    const [isBooting, setIsBooting] = useState(false);
    const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('/home');
    const [activeScene] = useState<string | null>(null);

    // Power on the system
    const handlePowerOn = () => {
        setIsPoweredOn(true);
        setIsBooting(true);

        // Play boot sound if available
        const bootSound = new Audio('/sounds/boot.mp3');
        bootSound.play().catch(e => console.log('Audio play failed:', e));
    };

    // Complete boot sequence
    const handleBootComplete = () => {
        setIsBooting(false);
        setTerminalHistory([
            'CYBER ACME OS v3.4.0 - (c) 2025 CyberAcme Technologies',
            '---------------------------------------------------',
            'Type "help" for a list of available commands'
        ]);
    };

    // Execute terminal command
    const handleCommand = (command: string) => {
        const updatedHistory = [...terminalHistory];
        updatedHistory.push(`GUEST@CYAC:${currentPath}$ ${command}`);

        // Handle specific commands
        if (command === 'clear') {
            setTerminalHistory([]);
            return;
        }

        // Handle cd command to update current path
        if (command.startsWith('cd ')) {
            const targetPath = command.substring(3).trim();
            // This needs to be more robust and sophisticated
            //TODO make this more robust and sophisticated, add support for file scanning in dirs, etc
            if (targetPath === '..') {
                // Go up one level
                const pathParts = currentPath.split('/').filter(Boolean);
                if (pathParts.length > 0) {
                    pathParts.pop();
                    setCurrentPath('/' + pathParts.join('/'));
                }
            } else if (targetPath === '~' || targetPath === '/home') {
                // Go to home page
                setCurrentPath('/home');
            } else if (targetPath.startsWith('/')) {
                // Absolute path
                setCurrentPath(targetPath);
            } else {
                // Relative path
                const newPath = currentPath === '/'
                    ? `/${targetPath}`
                    : `${currentPath}/${targetPath}`;
                setCurrentPath(newPath);
            }
            updatedHistory.push(`Changed directory to: ${currentPath}`);
        } else {
            // For other commands, just echo
            updatedHistory.push(`Command executed: ${command}`);
        }

        setTerminalHistory(updatedHistory);
    };

    // Render power button screen before boot
    if (!isPoweredOn) {
        return (
            <div className="power-screen">
                <button className="power-button" onClick={handlePowerOn}>
                    CLICK TO POWER ON
                </button>
                <div className="power-icon">
                    <div className="power-icon-inner"></div>
                </div>
                <div className="system-idle-text">SYSTEM IDLE</div>
            </div>
        );
    }

    // Render boot sequence
    if (isBooting) {
        return <BootSequence onComplete={handleBootComplete} />;
    }

    // Main application render
    return (
        <ThemeProvider>
            <FileSystemProvider>
                <CommandProvider>
                    <WindowProvider>
                        <div className="app-container">
                            <CrtEffects />

                            <div className="main-content">
                                {activeScene ? (
                                    <div className="scene-container">
                                        {/* Scene component would be rendered here */}
                                        <div className="active-scene">
                                            [Scene: {activeScene}]
                                        </div>
                                    </div>
                                ) : (
                                    <NoScene />
                                )}
                            </div>

                            <Terminal
                                history={terminalHistory}
                                currentPath={currentPath}
                                onCommand={handleCommand}
                            />

                            <WindowManager />

                            <Taskbar
                                items={[]}
                                onItemClick={() => {}}
                                onCloseWindow={() => {}}
                                activeWindowId={null}
                                onCommandExecute={handleCommand}
                            />
                        </div>
                    </WindowProvider>
                </CommandProvider>
            </FileSystemProvider>
        </ThemeProvider>
    );
};

export default App;