import { WindowContext, WindowProvider, Window } from './WindowContext';
import useWindow from './useWindow';

// Re-export everything
export {
    WindowContext,
    WindowProvider,
    useWindow,
    type Window
};

// Default export the provider for convenience
export default WindowProvider;