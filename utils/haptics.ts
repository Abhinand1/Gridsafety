export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    // Check if the browser supports vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            switch (type) {
                case 'light':
                    navigator.vibrate(10); // Short, sharp tap
                    break;
                case 'medium':
                    navigator.vibrate(40); // Noticeable bump
                    break;
                case 'heavy':
                    navigator.vibrate(80); // Heavy thud
                    break;
                case 'success':
                    navigator.vibrate([10, 30, 10]); // Double tap
                    break;
                case 'error':
                    navigator.vibrate([50, 30, 50, 30, 50]); // Triple buzz
                    break;
            }
        } catch (e) {
            // Ignore errors on devices that don't support it or block it
        }
    }
};
