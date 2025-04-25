import React, {useEffect, useState, useCallback} from 'react';
import styles from './BootSequence.module.css';

interface BootSequenceProps {
    onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
    const [currentStage, setCurrentStage] = useState<number>(0);
    const [memoryProgress, setMemoryProgress] = useState<number>(0);
    const [cpuProgress, setCpuProgress] = useState<number>(0);
    const [diskProgress, setDiskProgress] = useState<number>(0);
    const [networkProgress, setNetworkProgress] = useState<number>(0);
    const [currentLine, setCurrentLine] = useState<number>(0);
    const [showCursor, setShowCursor] = useState<boolean>(true);

    // Boot messages
    const bootMessages = [
        'CYAC BIOS v2.5.7',
        'COPYRIGHT (C) 2025 CYBERACME TECHNOLOGIES',
        'BIOS DATE: 01/15/25',
        'INITIALIZING BIOS...',
        'CPU: QUANTUM CORE i9-X @ 5.2GHZ',
        'CHECKING SYSTEM CONFIGURATION...',
        'PERFORMING MEMORY TEST...',
        'TESTING MEMORY BLOCK: 00B - 08B',
        'TESTING MEMORY BLOCK: 08B - 16B',
        'TESTING MEMORY BLOCK: 16B - 24B',
        'TESTING MEMORY BLOCK: 24B - 32B',
        '32GB MEMORY DETECTED. PASSED.',
        'CHECKING STORAGE DEVICES...',
        'STORAGE: 2TB QUANTUM SSD DETECTED',
        'STORAGE: 16TB HOLOGRAPHIC ARRAY DETECTED',
        'INITIALIZING NETWORK ADAPTERS...',
        'NETWORK: QUANTUM ENTANGLEMENT MODULE v4.2 DETECTED',
        'LOADING CYBERACME OS...',
        'INITIALIZING SECURITY PROTOCOLS...',
        'SECURITY LEVEL: ALPHA',
        'AUTHENTICATION SYSTEM: ACTIVE',
        'FIREWALL: ACTIVE',
        'ENCRYPTION MODULE: ACTIVE',
        'LAUNCHING SYSTEM SERVICES...',
        'WELCOME TO CYBERACME OS v3.4.0'
    ];

    // Define boot stage handlers with useCallback to avoid recreation on each render
    const handleInitialBiosStage = useCallback(() => {
        const timer = setTimeout(() => {
            setCurrentStage(1);
            setCurrentLine(7); // Start memory tests
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    const handleMemoryTestStage = useCallback(() => {
        const interval = setInterval(() => {
            setMemoryProgress(prev => {
                const newProgress = prev + 2;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setCurrentStage(2);
                        setCurrentLine(12); // Start disk checks
                    }, 500);
                }
                return newProgress > 100 ? 100 : newProgress;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleDiskCheckStage = useCallback(() => {
        const interval = setInterval(() => {
            setDiskProgress(prev => {
                const newProgress = prev + 3;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setCurrentStage(3);
                        setCurrentLine(16); // Start network init
                    }, 500);
                }
                return newProgress > 100 ? 100 : newProgress;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleNetworkInitStage = useCallback(() => {
        const interval = setInterval(() => {
            setNetworkProgress(prev => {
                const newProgress = prev + 3;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setCurrentStage(4);
                        setCurrentLine(18); // Start OS loading
                    }, 500);
                }
                return newProgress > 100 ? 100 : newProgress;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleOsLoadingStage = useCallback(() => {
        const interval = setInterval(() => {
            setCpuProgress(prev => {
                const newProgress = prev + 1.5;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    // Boot complete, move to final stage
                    setTimeout(() => {
                        setCurrentStage(5);
                    }, 1000);
                }
                return newProgress > 100 ? 100 : newProgress;
            });
        }, 75);

        // Show remaining messages one by one
        let msgIndex = 18;
        const messageInterval = setInterval(() => {
            if (msgIndex < bootMessages.length) {
                setCurrentLine(msgIndex);
                msgIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 600);

        return () => {
            clearInterval(interval);
            clearInterval(messageInterval);
        };
    }, [bootMessages.length]); // Add bootMessages.length as a dependency

    const handleBootCompleteStage = useCallback(() => {
        // Notify parent that boot is complete after a delay
        const timer = setTimeout(() => {
            onComplete();
        }, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    // Boot stages
    useEffect(() => {
        let cleanup;
        // Run the current stage handler
        switch (currentStage) {
            case 0:
                cleanup = handleInitialBiosStage();
                break;
            case 1:
                cleanup = handleMemoryTestStage();
                break;
            case 2:
                cleanup = handleDiskCheckStage();
                break;
            case 3:
                cleanup = handleNetworkInitStage();
                break;
            case 4:
                cleanup = handleOsLoadingStage();
                break;
            case 5:
                cleanup = handleBootCompleteStage();
                break;
            default:
                break;
        }

        // Cleanup when component unmounts or stage changes
        return cleanup;
    }, [
        currentStage,
        handleInitialBiosStage,
        handleMemoryTestStage,
        handleDiskCheckStage,
        handleNetworkInitStage,
        handleOsLoadingStage,
        handleBootCompleteStage
    ]);

    // Blinking cursor
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(cursorInterval);
    }, []);

    // Animate boot text display
    useEffect(() => {
        // Auto-scroll
        const bootScreenElement = document.querySelector(`.${styles.bootScreen}`);
        if (bootScreenElement) {
            bootScreenElement.scrollTop = bootScreenElement.scrollHeight;
        }
    }, [currentLine]);

    return (
        <div className={styles.bootContainer}>
            <div className={styles.bootScreen}>
                {/* BIOS Header */}
                <div className={styles.biosHeader}>
                    <span className={styles.biosLogo}>CYBERACME</span>
                    <span className={styles.biosVersion}>BIOS v2.5.7</span>
                </div>

                {/* Boot Messages */}
                <div className={styles.bootMessages}>
                    {bootMessages.slice(0, currentLine + 1).map((message, index) => (
                        <div key={index} className={styles.bootLine}>
                            {message}
                        </div>
                    ))}
                    <div className={styles.cursorLine}>
                        {showCursor && <span className={styles.cursor}>_</span>}
                    </div>
                </div>

                {/* Progress Bars */}
                {currentStage >= 1 && (
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>MEMORY CHECK:</div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${memoryProgress}%`,
                                    backgroundImage: `linear-gradient(to right, #ff0000 0%, #ff0000 50%, #00cc00 50%, #00cc00 100%)`
                                }}
                            ></div>
                            <div className={styles.progressText}>{memoryProgress}%</div>
                        </div>
                    </div>
                )}

                {currentStage >= 2 && (
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>DISK CHECK:</div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${diskProgress}%` }}
                            ></div>
                            <div className={styles.progressText}>{diskProgress}%</div>
                        </div>
                    </div>
                )}

                {currentStage >= 3 && (
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>NETWORK INIT:</div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${networkProgress}%` }}
                            ></div>
                            <div className={styles.progressText}>{networkProgress}%</div>
                        </div>
                    </div>
                )}

                {currentStage >= 4 && (
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>SYSTEM BOOT:</div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${cpuProgress}%` }}
                            ></div>
                            <div className={styles.progressText}>{cpuProgress}%</div>
                        </div>
                    </div>
                )}

                {/* Boot Complete Message */}
                {currentStage === 5 && (
                    <div className={styles.bootComplete}>
                        SYSTEM READY
                    </div>
                )}
            </div>
        </div>
    );
};

export default BootSequence;