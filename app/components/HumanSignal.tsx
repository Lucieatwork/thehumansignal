'use client';

import React, { useEffect, useRef, useState } from 'react';

interface HumanSignalProps {
  // Assessment responses to influence signal appearance
  responses?: Record<string, any>;
  // Assessment section progress (0-4) to gradually build the signal 
  sectionProgress?: number;
}

// Human Signal visualization component with canvas-based rendering
// This creates the core visual element from the PRD - a breathing, interactive signal
export default function HumanSignal({ responses = {}, sectionProgress = 0 }: HumanSignalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Signal properties based on PRD color palette
    const colors = {
      cream: '#f8f6f2',
      indigo: '#4b6fa8', 
      periwinkle: '#7a8cc4',
      violet: '#8a6fa3',
      redOrange: '#d95e40',
      white: '#ffffff'
    };

    let animationFrame: number;
    let startTime = Date.now();

    // Breathing animation with 4-second cycles as specified in PRD
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const breathPhase = (Math.sin(elapsed * Math.PI * 0.5) + 1) * 0.5; // 4-second cycle
      
      const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
      const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
      const baseRadius = Math.min(centerX, centerY) * 0.3;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create 3-layer aura system as specified in PRD
      const drawLayer = (radius: number, color: string, alpha: number) => {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Responsive signal building based on assessment progress
      // Signal grows and changes as user progresses through sections
      
      // Base intensity influenced by sleep duration response
      const sleepResponse = responses.sleep_duration || 7.5;
      const sleepIntensity = Math.max(0.6, Math.min(1.2, sleepResponse / 8)); // Normalize 8 hours = 1.0 intensity
      
      // Progressive layer visibility based on section progress
      const layerVisibility = Math.min(1, (sectionProgress + 1) / 4); // Gradually reveal layers
      
      // Layer 1: Core glow - grows with overall progress and sleep health
      if (layerVisibility > 0) {
        drawLayer(
          baseRadius * (0.6 + breathPhase * 0.15) * sleepIntensity,
          colors.white,
          0.8 * layerVisibility
        );
      }
      
      // Layer 2: Energy ring - intensifies with assessment responses
      if (layerVisibility > 0.25) {
        const energyIntensity = sleepIntensity * layerVisibility;
        drawLayer(
          baseRadius * (0.4 + breathPhase * 0.1) * energyIntensity,
          colors.redOrange,
          0.6 * Math.max(0, layerVisibility - 0.25) * 4 // Fade in after 25% progress
        );
      }
      
      // Layer 3: Inner pulse - core stability indicator
      if (layerVisibility > 0.5) {
        drawLayer(
          baseRadius * (0.2 + breathPhase * 0.05) * sleepIntensity,
          colors.indigo,
          0.9 * Math.max(0, layerVisibility - 0.5) * 2 // Fade in after 50% progress
        );
      }

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation after short delay to ensure smooth loading
    setTimeout(() => {
      setIsLoaded(true);
      animate();
    }, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className={`w-full h-full transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'transparent' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
