
'use client';

import React from 'react';

const AnimatedShapes = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="animated-shape absolute bottom-[-100px] bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedShapes;
