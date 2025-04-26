import React, { useState, useEffect, useRef } from 'react';
import styles from './Terminal.module.css';

// Define global window extension
declare global {
    interface Window {
        terminalHasFocus: boolean;
    }
}

interface TerminalProps {
    history: string[];
    currentPath: string;
    onCommand: (command: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({
                                               history,
                                               currentPath,
                                               onCommand
                                           }) => {
    // Input and history state
    const [inputValue, setInputValue] = useState<string>('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [tabCompletions, setTabCompletions] = useState<string[]>([]);
    const [showCompletions, setShowCompletions] = useState<boolean>(false);
    const [completionIndex, setCompletionIndex] = useState<number>(0);

    // Terminal resize state
    const [terminalHeight, setTerminalHeight] = useState<number>(250);
    const [resizing, setResizing] = useState<boolean>(false);
    const startYRef = useRef<number>(0);
    const startHeightRef = useRef<number>(0);

    // Focus management state
    const [terminalHasFocus, setTerminalHasFocus] = useState<boolean>(true);
    const terminalFocusTimestampRef = useRef<number>(Date.now());

    // Refs
    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const outputEndRef = useRef<HTMLDivElement>(null);
    const tempInputRef = useRef<string>(''); // Store temp input when navigating history
    const lastCommandRef = useRef<string | null>(null); // To track the last command executed

    // Function to get an appropriate icon based on file name
    const getFileIcon = (fileName: string): string => {
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
                'cyberacme_browser': '🌐',
                'game_launcher': '🎮',
                'calculator': '🧮',
                'clock': '⏰',
                'admin_panel': '⚠️',
                'welcome': '👋'
            };

            if(customIconMap[baseName]) {
                return customIconMap[baseName];
            }

            return '⚙️'; // Default executable icon
        }

        // Default icon
        return '📄';
    };

    // Function to force focus the terminal
    const forceFocusTerminal = () => {
        if (inputRef.current) {
            inputRef.current.focus();
            setTerminalHasFocus(true);
            terminalFocusTimestampRef.current = Date.now();

            // Set global flag
            window.terminalHasFocus = true;
        }
    };

    // Handle terminal blur - clear global focus flag
    const handleTerminalBlur = () => {
        setTerminalHasFocus(false);
        window.terminalHasFocus = false;
    };

    // Function to parse inline tags
    function parseInlineTags(text: string) {
        const tagToClass: { [key: string]: string } = {
            r: styles.red,
            g: styles.green,
            b: styles.blue,
            y: styles.yellow,
            c: styles.cyan,
            w: styles.white,
            rst: styles.restrictedItem,
            dir: styles.directoryItem,
            file: styles.fileItem,
            exe: styles.exeItem
        };

        const tagRegex = /\[(\/?)(r|g|b|y|c|w|rst|dir|file|exe)]/g;

        let lastIndex = 0;
        const output = [];
        const stack = [];
        let match;

        while ((match = tagRegex.exec(text)) !== null) {
            const [fullTag, closing, tagName] = match;
            const idx = match.index;

            if (idx > lastIndex) {
                output.push(text.slice(lastIndex, idx));
            }

            if (!closing) {
                output.push(`<span class="${tagToClass[tagName]}">`);
                stack.push(`</span>`);
            } else if (stack.length) {
                output.push(stack.pop());
            }

            lastIndex = idx + fullTag.length;
        }

        if (lastIndex < text.length) {
            output.push(text.slice(lastIndex));
        }

        while (stack.length) {
            output.push(stack.pop());
        }

        return <span dangerouslySetInnerHTML={{ __html: output.join('') }} />;
    }

    // The public parser: checks for a listing, otherwise delegates to parseInlineTags
    const parseColorTags = (text: string) => {
        if (typeof text !== 'string') return text;

        // Look for a color‐wrapped listing for directories, executable files, text files, etc.
        const listingRegex = /^\[([rgbcyw])](Directories|Executable Files|Text Files|Other Files):\[\/\1]\s*(.*)$/;
        const m = text.match(listingRegex);

        if (m) {
            const [, color, label, itemsText] = m;
            // Reconstruct exactly the label tag so we preserve its color
            const rawLabel = `[${color}]${label}:[/${color}]`;

            // Use parseInlineTags (not parseColorTags) to color the label
            const coloredLabel = parseInlineTags(rawLabel);

            // Now pull out each [dir]…[/dir], [exe]…[/exe], [file]…[/file], etc.
            const itemRegex = /\[(dir|exe|file|rst)](.*?)\[\/(?:dir|exe|file|rst)]/gi;
            const elements: React.ReactNode[] = [];
            let idx = 0, mm;

            while ((mm = itemRegex.exec(itemsText)) !== null) {
                const [fullTag, type, inner] = mm;
                const name = inner.trim().replace(/\s*\(restricted access\)\s*/, '');

                // Get appropriate icon based on type and file name
                let icon = '📄'; // Default icon

                if (type === 'dir') {
                    icon = '📁';
                } else if (type === 'exe') {
                    icon = getFileIcon(name);
                } else if (type === 'file') {
                    icon = getFileIcon(name);
                } else if (type === 'rst') {
                    icon = '🔒';
                }

                elements.push(
                    <span
                        key={`${type}-${name}-${idx++}`}
                        className={`${styles.clickableItem} ${styles[`${type}Item`]}`}
                        onClick={() => handleItemClick(name, type === 'dir' ? 'directory' : 'file')}
                        style={{ marginRight: '0.5em', cursor: 'pointer' }}
                    >
                        {icon} {name}{type === 'dir' ? '/' : ''}
                    </span>
                );
            }

            // If nothing matched, fallback to splitting on whitespace
            if (elements.length === 0 && itemsText.trim()) {
                itemsText.trim().split(/\s+/).forEach((nm, i) => {
                    let type = 'file';
                    let icon = '📄';
                    if (nm.endsWith('/')) {
                        type = 'directory';
                        icon = '📁';
                        nm = nm.replace(/\/$/, '');
                    }
                    elements.push(
                        <span
                            key={`plain-${i}`}
                            className={`${styles.clickableItem} ${type === 'directory' ? styles.directoryItem : styles.fileItem}`}
                            onClick={() => handleItemClick(nm, type)}
                            style={{ marginRight: '0.5em', cursor: 'pointer' }}
                        >
                            {icon} {nm}{type === 'directory' ? '/' : ''}
                        </span>
                    );
                });
            }

            return (
                <div className={styles.listingLine}>
                    {coloredLabel}{' '}
                    {elements.length > 0 ? elements : <em>(no items)</em>}
                </div>
            );
        }

        // Otherwise, just do the normal inline‐tag parsing
        return parseInlineTags(text);
    };

    // Extract commands from terminal history
    useEffect(() => {
        // Find the last command line in history (starts with ADMIN@CYAC: or GUEST@CYAC:)
        const lastCommandLine = [...history].reverse().find(line =>
            line.includes('ADMIN@CYAC:') || line.includes('GUEST@CYAC:')
        );

        if (lastCommandLine) {
            // Extract command text from the line
            const match = lastCommandLine.match(/:.*\$ (.+)$/);
            const commandText = match ? match[1].trim() : null;

            // If we found a command and it's not already in history or empty
            if (commandText && commandText !== lastCommandRef.current && commandText.length > 0) {
                // Update last command ref
                lastCommandRef.current = commandText;

                // Add to command history if not already there
                setCommandHistory(prev => {
                    if (!prev.includes(commandText)) {
                        return [...prev, commandText];
                    }
                    return prev;
                });

                // Reset history index to point to the most recent command next time up is pressed
                setHistoryIndex(-1);
            }
        }
    }, [history]);

    // Auto-scroll to bottom when history changes
    useEffect(() => {
        if (outputEndRef.current) {
            outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    // Setup focus management and global keyboard event handler
    useEffect(() => {
        // Initialize global flag
        window.terminalHasFocus = true;

        // Focus terminal when component mounts
        forceFocusTerminal();

        // Set up global keyboard event listener
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // If terminal has focus, let the event reach the terminal's own handleKeyDown first
            if (window.terminalHasFocus && !e.ctrlKey && !e.metaKey) {
                // Don't do anything in the capturing phase
            }
        };

        // Add the event listener to document in capturing phase
        document.addEventListener('keydown', handleGlobalKeyDown, true);

        return () => {
            // Clean up the event listener and global flag
            document.removeEventListener('keydown', handleGlobalKeyDown, true);
            window.terminalHasFocus = false;
        };
    }, []);

    // Set up resize event handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizing) return;

            // Calculate how much we've moved
            const deltaY = startYRef.current - e.clientY;

            // New height is the starting height plus the movement amount
            let newHeight = startHeightRef.current + deltaY;

            // Apply constraints
            newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, newHeight));

            setTerminalHeight(newHeight);
        };

