import React, { useState, useEffect, useRef } from 'react';
import {
    CrtEffectsContext,
    CrtEffectsSettings,
    defaultSettings
} from '../../contexts/CrtEffects/CrtEffectsContext.tsx';
import styles from './CrtEffects.module.css';

// Main CRT Effects component
const CrtEffects: React.FC = () => {
    // Show/hide settings modal
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

    // Effects state
    const [effects, setEffects] = useState<CrtEffectsSettings>(defaultSettings);

    // Ref to skip saving on first load
    const isFirstSave = useRef<boolean>(true);

    // Load saved settings
    useEffect(() => {
        const saved = localStorage.getItem('crtEffects');
        if (saved) {
            try {
                setEffects(JSON.parse(saved));
            } catch (e) {
                console.warn('Failed to parse saved CRT settings', e);
            }
        }
    }, []);

    // Save settings
    useEffect(() => {
        if (isFirstSave.current) {
            isFirstSave.current = false;
            return;
        }
        localStorage.setItem('crtEffects', JSON.stringify(effects));
    }, [effects]);

    // Toggle settings modal
    const toggleSettingsModal = () => {
        setShowSettingsModal(!showSettingsModal);
    };

    // Toggle an individual effect
    const toggleEffect = (effectName: keyof CrtEffectsSettings) => {
        setEffects(prev => ({
            ...prev,
            [effectName]: !prev[effectName]
        }));
    };

    // Toggle all effects on/off
    const toggleAllEffects = () => {
        const newEnabledState = !effects.enabled;
        setEffects(prev => ({
            ...prev,
            enabled: newEnabledState,
            // If we're turning everything on, set all effects to true
            // Otherwise, keep their individual states (they'll be ignored if master is off)
            ...(!prev.enabled && {
                scanlines: true,
                verticalLines: true,
                paintLine: true,
                vignette: true,
                glow: true,
                flicker: true,
                glitch: true,
                curvature: true,
                dotPattern: true
            })
        }));
    };

    // Update animation for scanlines when toggled
    useEffect(() => {
        // Get all elements with scanLine animation
        const scanLineElements = document.querySelectorAll('[class*="no-scene-wrapper"]::after, [class*="window"]::after');

        scanLineElements.forEach(element => {
            if (element instanceof HTMLElement) {
                element.style.animation = effects.enabled && effects.scanlines
                    ? 'scanLine 8s linear infinite'
                    : 'none';
            }
        });

        // Update dot patterns
        const dotPatterns = document.querySelectorAll('[class*="dot-pattern-canvas"]');
        dotPatterns.forEach(el => {
            if (el instanceof HTMLElement) {
                el.style.visibility = (effects.enabled && effects.dotPattern) ? 'visible' : 'hidden';
            }
        });
    }, [effects.enabled, effects.scanlines, effects.dotPattern]);

    // Create context value
    const contextValue = {
        effects,
        toggleEffect,
        toggleAllEffects
    };

    return (
        <CrtEffectsContext.Provider value={contextValue}>
            {/* CRT Effects Container */}
            <div
                className={styles.container}
                style={{ opacity: effects.enabled ? 1 : 0 }}
            >
                {effects.scanlines && <div className={styles.scanlines}></div>}
                {effects.verticalLines && <div className={styles.verticalLines}></div>}
                {effects.paintLine && <div className={styles.paintLine}></div>}
                {effects.vignette && <div className={styles.vignette}></div>}
                {effects.glow && <div className={styles.glowEffect}></div>}
                {effects.curvature && <div className={styles.barrelDistortion}></div>}
                {effects.flicker && <div className={styles.screenFlicker}></div>}
                {/*<div className={`${styles.glitchEffect} ${effects.enabled && effects.glitch ? styles.active : ''}`}></div>*/}
                <div className={`${styles.horizontalGlitch} ${effects.enabled && effects.glitch ? styles.active : ''}`}></div>
            </div>

            {/* Settings Button */}
            <button className={styles.settingsButton} onClick={toggleSettingsModal}>
                <span>CRT EFFECTS</span>
            </button>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className={styles.settingsModal}>
                    <div className={styles.settingsContent}>
                        <h3>CRT EFFECT SETTINGS</h3>

                        <div className={`${styles.settingItem} ${styles.masterToggle}`}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={effects.enabled}
                                    onChange={toggleAllEffects}
                                />
                                Enable CRT Effects
                            </label>
                        </div>

                        <div className={styles.settingsGroup}>
                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.scanlines}
                                        onChange={() => toggleEffect('scanlines')}
                                        disabled={!effects.enabled}
                                    />
                                    Scanlines
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.verticalLines}
                                        onChange={() => toggleEffect('verticalLines')}
                                        disabled={!effects.enabled}
                                    />
                                    Vertical Lines
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.paintLine}
                                        onChange={() => toggleEffect('paintLine')}
                                        disabled={!effects.enabled}
                                    />
                                    Paint Lines
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.vignette}
                                        onChange={() => toggleEffect('vignette')}
                                        disabled={!effects.enabled}
                                    />
                                    Vignette (Darker Corners)
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.glow}
                                        onChange={() => toggleEffect('glow')}
                                        disabled={!effects.enabled}
                                    />
                                    Green Glow
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.flicker}
                                        onChange={() => toggleEffect('flicker')}
                                        disabled={!effects.enabled}
                                    />
                                    Screen Flicker
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.curvature}
                                        onChange={() => toggleEffect('curvature')}
                                        disabled={!effects.enabled}
                                    />
                                    Screen Curvature
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={effects.dotPattern}
                                        onChange={() => toggleEffect('dotPattern')}
                                        disabled={!effects.enabled}
                                    />
                                    Dot Pattern (NoScene)
                                </label>
                            </div>
                        </div>

                        <div className={styles.settingsActions}>
                            <button onClick={toggleSettingsModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </CrtEffectsContext.Provider>
    );
};

export default CrtEffects;