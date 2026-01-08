import React from 'react';

const GradientOrbs = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Primary large orb - top left */}
            <div
                className="floating-orb w-[600px] h-[600px] -top-48 -left-48"
                style={{
                    background: 'radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)',
                    animationDelay: '0s',
                }}
            />

            {/* Secondary orb - bottom right */}
            <div
                className="floating-orb w-[800px] h-[800px] -bottom-64 -right-64"
                style={{
                    background: 'radial-gradient(circle, hsl(var(--glow-blue) / 0.15) 0%, transparent 70%)',
                    animationDelay: '-5s',
                }}
            />

            {/* Accent orb - center */}
            <div
                className="floating-orb w-[400px] h-[400px] top-1/3 right-1/4"
                style={{
                    background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)',
                    animationDelay: '-10s',
                }}
            />

            {/* Small accent orb - top right */}
            <div
                className="floating-orb w-[300px] h-[300px] top-20 right-20"
                style={{
                    background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)',
                    animationDelay: '-3s',
                }}
            />
        </div>
    );
};

export default GradientOrbs;
