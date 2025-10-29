'use client';

import React from 'react';
import RadarChart from './RadarChart';

interface SidebarRadarChartProps {
  // Assessment responses to influence radar chart data
  responses?: Record<string, any>;
  // Assessment section progress (0-4) to gradually build the chart
  sectionProgress?: number;
  // Current section to determine which chart to show
  currentSection?: number;
  // Opacity for transition effects
  opacity?: number;
  // Whether this is positioned for sidebar (absolute positioning)
  sidebarPosition?: boolean;
  // Scale factor (default 0.6 for 60% size)
  scale?: number;
}

// Sidebar-positioned radar chart component for transition effects
// Shows the same radar chart as RadarChart but sized and positioned for sidebar
export default function SidebarRadarChart({ 
  responses = {}, 
  sectionProgress = 0, 
  currentSection = 0,
  opacity = 1,
  sidebarPosition = false,
  scale = 0.6
}: SidebarRadarChartProps) {
  
  const containerClasses = sidebarPosition 
    ? "absolute top-6 left-6 w-[330px] h-[240px] z-20"
    : "w-full h-full relative";

  return (
    <div 
      className={containerClasses}
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: sidebarPosition ? 'top left' : 'center',
        transition: 'opacity 1.5s ease-in-out, transform 0.3s ease-out'
      }}
    >
      {/* Radar chart container - no duplicate title */}
      <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg p-6">
        <RadarChart
          responses={responses}
          sectionProgress={sectionProgress}
          currentSection={currentSection}
        />
      </div>
    </div>
  );
}
