
/**
 * ═══════════════════════════════════════════════════════════
 * MICROSOFT IMAGINE CUP 2026 - AZURE AI CONFIGURATION
 * ═══════════════════════════════════════════════════════════
 */

export const AZURE_CONFIG = {
    VISION: {
        ENDPOINT: import.meta.env.VITE_AZURE_VISION_ENDPOINT || '',
        KEY: import.meta.env.VITE_AZURE_VISION_KEY || '',
    },
    SPEECH: {
        ENDPOINT: import.meta.env.VITE_AZURE_SPEECH_ENDPOINT || '',
        KEY: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
        REGION: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus',
    },
    IS_DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true' ||
        (!import.meta.env.VITE_AZURE_VISION_KEY && !import.meta.env.VITE_AZURE_SPEECH_KEY)
};

export const logAzureStatus = (serviceName: string) => {
    if (AZURE_CONFIG.IS_DEMO_MODE) {
        console.log(`🔵 NeuroSense Azure Hub: ${serviceName} is running in DEMO MODE (Fallback Analytics Active)`);
    } else {
        console.log(`🟢 NeuroSense Azure Hub: ${serviceName} is connected to PRODUCTION`);
    }
};
