import React from 'react';

const NeuralBrain: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
    return (
        <div className="w-full h-full min-h-[500px] lg:min-h-[700px] flex items-center justify-center relative z-20 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Clipper container: overflow-hidden to hide the bars */}
                <div className="w-full h-full max-w-[1000px] aspect-square relative overflow-hidden rounded-[4rem]">
                    <iframe
                        title="human-brain"
                        className="w-[105%] h-[calc(100%+90px)] border-0 absolute left-[-2.5%] top-[-45px] bg-transparent"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src="https://sketchfab.com/models/e073c2590bc24daaa7323f4daa5b7784/embed?autostart=1&autospin=0.2&transparent=1&ui_infos=0&ui_watermark=0&ui_stop=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_hint=0"
                    />

                    {/* Interaction Shield - Optional: If you want to block clicks but keep hover effects */}
                    <div className="absolute inset-0 z-30 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default NeuralBrain;
