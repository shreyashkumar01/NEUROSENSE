
/**
 * ═══════════════════════════════════════════════════════════
 * AZURE INTEGRATION HELPERS
 * ═══════════════════════════════════════════════════════════
 */

export const azureHelpers = {
    /**
     * Convert HTML5 Canvas data to a Blob for Azure upload
     */
    canvasToBlob: async (canvas: HTMLCanvasElement): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob conversion failed'));
            }, 'image/jpeg', 0.8);
        });
    },

    /**
     * Generate controlled random variance for demo scores
     */
    generateDemoVariance: (base: number, range: number = 5): number => {
        const variance = (Math.random() * range * 2) - range;
        return Math.min(100, Math.max(0, Math.round(base + variance)));
    },

    /**
     * Mock delay to simulate network latency for APIs
     */
    simulateLatency: async (ms: number = 800) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
