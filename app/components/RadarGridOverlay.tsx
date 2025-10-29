'use client';

import React, { useEffect, useState } from 'react';

interface RadarGridOverlayProps {
  // Whether to start the animation immediately
  startAnimation?: boolean;
}

// Animated radar grid overlay component for landing page analysis mode
// Shows a radar grid that draws itself over the existing aura during Phase 3
export default function RadarGridOverlay({ startAnimation = false }: RadarGridOverlayProps) {
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Start animation when prop changes
  useEffect(() => {
    if (startAnimation && !animationStarted) {
      // Small delay to ensure initial render is complete
      const timeout = setTimeout(() => {
        setAnimationStarted(true);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [startAnimation, animationStarted]);

  // Grid dimensions matching the aura sizes
  // These match the responsive aura sizes from home page
  const gridSize = {
    small: 200,  // w-[200px] h-[200px]
    medium: 240, // sm:w-[240px] sm:h-[240px]  
    large: 280   // lg:w-[280px] lg:h-[280px]
  };

  // Center point for all sizes
  const center = {
    small: gridSize.small / 2,
    medium: gridSize.medium / 2, 
    large: gridSize.large / 2
  };

  // Radial line angles - 6 lines, 60 degrees apart
  const radialAngles = [0, 60, 120, 180, 240, 300].map(deg => (deg * Math.PI) / 180);

  // Concentric circle radii as percentages of the container
  // Match the aura ring positions - inner, middle, outer
  const circleRadii = [0.35, 0.6, 0.85]; // 35%, 60%, 85% of container radius

  // Calculate stroke dash properties for smooth pen-drawing effect
  const getRadialLineLength = (size: number) => size * 0.5; // From center to edge
  const getCircleCircumference = (radius: number) => 2 * Math.PI * radius;

  // Animation timing - slowed down for better visibility
  const radialLineAnimationDuration = 0.6; // 0.6s per line (was 0.2s)
  const radialLineStagger = 0.2; // 0.2s stagger between lines (was 0.1s)
  const circleAnimationStart = radialLineAnimationDuration + (radialAngles.length - 1) * radialLineStagger; // Start after all radial lines
  const circleAnimationDuration = 0.8; // 0.8s per circle (was 0.4s)

  return (
    <div className="absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] lg:w-[280px] lg:h-[280px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none">
      
      {/* Small screen SVG */}
      <svg 
        width={gridSize.small} 
        height={gridSize.small}
        viewBox={`0 0 ${gridSize.small} ${gridSize.small}`}
        className="absolute inset-0 sm:hidden"
      >
        
        {/* Radial lines - 6 lines, 60 degrees apart */}
        {radialAngles.map((angle, index) => {
          const startX = center.small;
          const startY = center.small;
          const endX = center.small + Math.cos(angle) * (gridSize.small * 0.45);
          const endY = center.small + Math.sin(angle) * (gridSize.small * 0.45);
          const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
          
          return (
            <line
              key={`radial-small-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="rgba(123, 140, 196, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={lineLength}
              strokeDashoffset={animationStarted ? 0 : lineLength}
              style={{
                transition: `stroke-dashoffset ${radialLineAnimationDuration}s ease-out`,
                transitionDelay: `${index * radialLineStagger}s`
              }}
            />
          );
        })}

        {/* Concentric circles - 3 circles */}
        {circleRadii.map((radiusRatio, index) => {
          const radius = (gridSize.small * radiusRatio) / 2;
          const circumference = getCircleCircumference(radius);
          const animationDelay = circleAnimationStart + (index * 0.3); // 0.3s stagger between circles
          
          return (
            <circle
              key={`circle-small-${index}`}
              cx={center.small}
              cy={center.small}
              r={radius}
              fill="none"
              stroke="rgba(123, 140, 196, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animationStarted ? 0 : circumference}
              style={{
                transition: `stroke-dashoffset ${circleAnimationDuration}s ease-out`,
                transitionDelay: `${animationDelay}s`
              }}
            />
          );
        })}
      </svg>

      {/* Medium screen SVG */}
      <svg 
        width={gridSize.medium} 
        height={gridSize.medium}
        viewBox={`0 0 ${gridSize.medium} ${gridSize.medium}`}
        className="absolute inset-0 hidden sm:block lg:hidden"
      >
        
        {/* Radial lines - 6 lines, 60 degrees apart */}
        {radialAngles.map((angle, index) => {
          const startX = center.medium;
          const startY = center.medium;
          const endX = center.medium + Math.cos(angle) * (gridSize.medium * 0.45);
          const endY = center.medium + Math.sin(angle) * (gridSize.medium * 0.45);
          const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
          
          return (
            <line
              key={`radial-medium-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="rgba(123, 140, 196, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={lineLength}
              strokeDashoffset={animationStarted ? 0 : lineLength}
              style={{
                transition: `stroke-dashoffset ${radialLineAnimationDuration}s ease-out`,
                transitionDelay: `${index * radialLineStagger}s`
              }}
            />
          );
        })}

        {/* Concentric circles - 3 circles */}
        {circleRadii.map((radiusRatio, index) => {
          const radius = (gridSize.medium * radiusRatio) / 2;
          const circumference = getCircleCircumference(radius);
          const animationDelay = circleAnimationStart + (index * 0.3); // 0.3s stagger between circles
          
          return (
            <circle
              key={`circle-medium-${index}`}
              cx={center.medium}
              cy={center.medium}
              r={radius}
              fill="none"
              stroke="rgba(123, 140, 196, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animationStarted ? 0 : circumference}
              style={{
                transition: `stroke-dashoffset ${circleAnimationDuration}s ease-out`,
                transitionDelay: `${animationDelay}s`
              }}
            />
          );
        })}
      </svg>

      {/* Large screen SVG */}
      <svg 
        width={gridSize.large} 
        height={gridSize.large}
        viewBox={`0 0 ${gridSize.large} ${gridSize.large}`}
        className="absolute inset-0 hidden lg:block"
      >
        
        {/* Radial lines - 6 lines, 60 degrees apart */}
        {radialAngles.map((angle, index) => {
          const startX = center.large;
          const startY = center.large;
          const endX = center.large + Math.cos(angle) * (gridSize.large * 0.45);
          const endY = center.large + Math.sin(angle) * (gridSize.large * 0.45);
          const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
          
          return (
            <line
              key={`radial-large-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="rgba(123, 140, 196, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={lineLength}
              strokeDashoffset={animationStarted ? 0 : lineLength}
              style={{
                transition: `stroke-dashoffset ${radialLineAnimationDuration}s ease-out`,
                transitionDelay: `${index * radialLineStagger}s`
              }}
            />
          );
        })}

        {/* Concentric circles - 3 circles */}
        {circleRadii.map((radiusRatio, index) => {
          const radius = (gridSize.large * radiusRatio) / 2;
          const circumference = getCircleCircumference(radius);
          const animationDelay = circleAnimationStart + (index * 0.3); // 0.3s stagger between circles
          
          return (
            <circle
              key={`circle-large-${index}`}
              cx={center.large}
              cy={center.large}
              r={radius}
              fill="none"
              stroke="rgba(123, 140, 196, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animationStarted ? 0 : circumference}
              style={{
                transition: `stroke-dashoffset ${circleAnimationDuration}s ease-out`,
                transitionDelay: `${animationDelay}s`
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
