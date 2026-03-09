/**
 * Haptic feedback utility using Web Vibration API
 */
export const hapticFeedback = {
    /**
     * Light pulse for subtle interactions (soft click)
     */
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    /**
     * Medium pulse for primary actions (success)
     */
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },

    /**
     * Heavy pulse for important actions
     */
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(40);
        }
    },

    /**
     * Error pattern (triple pulse)
     */
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30, 50, 30]);
        }
    },

    /**
     * Success pattern (double pulse)
     */
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([15, 30, 20]);
        }
    }
};
