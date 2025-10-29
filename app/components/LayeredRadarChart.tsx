'use client';

import React, { useEffect, useState } from 'react';

interface LayeredRadarChartProps {
  // Assessment responses to influence radar chart data
  responses?: Record<string, any>;
  // Whether to show potential improvement overlays (global control)
  showPotential?: boolean;
  // Whether to show individual layers (for interactive exploration)
  visibleLayers?: {
    sleep: boolean;
    stress: boolean;
    energy: boolean;
    bodySystems: boolean;
  };
  // Individual potential visibility controls for each layer
  visiblePotentials?: {
    sleep: boolean;
    stress: boolean;
    energy: boolean;
    bodySystems: boolean;
  };
  // Chart size for full-screen display
  size?: 'normal' | 'large' | 'fullscreen';
}

// Layered radar chart component for comprehensive findings visualization
// Shows all health dimensions simultaneously in beautiful stacked layers
export default function LayeredRadarChart({ 
  responses = {}, 
  showPotential = false,
  visibleLayers = { sleep: true, stress: true, energy: true, bodySystems: true },
  visiblePotentials = { sleep: false, stress: false, energy: false, bodySystems: false },
  size = 'large'
}: LayeredRadarChartProps) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Calculate individual sleep metrics (reusing existing logic)
  const calculateSleepMetrics = () => {
    const sleepQuality = responses.sleep_quality !== undefined 
      ? ((responses.sleep_quality - 1) / 4) * 10
      : 5;

    const sleepDuration = responses.sleep_duration !== undefined
      ? responses.sleep_duration
      : 7.5;

    const sleepConsistency = responses.bedtime_consistency !== undefined
      ? ({
          'very_consistent': 1.0,
          'mostly_consistent': 0.8,
          'somewhat_variable': 0.5,
          'highly_variable': 0.2
        }[responses.bedtime_consistency as string] || 0.5)
      : 0.5;

    const baseDeepSleep = responses.sleep_quality ? (responses.sleep_quality - 1) / 4 : 0.5;
    const interruptionPenalty = responses.sleep_interruptions 
      ? ({
          'never': 0,
          'occasionally': 0.1,
          'regularly': 0.25,
          'frequently': 0.4
        }[responses.sleep_interruptions as string] || 0.2)
      : 0.2;
    const deepSleepPercentage = Math.max(0.1, Math.min(0.9, baseDeepSleep - interruptionPenalty));

    const baseREM = responses.wake_feeling ? (responses.wake_feeling - 1) / 4 : 0.5;
    const qualityBonus = responses.sleep_quality ? (responses.sleep_quality - 3) * 0.05 : 0;
    const remSleepPercentage = Math.max(0.1, Math.min(0.7, baseREM + qualityBonus));

    const baseLatency = responses.sleep_quality ? (5 - responses.sleep_quality) / 4 : 0.5;
    const consistencyPenalty = responses.bedtime_consistency === 'highly_variable' ? 0.2 : 0;
    const sleepLatency = Math.max(0.1, Math.min(0.9, baseLatency + consistencyPenalty));

    return {
      sleepQuality: sleepQuality / 10,
      sleepDuration: Math.max(0.1, Math.min(1, 1 - Math.abs(sleepDuration - 8) / 4)),
      sleepConsistency,
      deepSleepPercentage,
      remSleepPercentage,
      sleepLatency: 1 - sleepLatency
    };
  };

  // Calculate stress metrics (reusing existing logic)
  const calculateStressMetrics = () => {
    const stressFrequency = responses.stress_frequency !== undefined 
      ? (5 - responses.stress_frequency) / 4
      : 0.5;

    const stressIntensity = responses.stress_intensity !== undefined
      ? (10 - responses.stress_intensity) / 9
      : 0.5;

    const stressManagement = responses.stress_management !== undefined
      ? (responses.stress_management - 1) / 4
      : 0.5;

    const stressRecovery = responses.stress_recovery !== undefined
      ? ({
          'immediate': 1.0,
          'quick': 0.8,
          'moderate': 0.6,
          'slow': 0.3,
          'very_slow': 0.1
        }[responses.stress_recovery as string] || 0.5)
      : 0.5;

    const physicalSymptoms = responses.stress_physical_symptoms !== undefined
      ? (5 - responses.stress_physical_symptoms) / 4
      : 0.5;

    const baseResilience = responses.stress_sources !== undefined
      ? ({
          'work_career': 0.6,
          'relationships': 0.4,
          'financial': 0.3,
          'health': 0.2,
          'time_management': 0.8,
          'multiple': 0.3
        }[responses.stress_sources as string] || 0.5)
      : 0.5;
    
    const managementBonus = responses.stress_management ? (responses.stress_management - 3) * 0.1 : 0;
    const stressResilience = Math.max(0.1, Math.min(0.9, baseResilience + managementBonus));

    return {
      stressFrequency,
      stressIntensity,
      stressManagement,
      stressRecovery,
      physicalSymptoms,
      stressResilience
    };
  };

  // Calculate energy metrics
  const calculateEnergyMetrics = () => {
    const energyConsistency = responses.energy_consistency !== undefined
      ? (responses.energy_consistency - 1) / 4
      : 0.5;

    const crashResilience = responses.energy_crash_frequency !== undefined
      ? (5 - responses.energy_crash_frequency) / 4
      : 0.5;

    const recoveryScores = {
      'immediate': 1.0,
      'quick': 0.9,
      'moderate': 0.7,
      'extended': 0.5,
      'overnight': 0.3,
      'multiday': 0.1
    };
    const recovery = responses.recovery_time !== undefined
      ? recoveryScores[responses.recovery_time as keyof typeof recoveryScores] || 0.5
      : 0.5;

    const peakTimeScores = {
      'early_morning': 0.9,
      'mid_morning': 0.85,
      'midday': 0.7,
      'afternoon': 0.6,
      'early_evening': 0.5,
      'late_evening': 0.4
    };
    const peakTiming = responses.energy_peak_time !== undefined
      ? peakTimeScores[responses.energy_peak_time as keyof typeof peakTimeScores] || 0.6
      : 0.6;

    const weeklyPatternScores = {
      'fairly_consistent': 1.0,
      'builds_up': 0.8,
      'midweek_peak': 0.7,
      'weekend_boost': 0.6,
      'starts_high_decreases': 0.4
    };
    const weeklyPattern = responses.weekly_energy_pattern !== undefined
      ? weeklyPatternScores[responses.weekly_energy_pattern as keyof typeof weeklyPatternScores] || 0.6
      : 0.6;

    // Overall energy vitality composite
    const energyVitality = (energyConsistency + crashResilience + recovery + peakTiming + weeklyPattern) / 5;

    return {
      energyConsistency,
      crashResilience,
      recovery,
      peakTiming,
      weeklyPattern,
      energyVitality
    };
  };

  // Calculate body systems metrics
  const calculateBodySystemsMetrics = () => {
    const digestiveComfort = responses.digestive_comfort !== undefined
      ? (responses.digestive_comfort - 1) / 4
      : 0.5;

    const physicalStrength = responses.physical_strength !== undefined
      ? (responses.physical_strength - 1) / 4
      : 0.5;

    const immuneScores = {
      'rarely': 1.0,
      'occasionally': 0.8,
      'regularly': 0.5,
      'frequently': 0.3,
      'constantly': 0.1
    };
    const immuneResilience = responses.immune_resilience !== undefined
      ? immuneScores[responses.immune_resilience as keyof typeof immuneScores] || 0.5
      : 0.5;

    const bodyComfort = responses.body_discomfort !== undefined
      ? (5 - responses.body_discomfort) / 4
      : 0.5;

    const bodySatisfaction = responses.body_satisfaction !== undefined
      ? (responses.body_satisfaction - 1) / 4
      : 0.5;

    // Overall body harmony composite
    const bodyHarmony = (digestiveComfort + physicalStrength + immuneResilience + bodyComfort + bodySatisfaction) / 5;

    return {
      digestiveComfort,
      physicalStrength,
      immuneResilience,
      bodyComfort,
      bodySatisfaction,
      bodyHarmony
    };
  };

  // Calculate potential improvements (20-30% boost to lowest performing areas)
  const calculatePotentialMetrics = () => {
    const sleepMetrics = calculateSleepMetrics();
    const stressMetrics = calculateStressMetrics();
    const energyMetrics = calculateEnergyMetrics();
    const bodyMetrics = calculateBodySystemsMetrics();

    // Helper function to improve lowest scoring metrics
    const improveMetrics = (metrics: Record<string, number>, improvementFactor = 0.25) => {
      const improved = { ...metrics };
      Object.keys(improved).forEach(key => {
        if (improved[key] < 0.7) { // Only improve areas that are below 70%
          improved[key] = Math.min(0.95, improved[key] + (1 - improved[key]) * improvementFactor);
        }
      });
      return improved;
    };

    return {
      sleep: improveMetrics(sleepMetrics),
      stress: improveMetrics(stressMetrics),
      energy: improveMetrics(energyMetrics),
      bodySystems: improveMetrics(bodyMetrics)
    };
  };

  // Handle client-side mounting and animations
  useEffect(() => {
    setIsClientMounted(true);
    
    let interval: NodeJS.Timeout;
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 0.008) % (Math.PI * 2)); // Very slow, luxurious breathing
      }, 60);
    }, 300);

    return () => {
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, []);

  // Chart dimensions based on size
  const chartConfig = {
    normal: { centerX: 180, centerY: 180, maxRadius: 140, svgSize: 360 },
    large: { centerX: 250, centerY: 250, maxRadius: 200, svgSize: 500 },
    fullscreen: { centerX: 300, centerY: 300, maxRadius: 260, svgSize: 600 }
  }[size];

  const { centerX, centerY, maxRadius, svgSize } = chartConfig;
  
  // Subtle breathing animation
  const breathingFactor = isClientMounted ? 1 + Math.sin(animationPhase) * 0.02 : 1;

  // Get all metrics
  const sleepMetrics = calculateSleepMetrics();
  const stressMetrics = calculateStressMetrics();
  const energyMetrics = calculateEnergyMetrics();
  const bodyMetrics = calculateBodySystemsMetrics();
  const potentialMetrics = calculatePotentialMetrics(); // Always calculate, don't depend on showPotential

  // Define the 6 common angles for all layers (hexagon)
  const angles = [
    0,                          // Top
    Math.PI / 3,               // Top Right
    (2 * Math.PI) / 3,         // Bottom Right  
    Math.PI,                   // Bottom
    (4 * Math.PI) / 3,         // Bottom Left
    (5 * Math.PI) / 3          // Top Left
  ];

  // Create layer definitions with metrics mapped to consistent angles
  const layerDefinitions = [
    // Base Layer: Body Systems (Green tones)
    {
      id: 'bodySystems',
      name: 'Body Systems',
      visible: visibleLayers.bodySystems,
      baseColor: '#A38E3A',
      fillColor: 'rgba(163, 142, 58, 0.4)',
      strokeColor: 'rgba(163, 142, 58, 0.4)',
      glowColor: 'rgba(163, 142, 58, 0.2)',
      values: [
        bodyMetrics.digestiveComfort,    // Top
        bodyMetrics.physicalStrength,    // Top Right
        bodyMetrics.immuneResilience,    // Bottom Right
        bodyMetrics.bodyComfort,         // Bottom
        bodyMetrics.bodySatisfaction,    // Bottom Left
        bodyMetrics.bodyHarmony          // Top Left
      ],
      labels: ['Digestive', 'Strength', 'Immune', 'Comfort', 'Satisfaction', 'Harmony']
    },
    
    // Second Layer: Energy Cycles (Purple tones)
    {
      id: 'energy',
      name: 'Energy Cycles',
      visible: visibleLayers.energy,
      baseColor: '#8A6FA3',
      fillColor: 'rgba(138, 111, 163, 0.4)',
      strokeColor: 'rgba(138, 111, 163, 0.4)',
      glowColor: 'rgba(138, 111, 163, 0.2)',
      values: [
        energyMetrics.energyConsistency, // Top
        energyMetrics.crashResilience,   // Top Right
        energyMetrics.recovery,          // Bottom Right
        energyMetrics.peakTiming,        // Bottom
        energyMetrics.weeklyPattern,     // Bottom Left
        energyMetrics.energyVitality     // Top Left
      ],
      labels: ['Consistency', 'Resilience', 'Recovery', 'Timing', 'Pattern', 'Vitality']
    },

    // Third Layer: Stress Patterns (Red-orange gradient tones)  
    {
      id: 'stress',
      name: 'Stress Patterns',
      visible: visibleLayers.stress,
      baseColor: '#E39684',
      fillColor: 'rgba(227, 150, 132, 0.4)',
      strokeColor: 'rgba(227, 150, 132, 0.4)',
      glowColor: 'rgba(227, 150, 132, 0.2)',
      values: [
        stressMetrics.stressFrequency,   // Top (inverted - calm)
        stressMetrics.stressIntensity,   // Top Right (inverted - control)
        stressMetrics.stressManagement,  // Bottom Right (skills)
        stressMetrics.stressRecovery,    // Bottom (recovery)
        stressMetrics.physicalSymptoms,  // Bottom Left (inverted - ease)
        stressMetrics.stressResilience   // Top Left (resilience)
      ],
      labels: ['Calm', 'Control', 'Skills', 'Recovery', 'Ease', 'Resilience']
    },

    // Top Layer: Sleep Rhythms (Blue tones)
    {
      id: 'sleep',
      name: 'Sleep Rhythms',
      visible: visibleLayers.sleep,
      baseColor: '#7A8CC4',
      fillColor: 'rgba(122, 140, 196, 0.4)',
      strokeColor: 'rgba(122, 140, 196, 0.4)',
      glowColor: 'rgba(122, 140, 196, 0.2)',
      values: [
        sleepMetrics.sleepQuality,       // Top
        sleepMetrics.sleepDuration,      // Top Right
        sleepMetrics.sleepConsistency,   // Bottom Right
        sleepMetrics.deepSleepPercentage,// Bottom
        sleepMetrics.remSleepPercentage, // Bottom Left
        sleepMetrics.sleepLatency        // Top Left
      ],
      labels: ['Quality', 'Duration', 'Rhythm', 'Deep', 'REM', 'Onset']
    }
  ];

  // Calculate radar points for a layer
  const getLayerPoints = (values: number[]) => {
    return angles.map((angle, index) => {
      const value = Math.max(0.1, Math.min(1, values[index] || 0.1)); // Ensure valid range
      const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor; // 20% minimum, 100% maximum
      const x = centerX + Math.cos(angle - Math.PI / 2) * radius; // -PI/2 to start at top
      const y = centerY + Math.sin(angle - Math.PI / 2) * radius;
      return { x, y, value };
    });
  };

  // Helper function to create naturally curved shapes - balanced between organic and angular
  const createSmoothRadarPath = (points: Array<{x: number, y: number}>) => {
    if (points.length < 3) return '';
    
    const tension = 0.22; // Balanced tension for natural curves without being too angular or blob-like
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Create naturally curved shapes with balanced smoothness
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const prev = points[(i - 1 + points.length) % points.length];
      const nextNext = points[(i + 2) % points.length];
      
      // Calculate control points for balanced, natural curves
      const cp1x = current.x + tension * (next.x - prev.x) * 0.5;
      const cp1y = current.y + tension * (next.y - prev.y) * 0.5;
      
      const cp2x = next.x - tension * (nextNext.x - current.x) * 0.5;
      const cp2y = next.y - tension * (nextNext.y - current.y) * 0.5;
      
      // Use cubic bezier curve for naturally smooth, balanced shape
      path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next.x} ${next.y}`;
    }
    
    return path + ' Z';
  };

  // Create SVG path from points using smooth curves
  const createPath = (points: { x: number; y: number; value: number }[]) => {
    if (points.length === 0) return '';
    return createSmoothRadarPath(points);
  };

  // Early return for server-side rendering
  if (!isClientMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <div className={`w-${svgSize === 360 ? '72' : svgSize === 500 ? '80' : '96'} h-${svgSize === 360 ? '72' : svgSize === 500 ? '80' : '96'} rounded-full border border-gray-200 opacity-30`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className={`w-full h-full ${size === 'normal' ? 'max-w-[360px] max-h-[360px]' : size === 'large' ? 'max-w-[500px] max-h-[500px]' : 'max-w-[600px] max-h-[600px]'}`}
        >
          {/* Background grid circles */}
          {[0.3, 0.5, 0.7, 0.9].map((ratio, index) => (
            <circle
              key={`grid-${ratio}`}
              cx={centerX}
              cy={centerY}
              r={maxRadius * ratio * breathingFactor}
              fill="none"
              stroke="rgba(58, 58, 58, 0.08)"
              strokeWidth="1"
              className="transition-all duration-[1500ms] ease-out"
            />
          ))}

          {/* Grid lines for 6 dimensions */}
          {angles.map((angle, index) => {
            const endX = centerX + Math.cos(angle - Math.PI / 2) * maxRadius * breathingFactor;
            const endY = centerY + Math.sin(angle - Math.PI / 2) * maxRadius * breathingFactor;
            
            return (
              <line
                key={`line-${index}`}
                x1={centerX}
                y1={centerY}
                x2={endX}
                y2={endY}
                stroke="rgba(58, 58, 58, 0.08)"
                strokeWidth="1"
                className="transition-all duration-[1500ms] ease-out"
              />
            );
          })}

          {/* Render layers from bottom to top */}
          {layerDefinitions.reverse().map((layer, layerIndex) => {
            if (!layer.visible) return null;
            
            const points = getLayerPoints(layer.values);
            const pathData = createPath(points);

            return (
              <g key={layer.id} className="transition-all duration-700 ease-out">
                {/* Layer fill with beautiful gradients - no stroke */}
                <path
                  d={pathData}
                  fill={`url(#${layer.id}LayerGradientNew)`}
                  stroke="none"
                  className="transition-all duration-[2000ms] ease-out"
                  style={{
                    opacity: layer.visible ? 1.0 : 0,
                    mixBlendMode: 'multiply'
                  }}
                />

                {/* Data points with subtle glow - show all dots on results page */}
                {points.map((point, pointIndex) => (
                  <g key={`${layer.id}-point-${pointIndex}`}>
                    {/* Point glow */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={layer.glowColor}
                      opacity={isClientMounted ? 0.3 + Math.abs(Math.sin(animationPhase + pointIndex * 0.2)) * 0.2 : 0.3}
                      className="transition-all duration-[1200ms] ease-out"
                    />
                    
                    {/* Point core */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill={layer.baseColor}
                      opacity="0.9"
                      className="transition-all duration-[2000ms] ease-out"
                    />
                  </g>
                ))}
              </g>
            );
          })}

          {/* Potential improvement overlays with smooth curves - individual layer controls */}
          {potentialMetrics && layerDefinitions.map((layer) => {
            // Check both layer visibility and individual potential visibility
            if (!layer.visible) return null;
            
            // Check if this specific layer's potential should be shown
            const layerKey = layer.id as keyof typeof visiblePotentials;
            const showLayerPotential = visiblePotentials[layerKey];
            
            if (!showLayerPotential) return null;
            
            const currentPoints = getLayerPoints(layer.values);
            const potentialValues = potentialMetrics[layer.id as keyof typeof potentialMetrics] as Record<string, number>;
            const potentialPoints = getLayerPoints(Object.values(potentialValues).slice(0, 6));
            const potentialPath = createPath(potentialPoints);

            return (
              <path
                key={`${layer.id}-potential`}
                d={potentialPath}
                fill="none"
                stroke={
                  layer.id === 'sleep' ? '#4B6FA8' :
                  layer.id === 'stress' ? '#D95E40' :
                  layer.id === 'energy' ? '#8A6FA3' :
                  layer.id === 'bodySystems' ? '#665821' :
                  layer.baseColor
                }
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.9"
                className="transition-all duration-[2000ms] ease-out"
                style={{
                  filter: `drop-shadow(0 0 4px ${layer.glowColor})`
                }}
              />
            );
          })}

          {/* Center pulse */}
          <circle
            cx={centerX}
            cy={centerY}
            r={8 * breathingFactor}
            fill="#FCF8F4"
            opacity="0.9"
            className="transition-all duration-100 ease-in-out"
            style={{
              filter: `drop-shadow(0 0 12px rgba(252, 248, 244, 0.6))`
            }}
          />
          
          {/* Animated center ripples */}
          <circle
            cx={centerX}
            cy={centerY}
            r={20 * breathingFactor}
            fill="none"
            stroke="#FCF8F4"
            strokeWidth="1.5"
            opacity={isClientMounted ? 0.6 * Math.abs(Math.sin(animationPhase * 1.5)) : 0.6}
            className="transition-all duration-100 ease-in-out"
          />
          
          <circle
            cx={centerX}
            cy={centerY}
            r={35 * breathingFactor}
            fill="none"
            stroke="#FCF8F4"
            strokeWidth="1"
            opacity={isClientMounted ? 0.4 * Math.abs(Math.sin(animationPhase * 1.5 + Math.PI / 3)) : 0.4}
            className="transition-all duration-100 ease-in-out"
          />

          {/* Beautiful gradient definitions matching RadarChart */}
          <defs>
            {/* Sleep layer gradient - elegant blue tones */}
            <radialGradient id="sleepLayerGradientNew" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(122, 140, 196)" stopOpacity="1.0" />
            </radialGradient>
            
            {/* Stress layer gradient - beautiful red-orange */}
            <radialGradient id="stressLayerGradientNew" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(227, 150, 132)" stopOpacity="1.0" />
            </radialGradient>
            
            {/* Energy layer gradient - elegant purple */}
            <radialGradient id="energyLayerGradientNew" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(138, 111, 163)" stopOpacity="1.0" />
            </radialGradient>
            
            {/* Body systems layer gradient - beautiful olive green */}
            <radialGradient id="bodySystemsLayerGradientNew" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(163, 142, 58)" stopOpacity="1.0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Layer labels positioned around the chart */}
        <div className="absolute inset-0 pointer-events-none">
          {angles.map((angle, index) => {
            const labelRadius = maxRadius + 40;
            const labelX = centerX + Math.cos(angle - Math.PI / 2) * labelRadius;
            const labelY = centerY + Math.sin(angle - Math.PI / 2) * labelRadius;
            
            // Show stress labels when stress is visible, otherwise show the top visible layer labels
            let label = '';
            if (visibleLayers.stress) {
              const stressLayer = layerDefinitions.find(layer => layer.id === 'stress');
              label = stressLayer?.labels[index] || '';
            } else {
              const visibleLayer = layerDefinitions.find(layer => layer.visible);
              label = visibleLayer?.labels[index] || '';
            }
            
            return (
              <div 
                key={`label-${index}`}
                className="absolute text-xs font-medium text-[#3a3a3a]/70 transition-all duration-500"
                style={{
                  left: `${(labelX / svgSize) * 100}%`,
                  top: `${(labelY / svgSize) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