        const handleMouseUp = () => {
            setResizing(false);
            document.body.classList.remove(styles.resizing);

            // Refocus terminal after resize
            forceFocusTerminal();
        };

        if (resizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove(styles.resizing);
        };
    }, [resizing]);

    // Start resize
    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        setResizing(true);
        startYRef.current = e.clientY;
        startHeightRef.current = terminalHeight;

        // Add a class to prevent text selection during resize
        document.body.classList.add(styles.resizing);
    };

    // Handle terminal container click
    const handleTerminalClick = (e: React.MouseEvent) => {
        // Completely stop propagation for all clicks inside the terminal
        e.stopPropagation();

        // Don't interfere with quick menu or resize handle clicks
        if (e.target instanceof Element && (
            e.target.closest(`.${styles.quickMenu}`) ||
            e.target.closest(`.${styles.taskbar}`) ||
            e.target.classList.contains(styles.resizeHandle))) {
            return;
        }

        // Focus terminal for other clicks
        forceFocusTerminal();
    };

    // Handle click on items in the terminal
    const handleItemClick = (itemName: string, itemType: string) => {
        // Skip if it's not a recognized item type
        if (!itemType) return;

        let command = '';

        switch (itemType) {
            case 'directory':
            case 'dir':
                command = `cd ${itemName}`;
                break;

            case 'file':
                command = `cat ${itemName}`;
                break;

            default:
                return; // Unknown item type
        }

        // Focus the terminal first
        forceFocusTerminal();

        // Execute the command
        if (command) {
            // Add to command history
            setCommandHistory(prev => [...prev, command]);

            // Reset history index
            setHistoryIndex(-1);

            // Execute the command
            onCommand(command);

            // Reset input
            setInputValue('');
        }
    };

    // Handle tab key for completions
    const handleTabCompletion = () => {
        const completions = generateCompletions();

        if (completions.length === 1) {
            // Apply single completion
            const parts = inputValue.split(' ');
            parts[parts.length - 1] = completions[0];
            setInputValue(parts.join(' '));
        } else if (completions.length > 1) {
            // Show multiple completions
            setTabCompletions(completions);
            setShowCompletions(true);
            setCompletionIndex(0);
        }
    };

    // Apply a specific completion
    const applyCompletion = (completion: string) => {
        const parts = inputValue.split(' ');
        parts[parts.length - 1] = completion;
        setInputValue(parts.join(' '));
        setShowCompletions(false);
        forceFocusTerminal();
    };

    // Navigate through command history
    const navigateHistory = (direction: number) => {
        // If history is empty, nothing to do
        if (commandHistory.length === 0) {
            return;
        }

        // Calculate new index with boundary checks
        let newIndex = historyIndex + direction;

        // Constrain the index within valid range: -1 to history.length-1
        if (newIndex < -1) newIndex = -1;
        if (newIndex >= commandHistory.length) newIndex = commandHistory.length - 1;

        // If we're going from current input to history, save the current input
        if (historyIndex === -1 && newIndex !== -1) {
            tempInputRef.current = inputValue;
        }

        // Update the history index
        setHistoryIndex(newIndex);

        // Set input value based on new index
        if (newIndex === -1) {
            // Restore saved input when coming back to current
            setInputValue(tempInputRef.current || '');
        } else {
            // Set to historical command when navigating history
            // Access from the end of the array - newest commands are at the end
            const command = commandHistory[commandHistory.length - 1 - newIndex];
            setInputValue(command);
        }
    };

    // Handle key events
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle arrow key navigation FIRST, then stop propagation after handling
        if (e.key === 'ArrowUp') {
            e.preventDefault();

            if (showCompletions) {
                setCompletionIndex(prev => (prev > 0 ? prev - 1 : tabCompletions.length - 1));
            } else {
                // Navigate UP in history (increase index to go back in time)
                navigateHistory(1);
            }
            // Stop propagation AFTER handling the event
            e.stopPropagation();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();

            if (showCompletions) {
                setCompletionIndex(prev => (prev < tabCompletions.length - 1 ? prev + 1 : 0));
            } else {
                // Navigate DOWN in history (decrease index to go forward in time)
                navigateHistory(-1);
            }
            // Stop propagation AFTER handling the event
            e.stopPropagation();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTabCompletion();
            // Stop propagation AFTER handling the event
            e.stopPropagation();
        } else if (e.key === 'Enter' && showCompletions) {
            e.preventDefault();
            applyCompletion(tabCompletions[completionIndex]);
            // Stop propagation AFTER handling the event
            e.stopPropagation();
        } else if (e.key === 'Escape') {
            if (showCompletions) {
                e.preventDefault();
                setShowCompletions(false);
                // Stop propagation AFTER handling the event
                e.stopPropagation();
            }
        } else {
            // For all other keys, we want normal typing behavior,
            // but this needs to stop propagation to prevent windows from receiving keyboard events
            if (window.terminalHasFocus) {
                e.stopPropagation();
            }
        }
    };

    // Generate tab completions
    const generateCompletions = () => {
        // Get current word
        const parts = inputValue.split(' ');
        const command = parts[0].toLowerCase();
        const currentWord = parts[parts.length - 1];

        let completions: string[] = [];

        if (parts.length <= 1) {
            // Command completion
            const commands = [
                'ls', 'cd', 'cat', 'pwd', 'clear', 'echo', 'date', 'whoami',
                'login', 'logout', 'sudo', 'access', 'help', 'home', 'game_launcher.exe',
                'cyberacme_browser.exe', 'calculator.exe', 'clock.exe'
            ];
            completions = commands.filter(cmd => cmd.startsWith(currentWord.toLowerCase()));
        } else if (['cd', 'ls', 'cat'].includes(command)) {
            // This needs to connect to the file system
            const pathOptions = [
                'home/', 'programs/', 'system/', 'documents/',
                'game_launcher.exe', 'cyberacme_browser.exe', 'calculator.exe', 'clock.exe',
                'readme.txt', 'user_manual.txt', 'system_info.txt'
            ];

            completions = pathOptions.filter(path =>
                path.toLowerCase().startsWith(currentWord.toLowerCase())
            );
        }

        return completions;
    };

    // Submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation here as well

        if (inputValue.trim()) {
            // Store current command before clearing input
            const commandToExecute = inputValue.trim();

            // Add to command history BEFORE executing command
            setCommandHistory(prev => [...prev, commandToExecute]);

            // Reset history navigation state
            setHistoryIndex(-1);
            tempInputRef.current = '';

            // Clear input and close completions
            setInputValue('');
            setShowCompletions(false);

            // Execute command
            onCommand(commandToExecute);

            // Refocus terminal
            setTimeout(forceFocusTerminal, 10);
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setShowCompletions(false);
    };

    // Helper function to style different types of terminal lines
    const getLineClass = (line: string): string => {
        // Basic line types
        if (line.startsWith('ERROR:')) {
            return styles.error;
        } else if (line.startsWith('WARNING:')) {
            return styles.warning;
        } else if (line.startsWith('SUCCESS:')) {
            return styles.success;
        } else if (line.includes('ADMIN@CYAC:') || line.includes('GUEST@CYAC:')) {
            return styles.command;
        }

        // User-related messages
        if (line.includes('Login successful')) {
            return styles.loginSuccess;
        } else if (line.includes('Authentication failed') || line.includes('Invalid password')) {
            return styles.loginFailure;
        } else if (line.includes('ACCESS DENIED')) {
            return styles.accessDenied;
        }

        // Directory and file listings
        if (line.startsWith('Directories:') || line.startsWith('[g]Directories:')) {
            return styles.directoryListing;
        } else if (line.startsWith('Executable Files:') || line.startsWith('[c]Executable Files:')) {
            return styles.executableListing;
        } else if (line.startsWith('Text Files:') || line.startsWith('[y]Text Files:')) {
            return styles.textFileListing;
        } else if (line.startsWith('Other Files:') || line.startsWith('[b]Other Files:')) {
            return styles.otherFileListing;
        } else if (line.startsWith('Restricted:') || line.startsWith('[r]Restricted:')) {
            return styles.restrictedListing;
        }

        // Help and information
        if (line.startsWith('CYBER ACME OS') || line.startsWith('---')) {
            return styles.header;
        } else if (line.includes('HINT:')) {
            return styles.hint;
        } else if (line.startsWith('COMMAND:')) {
            return styles.helpCommand;
        } else if (line.startsWith('DESCRIPTION:') || line.startsWith('USAGE:')) {
            return styles.helpDescription;
        }

        // Default output
        return styles.output;
    };

    return (
        <div
            className={`${styles.container} ${resizing ? styles.resizing : ''} ${terminalHasFocus ? styles.hasFocus : ''}`}
            ref={terminalRef}
            style={{ height: `${terminalHeight}px` }}
            onClick={handleTerminalClick}
        >
            {/* Resize handle */}
            <div
                className={styles.resizeHandle}
                onMouseDown={startResize}
            ></div>

            {/* Terminal Output */}
            <div className={styles.outputContainer} onClick={handleTerminalClick}>
                {history.map((line, index) => (
                    <div
                        key={`line-${index}`}
                        className={`${styles.line} ${getLineClass(line)}`}
                    >
                        {parseColorTags(line)}
                    </div>
                ))}
                <div ref={outputEndRef}></div>
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleSubmit} className={styles.inputLine} onClick={handleTerminalClick}>
                <span className={styles.prompt}>
                    {`${'GUEST'}@CYAC:${currentPath}$`}
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setTerminalHasFocus(true);
                        window.terminalHasFocus = true;
                        terminalFocusTimestampRef.current = Date.now();
                    }}
                    onBlur={handleTerminalBlur}
                    autoFocus
                    autoComplete="off"
                    aria-label="Terminal input"
                    spellCheck="false"
                />
            </form>

            {/* Tab Completions */}
            {showCompletions && tabCompletions.length > 0 && (
                <div className={styles.completions}>
                    {tabCompletions.map((completion, index) => (
                        <div
                            key={`completion-${index}`}
                            className={`${styles.completionItem} ${index === completionIndex ? styles.active : ''}`}
                            onClick={() => applyCompletion(completion)}
                        >
                            {completion}
                        </div>
                    ))}
                </div>
            )}

            {/* Keyboard focus indicator - only show when not focused */}
            {!terminalHasFocus && (
                <div
                    className={styles.focusIndicator}
                    onClick={(e) => {
                        e.stopPropagation();
                        forceFocusTerminal();
                    }}
                >
                    <div className={styles.focusHint}>CLICK HERE TO TYPE IN TERMINAL</div>
                </div>
            )}
        </div>
    );
};

export default Terminal;