import { ComponentType } from 'react';
import { FileSystemComponentProps } from '../FileSystem/fileSystemTypes.ts';

// Action types
export type CommandActionType =
    | 'navigate'
    | 'openWindow'
    | 'closeWindow'
    | 'minimizeWindow'
    | 'clearTerminal'
    | 'login'
    | 'logout';

// Window payload type
export interface WindowPayload {
    id: string;
    title: string;
    component: ComponentType<FileSystemComponentProps>;
    props?: FileSystemComponentProps;
}

// Action payload type
export type CommandActionPayload =
    | string
    | WindowPayload
    | 'all';

// Command action interface
export interface CommandAction {
    type: CommandActionType;
    payload?: CommandActionPayload;
}

// Command response interface
export interface CommandResponse {
    output: string[];
    success: boolean;
    action?: CommandAction;
}

// Command context interface
export interface CommandContextType {
    executeCommand: (command: string) => CommandResponse;
    executeCommands: (commands: string[]) => CommandResponse[];
    executeCommandQueue: (commands: string[]) => void;
    queueCommand: (command: string) => void;
    clearCommandQueue: () => void;
    isExecutingCommands: boolean;
}