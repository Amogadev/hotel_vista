
'use client';

import React, { useState, useEffect } from 'react';

const AnimatedShapes = () => {
  const [shapes, setShapes] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    setShapes(
      Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="animated-shape absolute bottom-[-100px] bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))
    );
  }, []);

  return <div className="absolute top-0 left-0 w-full h-full">{shapes}</div>;
};

export default AnimatedShapes;
