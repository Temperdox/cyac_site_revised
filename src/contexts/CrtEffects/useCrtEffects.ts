import { useContext } from 'react';
import { CrtEffectsContext } from './CrtEffectsContext';

/**
 * Hook for using the CRT effects context
 */
const useCrtEffects = () => useContext(CrtEffectsContext);

export default useCrtEffects;