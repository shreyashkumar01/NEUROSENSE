import React from 'react';

const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 15}s`,
        duration: `${15 + Math.random() * 10}s`,
        size: 2 + Math.random() * 3,
        tx: (Math.random() - 0.5) * 200,
        ty: -100 - Math.random() * 200,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        width: particle.size,
                        height: particle.size,
                        animationDelay: particle.delay,
                        animationDuration: particle.duration,
                        ['--tx' as string]: `${particle.tx}px`,
                        ['--ty' as string]: `${particle.ty}px`,
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingParticles;
