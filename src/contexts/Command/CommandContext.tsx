import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { FileSystemContext } from '../FileSystem/FileSystemContext.tsx';
import { WindowContext } from '../Window/WindowContext.tsx';
import { CommandContextType, CommandResponse } from './commandTypes.ts';
import { parseCommand } from './commandUtils.ts';
import { handleLsCommand, handleCdCommand, handleCatCommand } from './commandHandlers.ts';

// Default context
const defaultContext: CommandContextType = {
    executeCommand: () => ({ output: [], success: false }),
    executeCommands: () => [],
    executeCommandQueue: () => {},
    queueCommand: () => {},
    clearCommandQueue: () => {},
    isExecutingCommands: false
};

// Create context
export const CommandContext = createContext<CommandContextType>(defaultContext);

// Provider props
interface CommandProviderProps {
    children: ReactNode;
}

// Provider component
export const CommandProvider: React.FC<CommandProviderProps> = ({ children }) => {
    const fileSystem = useContext(FileSystemContext);
    const windowManager = useContext(WindowContext);
    const [commandQueue, setCommandQueue] = useState<string[]>([]);
    const [isExecutingCommands, setIsExecutingCommands] = useState<boolean>(false);

    // Main command execution function
    const executeCommand = useCallback((commandStr: string): CommandResponse => {
        const { command, args } = parseCommand(commandStr);
        const currentPath = fileSystem.currentPath;

        // Define the response object
        let response: CommandResponse = {
            output: [],
            success: true
        };

        // Process commands
        switch (command) {
            case 'ls':
                // List directory contents
                response = handleLsCommand(args, currentPath, fileSystem);
                break;

            case 'cd':
                // Change directory
                response = handleCdCommand(args, currentPath, fileSystem);
                break;

            case 'cat':
                // View file contents or run scenes
                response = handleCatCommand(args, currentPath, fileSystem);
                break;

            case 'pwd':
                // Print working directory
                response.output = [currentPath];
                break;

            case 'clear':
                // Clear terminal screen
                response.action = { type: 'clearTerminal' };
                break;

            case 'help':
                // Show help information
                response.output = [
                    'CYBER ACME OS v3.4.0 - HELP',
                    '----------------------------',
                    'Available commands:',
                    '',
                    'COMMAND: ls [directory]',
                    'DESCRIPTION: List files and directories in the current or specified directory',
                    '',
                    'COMMAND: cd [directory]',
                    'DESCRIPTION: Change to specified directory',
                    '',
                    'COMMAND: cat [file]',
                    'DESCRIPTION: Display file contents or run program/scene',
                    '',
                    'COMMAND: pwd',
                    'DESCRIPTION: Print current working directory',
                    '',
                    'COMMAND: clear',
                    'DESCRIPTION: Clear terminal screen',
                    '',
                    'COMMAND: login',
                    'DESCRIPTION: Login to access restricted areas',
                    '',
                    'COMMAND: logout',
                    'DESCRIPTION: Log out of the system',
                    '',
                    'COMMAND: help',
                    'DESCRIPTION: Display this help information',
                    '',
                    'HINT: Files with .txt extension are text files, others are usually programs or scenes'
                ];
                break;

            case 'login':
                // Handle login
                if (fileSystem.isLoggedIn) {
                    response.output = ['Already logged in as ADMIN'];
                } else {
                    response.output = ['LOGIN ATTEMPT'];
                    response.action = { type: 'login' };
                }
                break;

            case 'logout':
                // Handle logout
                if (fileSystem.isLoggedIn) {
                    fileSystem.logout();
                    response.output = ['Logged out successfully'];
                    response.action = { type: 'logout' };
                } else {
                    response.output = ['Not currently logged in'];
                }
                break;

            case 'home':
                // Return to home screen
                response.output = ['Returning to home screen'];
                response.action = {
                    type: 'navigate',
                    payload: '/home'
                };
                fileSystem.navigateTo('/home');
                break;

            case 'minimizeall':
                // Minimize all windows
                response.output = ['Minimizing all windows'];
                response.action = { type: 'minimizeWindow', payload: 'all' };
                windowManager.minimizeAllWindows();
                break;

            case 'closeall':
                // Close all windows
                response.output = ['Closing all windows'];
                response.action = { type: 'closeWindow', payload: 'all' };
                windowManager.closeAllWindows();
                break;

            default:
                // Unknown command
                response.output = [`ERROR: Unknown command '${command}'`];
                response.success = false;
        }

        return response;
    }, [fileSystem, windowManager]);

    // Execute multiple commands
    const executeCommands = useCallback((commands: string[]): CommandResponse[] => {
        return commands.map(cmd => executeCommand(cmd));
    }, [executeCommand]);

    // Execute command queue
    const executeCommandQueue = useCallback(async (commands: string[]) => {
        if (commands.length === 0 || isExecutingCommands) {
            return;
        }

        setIsExecutingCommands(true);
        setCommandQueue(commands);

        // Process commands one by one with a delay
        for (const cmd of commands) {
            executeCommand(cmd);

            // Update queue
            setCommandQueue(prev => prev.slice(1));

            // Wait a bit between commands
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setIsExecutingCommands(false);
    }, [executeCommand, isExecutingCommands]);

    // Queue a command
    const queueCommand = useCallback((command: string) => {
        setCommandQueue(prev => [...prev, command]);

        // Start execution if not already running
        if (!isExecutingCommands) {
            executeCommandQueue([...commandQueue, command]);
        }
    }, [commandQueue, executeCommandQueue, isExecutingCommands]);

    // Clear command queue
    const clearCommandQueue = useCallback(() => {
        setCommandQueue([]);
    }, []);

    // Context value
    const contextValue: CommandContextType = {
        executeCommand,
        executeCommands,
        executeCommandQueue,
        queueCommand,
        clearCommandQueue,
        isExecutingCommands
    };

    return (
        <CommandContext.Provider value={contextValue}>
            {children}
        </CommandContext.Provider>
    );
};