'use client';

import React, { useEffect, useState } from 'react';

interface RadarChartProps {
  // Assessment responses to influence radar chart data
  responses?: Record<string, any>;
  // Assessment section progress (0-4) to gradually build the chart
  sectionProgress?: number;
  // Chart title for tablet layout
  chartTitle?: string;
  // Current section to determine which chart to show
  currentSection?: number;
}

// Dynamic radar chart component for Human Signal visualization
// Shows health dimensions as an animated, evolving radar chart
export default function RadarChart({ responses = {}, sectionProgress = 0, chartTitle, currentSection = 0 }: RadarChartProps) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isClientMounted, setIsClientMounted] = useState(false);

  // Calculate 6 individual sleep metrics for detailed radar layer
  const calculateSleepMetrics = () => {
    // Check if user has answered ANY sleep questions - if not, return uniform small circular shape
    const hasSleepAnswers = responses.sleep_quality !== undefined || 
                           responses.sleep_duration !== undefined ||
                           responses.bedtime_consistency !== undefined ||
                           responses.sleep_interruptions !== undefined ||
                           responses.wake_feeling !== undefined ||
                           responses.daytime_sleepiness !== undefined;

    // If no sleep answers yet, return small uniform circular shape (like sleepchartnoanswer in Figma)
    if (!hasSleepAnswers) {
      const minimalValue = 0.25; // Small uniform circle - 25% of radius
      return {
        sleepQuality: minimalValue,
        sleepDuration: minimalValue,
        sleepConsistency: minimalValue,
        deepSleepPercentage: minimalValue,
        remSleepPercentage: minimalValue,
        sleepLatency: minimalValue
      };
    }

    // Once user starts answering, calculate based on their responses
    // Sleep Quality (1-10 scale) - enhanced from current 1-5 scale
    const baseSleepQuality = responses.sleep_quality !== undefined 
      ? ((responses.sleep_quality - 1) / 4) * 10 // Convert 1-5 to 1-10 scale
      : 5;
    
    // Adjust sleep quality based on daytime sleepiness (1-5 scale: 1=Never, 5=Always)
    const daytimeSleepinessPenalty = responses.daytime_sleepiness !== undefined 
      ? (responses.daytime_sleepiness - 1) * 1.2  // Scale 0-4.8 penalty
      : 0;
    
    const sleepQuality = Math.max(1, Math.min(10, baseSleepQuality - daytimeSleepinessPenalty));

    // Sleep Duration (hours per night) - normalize to 0-1 scale (optimal 7-9 hours)
    const baseSleepDuration = responses.sleep_duration !== undefined
      ? responses.sleep_duration
      : 7.5;
    
    // Adjust sleep duration effectiveness based on daytime sleepiness
    // If user is sleepy during day, their current duration may not be adequate
    const sleepDurationAdequacy = responses.daytime_sleepiness !== undefined
      ? Math.max(0.1, 1 - (responses.daytime_sleepiness - 1) * 0.15) // Reduce adequacy based on sleepiness
      : 1;
    
    const sleepDuration = baseSleepDuration;

    // Sleep Consistency (regularity of bedtime/wake time) - 0-1 scale
    const sleepConsistency = responses.bedtime_consistency !== undefined
      ? ({
          'very_consistent': 1.0,
          'mostly_consistent': 0.8,
          'somewhat_variable': 0.5,
          'highly_variable': 0.2
        }[responses.bedtime_consistency as string] || 0.5)
      : 0.5;

    // Deep Sleep Percentage - estimated from sleep quality, interruptions, and daytime sleepiness
    const baseDeepSleep = responses.sleep_quality ? (responses.sleep_quality - 1) / 4 : 0.5;
    const interruptionPenalty = responses.sleep_interruptions 
      ? ({
          'never': 0,
          'occasionally': 0.1,
          'regularly': 0.25,
          'frequently': 0.4
        }[responses.sleep_interruptions as string] || 0.2)
      : 0.2;
    
    // Additional penalty for daytime sleepiness - indicates insufficient deep sleep (1-5 scale)
    const daytimeSleepDeepPenalty = responses.daytime_sleepiness !== undefined 
      ? (responses.daytime_sleepiness - 1) * 0.08  // Scale 0-0.32 penalty
      : 0;
    
    const deepSleepPercentage = Math.max(0.1, Math.min(0.9, baseDeepSleep - interruptionPenalty - daytimeSleepDeepPenalty));

    // REM Sleep Percentage - estimated from wake feeling and overall sleep quality
    const baseREM = responses.wake_feeling ? (responses.wake_feeling - 1) / 4 : 0.5;
    const qualityBonus = responses.sleep_quality ? (responses.sleep_quality - 3) * 0.05 : 0;
    const remSleepPercentage = Math.max(0.1, Math.min(0.7, baseREM + qualityBonus));

    // Sleep Latency (time to fall asleep) - estimated from sleep quality and consistency
    const baseLatency = responses.sleep_quality ? (5 - responses.sleep_quality) / 4 : 0.5;
    const consistencyPenalty = responses.bedtime_consistency === 'highly_variable' ? 0.2 : 0;
    const sleepLatency = Math.max(0.1, Math.min(0.9, baseLatency + consistencyPenalty));

    return {
      sleepQuality: sleepQuality / 10, // Normalize to 0-1 for radar
      sleepDuration: Math.max(0.1, Math.min(1, (1 - Math.abs(sleepDuration - 8) / 4) * sleepDurationAdequacy)), // Optimal around 8 hours, adjusted for adequacy
      sleepConsistency,
      deepSleepPercentage,
      remSleepPercentage,
      sleepLatency: 1 - sleepLatency // Invert so lower latency = higher score
    };
  };

  // Calculate comprehensive sleep score from the new sleep metrics (for backward compatibility)
  const calculateSleepScore = () => {
    const metrics = calculateSleepMetrics();
    // Average all the sleep metrics to get an overall score
    return (
      metrics.sleepQuality + 
      metrics.sleepDuration + 
      metrics.sleepConsistency + 
      metrics.deepSleepPercentage + 
      metrics.remSleepPercentage + 
      metrics.sleepLatency
    ) / 6;
  };

  // Calculate 6 individual stress metrics for detailed radar layer
  const calculateStressMetrics = () => {
    // Stress Frequency (1-5 scale) - invert so less frequent = higher score
    const stressFrequency = responses.stress_frequency !== undefined 
      ? (5 - responses.stress_frequency) / 4 // Convert 1-5 to inverted 0-1 scale
      : 0.5;

    // Stress Intensity (1-10 scale) - invert so lower intensity = higher score
    const stressIntensity = responses.stress_intensity !== undefined
      ? (10 - responses.stress_intensity) / 9 // Convert 1-10 to inverted 0-1 scale
      : 0.5;

    // Stress Management (1-5 scale) - direct scoring, better management = higher score
    const stressManagement = responses.stress_management !== undefined
      ? (responses.stress_management - 1) / 4 // Convert 1-5 to 0-1 scale
      : 0.5;

    // Stress Recovery Speed (multiple choice) - faster recovery = higher score
    const stressRecovery = responses.stress_recovery !== undefined
      ? ({
          'immediate': 1.0,
          'quick': 0.8,
          'moderate': 0.6,
          'slow': 0.3,
          'very_slow': 0.1
        }[responses.stress_recovery as string] || 0.5)
      : 0.5;

    // Physical Symptoms (1-5 scale) - invert so fewer symptoms = higher score
    const physicalSymptoms = responses.stress_physical_symptoms !== undefined
      ? (5 - responses.stress_physical_symptoms) / 4 // Convert 1-5 to inverted 0-1 scale
      : 0.5;

    // Stress Resilience (derived from sources and other factors) - more stable sources = higher resilience
    const baseResilience = responses.stress_sources !== undefined
      ? ({
          'work_career': 0.6,     // Manageable with boundaries
          'relationships': 0.4,    // Often harder to control
          'financial': 0.3,        // Can be very destabilizing
          'health': 0.2,           // Often unpredictable
          'time_management': 0.8,  // Very manageable with skills
          'multiple': 0.3          // More complex, harder to manage
        }[responses.stress_sources as string] || 0.5)
      : 0.5;
    
    // Adjust resilience based on management skills
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

  // Calculate comprehensive stress intensity score from stress responses (for backward compatibility)
  const calculateStressScore = () => {
    const metrics = calculateStressMetrics();
    // Average all the stress metrics to get an overall score (inverted so high score = low stress)
    return (
      metrics.stressFrequency + 
      metrics.stressIntensity + 
      metrics.stressManagement + 
      metrics.stressRecovery + 
      metrics.physicalSymptoms + 
      metrics.stressResilience
    ) / 6;
  };

  // Calculate comprehensive body harmony score from body systems responses
  const calculateBodyHarmonyScore = () => {
    let bodyScore = 0;
    let factors = 0;

    // Digestive comfort (1-5 scale, direct - higher comfort = better body harmony)
    if (responses.digestive_comfort !== undefined) {
      bodyScore += (responses.digestive_comfort - 1) / 4; // Convert 1-5 to 0-1
      factors++;
    }

    // Physical strength (1-5 scale, direct - higher strength = better body harmony)
    if (responses.physical_strength !== undefined) {
      bodyScore += (responses.physical_strength - 1) / 4; // Convert 1-5 to 0-1
      factors++;
    }

    // Immune resilience (multiple choice, better resilience = better body harmony)
    if (responses.immune_resilience !== undefined) {
      const immuneScores = {
        'rarely': 1.0,           // Excellent immune system
        'occasionally': 0.8,     // Good immune system
        'regularly': 0.5,        // Moderate immune system
        'frequently': 0.3,       // Poor immune system
        'constantly': 0.1        // Very poor immune system
      };
      bodyScore += immuneScores[responses.immune_resilience as keyof typeof immuneScores] || 0.5;
      factors++;
    }

    // Body discomfort (1-5 scale, inverted - less discomfort = better body harmony)
    if (responses.body_discomfort !== undefined) {
      bodyScore += (5 - responses.body_discomfort) / 4; // Invert: less discomfort = higher score
      factors++;
    }

    // Body satisfaction (1-5 scale, direct - higher satisfaction = better body harmony)
    if (responses.body_satisfaction !== undefined) {
      bodyScore += (responses.body_satisfaction - 1) / 4; // Convert 1-5 to 0-1
      factors++;
    }

    // If no body systems responses yet, use sleep and stress as partial indicators
    if (factors === 0) {
      const sleepScore = calculateSleepScore();
      const stressIntensity = calculateStressScore();
      // Good sleep and low stress contribute to better body harmony
      return 0.3 + (sleepScore * 0.4) + ((1 - stressIntensity) * 0.3);
    }

    // Return average body harmony score
    return factors > 0 ? bodyScore / factors : 0.5;
  };

  // Calculate comprehensive energy score from energy cycle responses
  const calculateEnergyScore = () => {
    let energyScore = 0;
    let factors = 0;

    // Energy consistency (1-5 scale, direct - higher consistency = better energy)
    if (responses.energy_consistency !== undefined) {
      energyScore += (responses.energy_consistency - 1) / 4; // Convert 1-5 to 0-1
      factors++;
    }

    // Energy crash frequency (1-5 scale, inverted - fewer crashes = better energy)
    if (responses.energy_crash_frequency !== undefined) {
      energyScore += (5 - responses.energy_crash_frequency) / 4; // Invert scale
      factors++;
    }

    // Recovery time (multiple choice, faster recovery = better energy)
    if (responses.recovery_time !== undefined) {
      const recoveryTimeScores = {
        'immediate': 1.0,        // Excellent recovery - within 15 minutes
        'quick': 0.9,            // Very good - 15-60 minutes
        'moderate': 0.7,         // Good - 1-3 hours
        'extended': 0.5,         // Fair - 4-8 hours
        'overnight': 0.3,        // Poor - need full sleep
        'multiday': 0.1          // Very poor - several days
      };
      energyScore += recoveryTimeScores[responses.recovery_time as keyof typeof recoveryTimeScores] || 0.5;
      factors++;
    }

    // Energy peak time (indirect scoring - morning people tend to have more consistent energy)
    if (responses.energy_peak_time !== undefined) {
      const peakTimeScores = {
        'early_morning': 0.9,    // Generally most consistent energy patterns
        'mid_morning': 0.85,     // Good natural rhythm
        'midday': 0.7,           // Decent but may indicate afternoon crashes
        'afternoon': 0.6,        // Often associated with energy dips
        'early_evening': 0.5,    // May indicate disrupted circadian rhythms
        'late_evening': 0.4      // Often indicates circadian rhythm issues
      };
      energyScore += peakTimeScores[responses.energy_peak_time as keyof typeof peakTimeScores] || 0.6;
      factors++;
    }

    // Weekly energy pattern (scoring based on sustainability)
    if (responses.weekly_energy_pattern !== undefined) {
      const weeklyPatternScores = {
        'fairly_consistent': 1.0,        // Best - sustainable energy
        'builds_up': 0.8,                // Good momentum pattern
        'midweek_peak': 0.7,             // Decent but may indicate burnout risk
        'weekend_boost': 0.6,            // May indicate work-related energy drain
        'starts_high_decreases': 0.4     // Concerning burnout pattern
      };
      energyScore += weeklyPatternScores[responses.weekly_energy_pattern as keyof typeof weeklyPatternScores] || 0.6;
      factors++;
    }

    // If no energy responses yet, use sleep and stress as partial indicators
    if (factors === 0) {
      const sleepScore = calculateSleepScore();
      const stressIntensity = calculateStressScore();
      // Good sleep and low stress contribute to better energy
      return 0.3 + (sleepScore * 0.4) + ((1 - stressIntensity) * 0.3);
    }

    // Return average energy score
    return factors > 0 ? energyScore / factors : 0.5;
  };

  // Handle client-side mounting and animations with hydration safety
  useEffect(() => {
    // Mark component as client-mounted to prevent hydration issues
    setIsClientMounted(true);
    
    let interval: NodeJS.Timeout;
    
    // Start animations only after ensuring hydration is complete
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 0.012) % (Math.PI * 2)); // Ultra-slow, luxurious
      }, 50); // Even smoother timing
    }, 200); // Longer delay to ensure hydration is complete

    return () => {
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, []);


  // Define radar chart dimensions and data - even larger to minimize label gap
  const centerX = 180;
  const centerY = 180;
  const maxRadius = 160; // Much larger to fill space with minimal gap to labels
  const breathIntensity = 0.02; // Ultra-subtle breathing effect for maximum elegance
  // Only apply breathing animation after client mount to prevent hydration issues
  const breathingFactor = isClientMounted ? 1 + Math.sin(animationPhase) * breathIntensity : 1;

  // Get the individual sleep metrics, stress metrics, and other health scores
  const sleepMetrics = calculateSleepMetrics();
  const stressMetrics = calculateStressMetrics();
  const stressIntensity = calculateStressScore();
  const energyScore = calculateEnergyScore();
  const bodyHarmonyScore = calculateBodyHarmonyScore();

  // Enhanced health dimensions for the radar chart - determine which metrics to show based on current section
  const dimensions = (() => {
    // Show sleep metrics when in sleep section (section 0)
    if (currentSection === 0) {
      return [
        // Sleep Quality - detailed and elegant
        { 
          name: ['Sleep', 'Quality'], 
          color: '#4b6fa8', // Deep indigo
          fillColor: 'rgba(75, 111, 168, 0.15)',
          glowColor: 'rgba(75, 111, 168, 0.3)',
          angle: 0,
          getValue: () => {
            // Sleep Quality: Most responsive to user answers, can reach high values
            const baseValue = sleepMetrics.sleepQuality;
            return Math.min(0.95, Math.max(0.2, baseValue * 0.75 + 0.15));
          }
        },
        // Sleep Duration
        { 
          name: ['Sleep', 'Duration'], 
          color: '#5a7bb3', // Slightly lighter indigo
          fillColor: 'rgba(90, 123, 179, 0.15)',
          glowColor: 'rgba(90, 123, 179, 0.3)',
          angle: Math.PI / 3,
          getValue: () => {
            // Sleep Duration: Moderate range, harder to perfect
            const baseValue = sleepMetrics.sleepDuration;
            return Math.min(0.85, Math.max(0.2, baseValue * 0.65 + 0.15));
          }
        },
        // Sleep Consistency
        { 
          name: ['Sleep', 'Rhythm'], 
          color: '#6985be', // Medium indigo
          fillColor: 'rgba(105, 133, 190, 0.15)',
          glowColor: 'rgba(105, 133, 190, 0.3)',
          angle: (2 * Math.PI) / 3,
          getValue: () => {
            // Sleep Consistency: Can reach higher values, important metric
            const baseValue = sleepMetrics.sleepConsistency;
            return Math.min(0.92, Math.max(0.2, baseValue * 0.72 + 0.18));
          }
        },
        // Deep Sleep Percentage
        { 
          name: ['Deep', 'Sleep'], 
          color: '#7890c9', // Light indigo
          fillColor: 'rgba(120, 144, 201, 0.15)',
          glowColor: 'rgba(120, 144, 201, 0.3)',
          angle: Math.PI,
          getValue: () => {
            // Deep Sleep: More constrained, realistic range
            const baseValue = sleepMetrics.deepSleepPercentage;
            return Math.min(0.78, Math.max(0.2, baseValue * 0.58 + 0.15));
          }
        },
        // REM Sleep Percentage
        { 
          name: ['REM', 'Sleep'], 
          color: '#879bd4', // Lighter indigo
          fillColor: 'rgba(135, 155, 212, 0.15)',
          glowColor: 'rgba(135, 155, 212, 0.3)',
          angle: (4 * Math.PI) / 3,
          getValue: () => {
            // REM Sleep: Moderate-high range, varies with sleep quality
            const baseValue = sleepMetrics.remSleepPercentage;
            return Math.min(0.88, Math.max(0.2, baseValue * 0.68 + 0.16));
          }
        },
        // Sleep Latency (time to fall asleep)
        { 
          name: ['Sleep', 'Onset'], 
          color: '#96a6df', // Lightest indigo
          fillColor: 'rgba(150, 166, 223, 0.15)',
          glowColor: 'rgba(150, 166, 223, 0.3)',
          angle: (5 * Math.PI) / 3,
          getValue: () => {
            // Sleep Onset: Variable range, depends on consistency and quality
            const baseValue = sleepMetrics.sleepLatency;
            return Math.min(0.90, Math.max(0.2, baseValue * 0.70 + 0.17));
          }
        }
      ];
    }
    // Show stress metrics when in stress section (section 1)
    else if (currentSection === 1) {
      return [
        // Stress Frequency (inverted - low frequency = good)
        { 
          name: ['Stress', 'Calm'], 
          color: '#d95e40', // Red-orange base
          fillColor: 'rgba(217, 94, 64, 0.15)',
          glowColor: 'rgba(217, 94, 64, 0.3)',
          angle: 0,
          getValue: () => {
            return 0.15 + (stressMetrics.stressFrequency * 0.85);
          }
        },
        // Stress Intensity (inverted - low intensity = good)
        { 
          name: ['Stress', 'Control'], 
          color: '#e16b47', // Slightly lighter red-orange
          fillColor: 'rgba(225, 107, 71, 0.15)',
          glowColor: 'rgba(225, 107, 71, 0.3)',
          angle: Math.PI / 3,
          getValue: () => {
            return 0.15 + (stressMetrics.stressIntensity * 0.85);
          }
        },
        // Stress Management (direct - good management = good)
        { 
          name: ['Stress', 'Skills'], 
          color: '#e9784f', // Medium red-orange
          fillColor: 'rgba(233, 120, 79, 0.15)',
          glowColor: 'rgba(233, 120, 79, 0.3)',
          angle: (2 * Math.PI) / 3,
          getValue: () => {
            return 0.15 + (stressMetrics.stressManagement * 0.85);
          }
        },
        // Stress Recovery (direct - fast recovery = good)
        { 
          name: ['Stress', 'Recovery'], 
          color: '#f08556', // Lighter red-orange
          fillColor: 'rgba(240, 133, 86, 0.15)',
          glowColor: 'rgba(240, 133, 86, 0.3)',
          angle: Math.PI,
          getValue: () => {
            return 0.15 + (stressMetrics.stressRecovery * 0.85);
          }
        },
        // Physical Symptoms (inverted - fewer symptoms = good)
        { 
          name: ['Body', 'Ease'], 
          color: '#f8925e', // Light red-orange
          fillColor: 'rgba(248, 146, 94, 0.15)',
          glowColor: 'rgba(248, 146, 94, 0.3)',
          angle: (4 * Math.PI) / 3,
          getValue: () => {
            return 0.15 + (stressMetrics.physicalSymptoms * 0.85);
          }
        },
        // Stress Resilience (derived - higher resilience = good)
        { 
          name: ['Stress', 'Resilience'], 
          color: '#ff9f65', // Lightest red-orange
          fillColor: 'rgba(255, 159, 101, 0.15)',
          glowColor: 'rgba(255, 159, 101, 0.3)',
          angle: (5 * Math.PI) / 3,
          getValue: () => {
            return 0.15 + (stressMetrics.stressResilience * 0.85);
          }
        }
      ];
    }
    // Show energy metrics when in energy section (section 2)
    else if (currentSection === 2) {
      return [
        // Energy Consistency (direct - higher consistency = good)
        { 
          name: ['Energy', 'Stability'], 
          color: '#6b4e9d', // Deep purple
          fillColor: 'rgba(107, 78, 157, 0.15)',
          glowColor: 'rgba(107, 78, 157, 0.3)',
          angle: 0,
          getValue: () => {
            const consistency = responses.energy_consistency !== undefined
              ? (responses.energy_consistency - 1) / 4 // Convert 1-5 to 0-1 scale
              : 0.5;
            return 0.15 + (consistency * 0.85);
          }
        },
        // Energy Crash Resilience (inverted - fewer crashes = good)
        { 
          name: ['Energy', 'Resilience'], 
          color: '#8a6fa3', // Medium purple (brand violet)
          fillColor: 'rgba(138, 111, 163, 0.15)',
          glowColor: 'rgba(138, 111, 163, 0.3)',
          angle: Math.PI / 3,
          getValue: () => {
            const crashResilience = responses.energy_crash_frequency !== undefined
              ? (5 - responses.energy_crash_frequency) / 4 // Invert: fewer crashes = higher resilience
              : 0.5;
            return 0.15 + (crashResilience * 0.85);
          }
        },
        // Recovery Speed (direct - faster recovery = good)
        { 
          name: ['Recovery', 'Speed'], 
          color: '#9a7fb3', // Medium-light purple
          fillColor: 'rgba(154, 127, 179, 0.15)',
          glowColor: 'rgba(154, 127, 179, 0.3)',
          angle: (2 * Math.PI) / 3,
          getValue: () => {
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
            return 0.15 + (recovery * 0.85);
          }
        },
        // Chronotype Alignment (optimal energy peak timing)
        { 
          name: ['Peak', 'Timing'], 
          color: '#aa8fc3', // Light purple
          fillColor: 'rgba(170, 143, 195, 0.15)',
          glowColor: 'rgba(170, 143, 195, 0.3)',
          angle: Math.PI,
          getValue: () => {
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
            return 0.15 + (peakTiming * 0.85);
          }
        },
        // Weekly Energy Sustainability
        { 
          name: ['Weekly', 'Pattern'], 
          color: '#ba9fd3', // Lighter purple
          fillColor: 'rgba(186, 159, 211, 0.15)',
          glowColor: 'rgba(186, 159, 211, 0.3)',
          angle: (4 * Math.PI) / 3,
          getValue: () => {
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
            return 0.15 + (weeklyPattern * 0.85);
          }
        },
        // Energy Vitality (overall energy score composite)
        { 
          name: ['Energy', 'Vitality'], 
          color: '#caafe3', // Lightest purple
          fillColor: 'rgba(202, 175, 227, 0.15)',
          glowColor: 'rgba(202, 175, 227, 0.3)',
          angle: (5 * Math.PI) / 3,
          getValue: () => {
            // Composite score based on all energy factors
            return 0.15 + (energyScore * 0.85);
          }
        }
      ];
    }
    // Show body systems metrics when in body systems section (section 3)
    else if (currentSection === 3) {
      return [
        // Digestive Comfort (1-5 scale, higher is better)
        { 
          name: ['Digestive', 'Comfort'], 
          color: '#6B5A1E', // Deep olive green (darker variation of A38E3A)
          fillColor: 'rgba(107, 90, 30, 0.15)',
          glowColor: 'rgba(107, 90, 30, 0.3)',
          angle: 0,
          getValue: () => {
            const comfort = responses.digestive_comfort !== undefined
              ? (responses.digestive_comfort - 1) / 4 // Convert 1-5 to 0-1 scale
              : 0.5;
            return 0.15 + (comfort * 0.85);
          }
        },
        // Physical Strength (1-5 scale, higher is better)
        { 
          name: ['Physical', 'Strength'], 
          color: '#8A742C', // Medium-dark olive green
          fillColor: 'rgba(138, 116, 44, 0.15)',
          glowColor: 'rgba(138, 116, 44, 0.3)',
          angle: Math.PI / 3,
          getValue: () => {
            const strength = responses.physical_strength !== undefined
              ? (responses.physical_strength - 1) / 4 // Convert 1-5 to 0-1 scale
              : 0.5;
            return 0.15 + (strength * 0.85);
          }
        },
        // Immune Resilience (string values, better resilience = higher score)
        { 
          name: ['Immune', 'Resilience'], 
          color: '#A38E3A', // Medium-light green (brand green)
          fillColor: 'rgba(163, 142, 58, 0.15)',
          glowColor: 'rgba(163, 142, 58, 0.3)',
          angle: (2 * Math.PI) / 3,
          getValue: () => {
            const immuneScores = {
              'rarely': 1.0,           // Excellent immune system
              'occasionally': 0.8,     // Good immune system
              'regularly': 0.5,        // Moderate immune system
              'frequently': 0.3,       // Poor immune system
              'constantly': 0.1        // Very poor immune system
            };
            const immune = responses.immune_resilience !== undefined
              ? immuneScores[responses.immune_resilience as keyof typeof immuneScores] || 0.5
              : 0.5;
            return 0.15 + (immune * 0.85);
          }
        },
        // Body Comfort (1-5 scale, inverted - less discomfort = better)
        { 
          name: ['Body', 'Comfort'], 
          color: '#B8A148', // Light olive green
          fillColor: 'rgba(184, 161, 72, 0.15)',
          glowColor: 'rgba(184, 161, 72, 0.3)',
          angle: Math.PI,
          getValue: () => {
            const comfort = responses.body_discomfort !== undefined
              ? (5 - responses.body_discomfort) / 4 // Invert: less discomfort = higher score
              : 0.5;
            return 0.15 + (comfort * 0.85);
          }
        },
        // Body Satisfaction (1-5 scale, higher is better)
        { 
          name: ['Body', 'Satisfaction'], 
          color: '#CDB456', // Lighter olive green
          fillColor: 'rgba(205, 180, 86, 0.15)',
          glowColor: 'rgba(205, 180, 86, 0.3)',
          angle: (4 * Math.PI) / 3,
          getValue: () => {
            const satisfaction = responses.body_satisfaction !== undefined
              ? (responses.body_satisfaction - 1) / 4 // Convert 1-5 to 0-1 scale
              : 0.5;
            return 0.15 + (satisfaction * 0.85);
          }
        },
        // Body Harmony (composite score based on all body systems)
        { 
          name: ['Body', 'Harmony'], 
          color: '#E2C764', // Lightest olive green
          fillColor: 'rgba(226, 199, 100, 0.15)',
          glowColor: 'rgba(226, 199, 100, 0.3)',
          angle: (5 * Math.PI) / 3,
          getValue: () => {
            // Composite score based on all body systems factors
            return 0.15 + (bodyHarmonyScore * 0.85);
          }
        }
      ];
    }
    // Default empty state
    else {
      return [];
    }
  })();

  // Calculate radar chart points - static (no breathing animation)
  const getRadarPoint = (dimension: any, value: number) => {
    // Ensure value never exceeds 1.0 to keep shape within outermost ring
    const clampedValue = Math.min(1.0, Math.max(0, value));
    const radius = clampedValue * maxRadius; // No breathing factor for data points
    const x = centerX + Math.cos(dimension.angle) * radius;
    const y = centerY + Math.sin(dimension.angle) * radius;
    return { x, y };
  };

  // Create radar polygon path
  const radarPoints = dimensions.map(dim => {
    const value = dim.getValue();
    return getRadarPoint(dim, value);
  });

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

  // Create radar polygon path with smooth bezier curves for sleep, stress, energy, and body systems sections
  const radarPath = radarPoints.length > 0 
    ? (currentSection === 0 || currentSection === 1 || currentSection === 2 || currentSection === 3)
      ? createSmoothRadarPath(radarPoints) // Use bezier curves for sleep, stress, energy, and body systems
      : `M ${radarPoints[0].x} ${radarPoints[0].y} ` + 
        radarPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + 
        ' Z' // Keep straight lines for other sections
    : '';



  // Early return for server-side rendering to prevent hydration issues
  if (!isClientMounted) {
    return (
      <div className="w-full h-full flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:justify-start">
        {/* Static skeleton for SSR - matches the real layout */}
        <div className="lg:h-96 lg:flex-none flex-1 p-6 flex items-center justify-center">
          <div className="w-full h-80 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Skeleton radar chart */}
              <div className="relative">
                <div className="w-64 h-64 rounded-full border border-gray-200 opacity-30"></div>
                <div className="absolute inset-4 rounded-full border border-gray-150 opacity-20"></div>
                <div className="absolute inset-8 rounded-full border border-gray-100 opacity-10"></div>
                {/* Skeleton data points */}
                <div className="absolute top-4 left-1/2 w-2 h-2 bg-gray-200 rounded-full transform -translate-x-1/2 opacity-40"></div>
                <div className="absolute top-12 right-12 w-2 h-2 bg-gray-200 rounded-full opacity-40"></div>
                <div className="absolute bottom-12 right-12 w-2 h-2 bg-gray-200 rounded-full opacity-40"></div>
                <div className="absolute bottom-4 left-1/2 w-2 h-2 bg-gray-200 rounded-full transform -translate-x-1/2 opacity-40"></div>
                <div className="absolute bottom-12 left-12 w-2 h-2 bg-gray-200 rounded-full opacity-40"></div>
                <div className="absolute top-12 left-12 w-2 h-2 bg-gray-200 rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-stretch lg:justify-start transition-opacity duration-500 opacity-100">
      {/* Mobile Key - Above chart on mobile only */}
      <div className="sm:hidden mb-4 px-4 flex justify-center">
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          {dimensions.map((dim, index) => {
            const value = dim.getValue();
            const isActive = value > 0.15;
            
            return (
              <div 
                key={`mobile-key-${index}`}
                className="flex items-center space-x-2"
                style={{ opacity: isActive ? 1 : 0.6 }}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full border border-white"
                  style={{ backgroundColor: dim.color }}
                />
                <div className="flex-1">
                  <div className="text-xs font-normal text-[#3a3a3a] leading-tight">
                    {Array.isArray(dim.name) ? dim.name.join(' ') : dim.name}
                  </div>
                  {isActive && (
                    <div className="text-xs text-[#3a3a3a] font-medium mt-1">
                      {Math.round(value * 100)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Title and Key - Above chart on desktop only */}
      <div className="hidden lg:block mb-4">
        <h3 className="text-lg font-semibold text-[#3a3a3a] mb-4 text-center">Your Human Signal</h3>
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-w-sm">
            {dimensions.map((dim, index) => {
              const value = dim.getValue();
              const isActive = value > 0.15;
              
              return (
                <div 
                  key={`desktop-key-${index}`}
                  className="flex items-center space-x-2"
                  style={{ opacity: isActive ? 1 : 0.6 }}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: dim.color }}
                  />
                  <div className="text-xs font-normal text-[#3a3a3a] leading-tight">
                    {Array.isArray(dim.name) ? dim.name.join(' ') : dim.name}
                  </div>
                  {isActive && (
                    <div className="text-xs text-[#3a3a3a] font-medium ml-auto">
                      {Math.round(value * 100)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-shrink-0 flex items-center justify-center sm:mr-6 lg:mr-0 lg:mb-4">
        <div className="relative">
          <svg 
            width="360" 
            height="360" 
            viewBox="0 0 360 360" 
            className="w-full h-full max-w-[280px] max-h-[280px] sm:max-w-[320px] sm:max-h-[320px] lg:max-w-[350px] lg:max-h-[350px]"
          >
        
        {/* Background grid circles - ultra-elegant breathing with luxurious transitions */}
        {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <circle
            key={`grid-${ratio}`}
            cx={centerX}
            cy={centerY}
            r={maxRadius * ratio * breathingFactor}
            fill="none"
            stroke="rgba(58, 58, 58, 0.15)"
            strokeWidth="1.6"
            className="transition-all duration-[1200ms] ease-out"
            style={{
              transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)'
            }}
          />
        ))}

        {/* Grid lines for each dimension - ultra-elegant breathing with luxurious transitions */}
        {dimensions.map((dim, index) => {
          const endX = centerX + Math.cos(dim.angle) * maxRadius * breathingFactor;
          const endY = centerY + Math.sin(dim.angle) * maxRadius * breathingFactor;
          
          return (
            <line
              key={`line-${index}`}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="rgba(58, 58, 58, 0.15)"
              strokeWidth="1.6"
              className="transition-all duration-[1200ms] ease-out"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)'
              }}
            />
          );
        })}

        {/* Enhanced multi-layer radar visualization with subtle elegance */}
        {radarPoints.length > 0 && (
          <>
            {/* Enhanced radiating glow layers - elegant position morphing */}
            {radarPoints.map((point, index) => {
              const dim = dimensions[index];
              const value = dim.getValue();
              const isActive = currentSection === 0 ? true : value > 0.2; // Always pulsate in sleep section
              
              return isActive ? (
                <g key={`sleep-glow-group-${index}`}>
                  {/* Outermost pulse wave - ultra-luxurious expansion */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isClientMounted ? 8 + (16 * Math.abs(Math.sin(animationPhase + index * 0.25))) : 8}
                    fill={currentSection === 0 ? "rgba(151, 175, 245, 0.4)" : dim.glowColor}
                    opacity={isClientMounted ? 0.03 + (0.06 * (1 - Math.abs(Math.sin(animationPhase + index * 0.25)))) : 0.03}
                    className="transition-all duration-[2400ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'cx, cy, opacity, r, fill'
                    }}
                  />
                  
                  {/* Large pulse wave - ultra-luxurious */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isClientMounted ? 6 + (12 * Math.abs(Math.sin(animationPhase + index * 0.3 + 0.2))) : 6}
                    fill={currentSection === 0 ? "rgba(151, 175, 245, 0.4)" : dim.glowColor}
                    opacity={isClientMounted ? 0.04 + (0.07 * (1 - Math.abs(Math.sin(animationPhase + index * 0.3 + 0.2)))) : 0.04}
                    className="transition-all duration-[2400ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'cx, cy, opacity, r, fill'
                    }}
                  />
                  
                  {/* Medium pulse wave - ultra-luxurious */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isClientMounted ? 4 + (8 * Math.abs(Math.sin(animationPhase + index * 0.35 + 0.4))) : 4}
                    fill={currentSection === 0 ? "rgba(151, 175, 245, 0.4)" : dim.glowColor}
                    opacity={isClientMounted ? 0.05 + (0.08 * (1 - Math.abs(Math.sin(animationPhase + index * 0.35 + 0.4)))) : 0.05}
                    className="transition-all duration-[2400ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'cx, cy, opacity, r, fill'
                    }}
                  />
                </g>
              ) : null;
            })}
            
            {/* Render sleep layer underneath when in stress section */}
            {currentSection === 1 && (() => {
              // Create sleep pattern underneath using sleep metrics
              const sleepDimensions = [
                { name: ['Sleep', 'Quality'], color: '#4b6fa8', getValue: () => 0.15 + (sleepMetrics.sleepQuality * 0.85), angle: 0 },
                { name: ['Sleep', 'Duration'], color: '#5d7ab3', getValue: () => 0.15 + (sleepMetrics.sleepDuration * 0.85), angle: Math.PI / 3 },
                { name: ['Sleep', 'Rhythm'], color: '#6e85be', getValue: () => 0.15 + (sleepMetrics.sleepConsistency * 0.85), angle: (2 * Math.PI) / 3 },
                { name: ['Deep', 'Sleep'], color: '#7f90c9', getValue: () => 0.15 + (sleepMetrics.deepSleepPercentage * 0.85), angle: Math.PI },
                { name: ['REM', 'Sleep'], color: '#909bd4', getValue: () => 0.15 + (sleepMetrics.remSleepPercentage * 0.85), angle: (4 * Math.PI) / 3 },
                { name: ['Sleep', 'Onset'], color: '#a1a6df', getValue: () => 0.15 + (sleepMetrics.sleepLatency * 0.85), angle: (5 * Math.PI) / 3 }
              ];
              
              const sleepPoints = sleepDimensions.map(dim => {
                const value = dim.getValue();
                const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor;
                return {
                  x: centerX + Math.cos(dim.angle - Math.PI / 2) * radius,
                  y: centerY + Math.sin(dim.angle - Math.PI / 2) * radius,
                  value
                };
              });
              
              const smoothSleepPath = createSmoothRadarPath(sleepPoints);
              
              return (
                <path
                  d={smoothSleepPath}
                  fill="rgba(75, 111, 168, 0.18)"
                  stroke="none"
                  opacity="0.85"
                  className="transition-all duration-[3500ms] ease-out"
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                    transitionProperty: 'd, opacity, fill'
                  }}
                />
              );
            })()}

            {/* Render stress and sleep layers underneath when in energy section */}
            {currentSection === 2 && (() => {
              // First, render sleep layer (deepest background)
              const sleepDimensions = [
                { name: ['Sleep', 'Quality'], color: '#4b6fa8', getValue: () => 0.15 + (sleepMetrics.sleepQuality * 0.85), angle: 0 },
                { name: ['Sleep', 'Duration'], color: '#5d7ab3', getValue: () => 0.15 + (sleepMetrics.sleepDuration * 0.85), angle: Math.PI / 3 },
                { name: ['Sleep', 'Rhythm'], color: '#6e85be', getValue: () => 0.15 + (sleepMetrics.sleepConsistency * 0.85), angle: (2 * Math.PI) / 3 },
                { name: ['Deep', 'Sleep'], color: '#7f90c9', getValue: () => 0.15 + (sleepMetrics.deepSleepPercentage * 0.85), angle: Math.PI },
                { name: ['REM', 'Sleep'], color: '#909bd4', getValue: () => 0.15 + (sleepMetrics.remSleepPercentage * 0.85), angle: (4 * Math.PI) / 3 },
                { name: ['Sleep', 'Onset'], color: '#a1a6df', getValue: () => 0.15 + (sleepMetrics.sleepLatency * 0.85), angle: (5 * Math.PI) / 3 }
              ];
              
              const sleepPoints = sleepDimensions.map(dim => {
                const value = dim.getValue();
                const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor;
                return {
                  x: centerX + Math.cos(dim.angle - Math.PI / 2) * radius,
                  y: centerY + Math.sin(dim.angle - Math.PI / 2) * radius,
                  value
                };
              });
              
              const sleepPath = createSmoothRadarPath(sleepPoints);
              
              // Then, render stress layer (middle layer)
              const stressDimensions = [
                { name: ['Stress', 'Calm'], color: '#d95e40', getValue: () => 0.15 + (stressMetrics.stressFrequency * 0.85), angle: 0 },
                { name: ['Stress', 'Control'], color: '#e16b47', getValue: () => 0.15 + (stressMetrics.stressIntensity * 0.85), angle: Math.PI / 3 },
                { name: ['Stress', 'Skills'], color: '#e9784f', getValue: () => 0.15 + (stressMetrics.stressManagement * 0.85), angle: (2 * Math.PI) / 3 },
                { name: ['Stress', 'Recovery'], color: '#f08556', getValue: () => 0.15 + (stressMetrics.stressRecovery * 0.85), angle: Math.PI },
                { name: ['Body', 'Ease'], color: '#f8925e', getValue: () => 0.15 + (stressMetrics.physicalSymptoms * 0.85), angle: (4 * Math.PI) / 3 },
                { name: ['Stress', 'Resilience'], color: '#ff9f65', getValue: () => 0.15 + (stressMetrics.stressResilience * 0.85), angle: (5 * Math.PI) / 3 }
              ];
              
              const stressPoints = stressDimensions.map(dim => {
                const value = dim.getValue();
                const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor;
                return {
                  x: centerX + Math.cos(dim.angle - Math.PI / 2) * radius,
                  y: centerY + Math.sin(dim.angle - Math.PI / 2) * radius,
                  value
                };
              });
              
              const stressPath = createSmoothRadarPath(stressPoints);
              
              return (
                <>
                  {/* Sleep background layer (deepest) */}
                  <path
                    d={sleepPath}
                    fill="rgba(75, 111, 168, 0.15)"
                    stroke="none"
                    opacity="0.75"
                    className="transition-all duration-[3500ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'd, opacity, fill'
                    }}
                  />
                  
                  {/* Stress middle layer (lighter than in stress section) */}
                  <path
                    d={stressPath}
                    fill="rgba(217, 94, 64, 0.18)"
                    stroke="none"
                    opacity="0.8"
                    className="transition-all duration-[3500ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'd, opacity, fill'
                    }}
                  />
                </>
              );
            })()}

            {/* Render all background layers when in body systems section */}
            {currentSection === 3 && (() => {
              // First, render sleep layer (deepest background)
              const sleepDimensions = [
                { name: ['Sleep', 'Quality'], color: '#4b6fa8', getValue: () => 0.15 + (sleepMetrics.sleepQuality * 0.85), angle: 0 },
                { name: ['Sleep', 'Duration'], color: '#5d7ab3', getValue: () => 0.15 + (sleepMetrics.sleepDuration * 0.85), angle: Math.PI / 3 },
                { name: ['Sleep', 'Rhythm'], color: '#6e85be', getValue: () => 0.15 + (sleepMetrics.sleepConsistency * 0.85), angle: (2 * Math.PI) / 3 },
                { name: ['Deep', 'Sleep'], color: '#7f90c9', getValue: () => 0.15 + (sleepMetrics.deepSleepPercentage * 0.85), angle: Math.PI },
                { name: ['REM', 'Sleep'], color: '#909bd4', getValue: () => 0.15 + (sleepMetrics.remSleepPercentage * 0.85), angle: (4 * Math.PI) / 3 },
                { name: ['Sleep', 'Onset'], color: '#a1a6df', getValue: () => 0.15 + (sleepMetrics.sleepLatency * 0.85), angle: (5 * Math.PI) / 3 }
              ];
              
              const sleepPoints = sleepDimensions.map(dim => {
                const value = dim.getValue();
                const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor;
                return {
                  x: centerX + Math.cos(dim.angle - Math.PI / 2) * radius,
                  y: centerY + Math.sin(dim.angle - Math.PI / 2) * radius,
                  value
                };
              });
              
              const sleepPath = createSmoothRadarPath(sleepPoints);
              
              // Second, render stress layer 
              const stressDimensions = [
                { name: ['Stress', 'Calm'], color: '#d95e40', getValue: () => 0.15 + (stressMetrics.stressFrequency * 0.85), angle: 0 },
                { name: ['Stress', 'Control'], color: '#e16b47', getValue: () => 0.15 + (stressMetrics.stressIntensity * 0.85), angle: Math.PI / 3 },
                { name: ['Stress', 'Skills'], color: '#e9784f', getValue: () => 0.15 + (stressMetrics.stressManagement * 0.85), angle: (2 * Math.PI) / 3 },
                { name: ['Stress', 'Recovery'], color: '#f08556', getValue: () => 0.15 + (stressMetrics.stressRecovery * 0.85), angle: Math.PI },
                { name: ['Body', 'Ease'], color: '#f8925e', getValue: () => 0.15 + (stressMetrics.physicalSymptoms * 0.85), angle: (4 * Math.PI) / 3 },
                { name: ['Stress', 'Resilience'], color: '#ff9f65', getValue: () => 0.15 + (stressMetrics.stressResilience * 0.85), angle: (5 * Math.PI) / 3 }
              ];
              
              const stressPoints = stressDimensions.map(dim => {
                const value = dim.getValue();
                const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor;
                return {
                  x: centerX + Math.cos(dim.angle - Math.PI / 2) * radius,
                  y: centerY + Math.sin(dim.angle - Math.PI / 2) * radius,
                  value
                };
              });
              
              const stressPath = createSmoothRadarPath(stressPoints);
              
              // Third, render energy layer
              const energyConsistency = responses.energy_consistency !== undefined
                ? (responses.energy_consistency - 1) / 4
                : 0.5;
              const crashResilience = responses.energy_crash_frequency !== undefined
                ? (5 - responses.energy_crash_frequency) / 4
                : 0.5;
              const recoveryScores = {
                'immediate': 1.0, 'quick': 0.9, 'moderate': 0.7, 'extended': 0.5, 'overnight': 0.3, 'multiday': 0.1
              };
              const recovery = responses.recovery_time !== undefined
                ? recoveryScores[responses.recovery_time as keyof typeof recoveryScores] || 0.5
                : 0.5;
              const peakTimeScores = {
                'early_morning': 0.9, 'mid_morning': 0.85, 'midday': 0.7, 'afternoon': 0.6, 'early_evening': 0.5, 'late_evening': 0.4
              };
              const peakTiming = responses.energy_peak_time !== undefined
                ? peakTimeScores[responses.energy_peak_time as keyof typeof peakTimeScores] || 0.6
                : 0.6;
              const weeklyPatternScores = {
                'fairly_consistent': 1.0, 'builds_up': 0.8, 'midweek_peak': 0.7, 'weekend_boost': 0.6, 'starts_high_decreases': 0.4
              };
              const weeklyPattern = responses.weekly_energy_pattern !== undefined
                ? weeklyPatternScores[responses.weekly_energy_pattern as keyof typeof weeklyPatternScores] || 0.6
                : 0.6;
              const energyVitality = (energyConsistency + crashResilience + recovery + peakTiming + weeklyPattern) / 5;
                
              const energyDimensions = [
                { name: ['Energy', 'Stability'], color: '#6b4e9d', getValue: () => 0.15 + (energyConsistency * 0.85), angle: 0 },
                { name: ['Energy', 'Resilience'], color: '#8a6fa3', getValue: () => 0.15 + (crashResilience * 0.85), angle: Math.PI / 3 },
                { name: ['Recovery', 'Speed'], color: '#9a7fb3', getValue: () => 0.15 + (recovery * 0.85), angle: (2 * Math.PI) / 3 },
                { name: ['Peak', 'Timing'], color: '#aa8fc3', getValue: () => 0.15 + (peakTiming * 0.85), angle: Math.PI },
                { name: ['Weekly', 'Pattern'], color: '#ba9fd3', getValue: () => 0.15 + (weeklyPattern * 0.85), angle: (4 * Math.PI) / 3 },
                { name: ['Energy', 'Vitality'], color: '#caafe3', getValue: () => 0.15 + (energyVitality * 0.85), angle: (5 * Math.PI) / 3 }
              ];
              
              const energyPoints = energyDimensions.map(dim => {
                const value = dim.getValue();
                const radius = (0.2 + value * 0.8) * maxRadius * breathingFactor;
                return {
                  x: centerX + Math.cos(dim.angle - Math.PI / 2) * radius,
                  y: centerY + Math.sin(dim.angle - Math.PI / 2) * radius,
                  value
                };
              });
              
              const energyPath = createSmoothRadarPath(energyPoints);
              
              return (
                <>
                  {/* Sleep background layer (deepest) */}
                  <path
                    d={sleepPath}
                    fill="rgba(75, 111, 168, 0.08)"
                    stroke="none"
                    opacity="0.6"
                    className="transition-all duration-[3500ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'd, opacity, fill'
                    }}
                  />
                  
                  {/* Stress middle layer */}
                  <path
                    d={stressPath}
                    fill="rgba(217, 94, 64, 0.12)"
                    stroke="none"
                    opacity="0.65"
                    className="transition-all duration-[3500ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'd, opacity, fill'
                    }}
                  />
                  
                  {/* Energy upper middle layer */}
                  <path
                    d={energyPath}
                    fill="rgba(138, 111, 163, 0.15)"
                    stroke="none"
                    opacity="0.7"
                    className="transition-all duration-[3500ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'd, opacity, fill'
                    }}
                  />
                </>
              );
            })()}

            {/* Clean single layer - sleep section uses smooth gradient, others keep original multi-layer */}
            {currentSection === 0 ? (
              // Sleep section: Single clean gradient fill with no stroke
              <path
                d={radarPath}
                fill="url(#sleepLayerGradientNew)"
                stroke="none"
                opacity="1.0"
                className="transition-all duration-[3500ms] ease-out"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                  transitionProperty: 'd, opacity, fill, stroke'
                }}
              />
            ) : currentSection === 1 ? (
              // Stress section: Show stress pattern with smooth curves and red-orange gradient
              <path
                d={radarPath}
                fill="url(#stressLayerGradientNew)"
                stroke="none"
                opacity="0.9"
                className="transition-all duration-[3500ms] ease-out"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                  transitionProperty: 'd, opacity, fill'
                }}
              />
            ) : currentSection === 2 ? (
              // Energy section: Show energy pattern with smooth curves and purple gradient
              <path
                d={radarPath}
                fill="url(#energyLayerGradientNew)"
                stroke="none"
                opacity="0.9"
                className="transition-all duration-[3500ms] ease-out"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                  transitionProperty: 'd, opacity, fill'
                }}
              />
            ) : currentSection === 3 ? (
              // Body Systems section: Show body systems pattern with smooth curves and green gradient
              <path
                d={radarPath}
                fill="url(#bodySystemsLayerGradientNew)"
                stroke="none"
                opacity="0.9"
                className="transition-all duration-[3500ms] ease-out"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                  transitionProperty: 'd, opacity, fill'
                }}
              />
            ) : (
              // Other sections: Keep original multi-layer system
              <>
                <path
                  d={radarPath}
                  fill="url(#sleepLayerGradient)"
                  stroke="rgba(75, 111, 168, 0.5)"
                  strokeWidth="1.5"
                  opacity="0.7"
                  className="transition-all duration-[3500ms] ease-out"
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                    transitionProperty: 'd, opacity, fill, stroke'
                  }}
                />
                
                <path
                  d={radarPath}
                  fill="rgba(75, 111, 168, 0.15)"
                  stroke="rgba(75, 111, 168, 0.3)"
                  strokeWidth="1"
                  opacity="1"
                  className="transition-all duration-[3500ms] ease-out lg:hidden"
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                    transitionProperty: 'd, opacity, fill, stroke'
                  }}
                />
                
                <path
                  d={radarPath}
                  fill="none"
                  stroke="rgba(75, 111, 168, 0.4)"
                  strokeWidth="1.5"
                  opacity="1"
                  className="transition-all duration-[3500ms] ease-out lg:hidden"
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                    transitionProperty: 'd, stroke, opacity'
                  }}
                />
                
                <g transform={`translate(${centerX}, ${centerY}) scale(0.8) translate(${-centerX}, ${-centerY})`}>
                  <path
                    d={radarPath}
                    fill={currentSection === 1
                      ? "url(#stressLayerInner)"
                      : currentSection === 2
                        ? "url(#energyLayerInner)"
                        : "url(#bodySystemsLayerInner)"
                    }
                    opacity="0.5"
                    className="transition-all duration-[3500ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'd, opacity, fill'
                    }}
                  />
                </g>
              </>
            )}
          </>
        )}

        {/* Enhanced data points - much smaller dots with pulsing background glow */}
        {dimensions.map((dim, index) => {
          const value = dim.getValue();
          const point = getRadarPoint(dim, value);
          const isActive = currentSection === 0 ? true : value > 0.2; // Always pulsate in sleep section
          
          return (
            <g key={`point-group-${index}`}>
              {/* Enhanced pulsing background glow - elegant position transitions */}
              {isActive && (
                <>
                  {/* Large outer pulse wave - ultra-luxurious morphing */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isClientMounted ? 6 + (12 * Math.abs(Math.sin(animationPhase + index * 0.3))) : 6}
                    fill={currentSection === 0 ? "rgba(151, 175, 245, 0.4)" : dim.glowColor}
                    opacity={isClientMounted ? 0.06 + (0.08 * (1 - Math.abs(Math.sin(animationPhase + index * 0.3)))) : 0.06}
                    className="transition-all duration-[2800ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'cx, cy, opacity, r, fill'
                    }}
                  />
                  
                  {/* Medium pulse wave - ultra-luxurious morphing */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isClientMounted ? 4 + (8 * Math.abs(Math.sin(animationPhase + index * 0.4 + 0.3))) : 4}
                    fill={currentSection === 0 ? "rgba(151, 175, 245, 0.4)" : dim.glowColor}
                    opacity={isClientMounted ? 0.08 + (0.1 * (1 - Math.abs(Math.sin(animationPhase + index * 0.4 + 0.3)))) : 0.08}
                    className="transition-all duration-[2800ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'cx, cy, opacity, r, fill'
                    }}
                  />
                  
                  {/* Inner pulse wave - ultra-luxurious morphing */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isClientMounted ? 2 + (5 * Math.abs(Math.sin(animationPhase + index * 0.5 + 0.6))) : 2}
                    fill={currentSection === 0 ? "rgba(151, 175, 245, 0.4)" : dim.glowColor}
                    opacity={isClientMounted ? 0.1 + (0.12 * (1 - Math.abs(Math.sin(animationPhase + index * 0.5 + 0.6)))) : 0.1}
                    className="transition-all duration-[2800ms] ease-out"
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                      transitionProperty: 'cx, cy, opacity, r, fill'
                    }}
                  />
                </>
              )}
              
              {/* Clean main data point - ultra-luxurious position transitions */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? "2.5" : "1.5"}
                fill={dim.color}
                opacity={isActive ? 1 : 0.7}
                className="transition-all duration-[3200ms] ease-out"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
                  transitionProperty: 'cx, cy, r, opacity, fill'
                }}
              />
            </g>
          );
        })}

        {/* Center pulse with animated ripples - hydration-safe */}
        <circle
          cx={centerX}
          cy={centerY}
          r={7 * breathingFactor}
          fill="#FCF8F4"
          opacity="0.9"
          className="transition-all duration-100 ease-in-out"
          style={{
            filter: `drop-shadow(0 0 16px rgba(252, 248, 244, 0.6))`
          }}
        />
        
        {/* Animated ripple effects - hydration-safe */}
        <circle
          cx={centerX}
          cy={centerY}
          r={18 * breathingFactor}
          fill="none"
          stroke="#FCF8F4"
          strokeWidth="1.5"
          opacity={isClientMounted ? 0.6 * Math.abs(Math.sin(animationPhase * 2)) : 0.6}
          className="transition-all duration-100 ease-in-out"
        />
        
        <circle
          cx={centerX}
          cy={centerY}
          r={32 * breathingFactor}
          fill="none"
          stroke="#FCF8F4"
          strokeWidth="1"
          opacity={isClientMounted ? 0.4 * Math.abs(Math.sin(animationPhase * 2 + Math.PI / 2)) : 0.4}
          className="transition-all duration-100 ease-in-out"
        />
        
        <circle
          cx={centerX}
          cy={centerY}
          r={52 * breathingFactor}
          fill="none"
          stroke="#FCF8F4"
          strokeWidth="0.5"
          opacity={isClientMounted ? 0.2 * Math.abs(Math.sin(animationPhase * 2 + Math.PI)) : 0.2}
          className="transition-all duration-100 ease-in-out"
        />

        {/* Enhanced gradient definitions for elegant sleep layer visualization - mobile optimized */}
        <defs>
          {/* Primary sleep layer gradient - elegant radial fade, enhanced for mobile */}
          <radialGradient id="sleepLayerGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" stopOpacity="0.9" />
            <stop offset="30%" stopColor="rgba(150, 166, 223, 0.4)" stopOpacity="0.7" />
            <stop offset="70%" stopColor="rgba(75, 111, 168, 0.3)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgba(75, 111, 168, 0.2)" stopOpacity="0.3" />
          </radialGradient>
          
          {/* Inner sleep layer gradient - depth effect, enhanced for mobile */}
          <radialGradient id="sleepLayerInner" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(248, 246, 242, 0.7)" stopOpacity="1" />
            <stop offset="50%" stopColor="rgba(120, 144, 201, 0.4)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgba(75, 111, 168, 0.3)" stopOpacity="0.4" />
          </radialGradient>
          
          {/* New enhanced sleep gradient - matches Figma design with vibrant periwinkle gradient */}
          <radialGradient id="sleepLayerGradientNew" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(122, 140, 196)" stopOpacity="1.0" />
          </radialGradient>
          
          {/* New enhanced sleep inner gradient - depth layer for Figma design */}
          <radialGradient id="sleepLayerInnerNew" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(245, 248, 255, 0.95)" stopOpacity="1" />
            <stop offset="30%" stopColor="rgba(200, 215, 255, 0.7)" stopOpacity="0.9" />
            <stop offset="70%" stopColor="rgba(151, 175, 245, 0.4)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="rgba(123, 150, 220, 0.2)" stopOpacity="0.4" />
          </radialGradient>
          
          {/* Primary stress layer gradient - elegant radial fade with blue tones */}
          <radialGradient id="stressLayerGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" stopOpacity="0.9" />
            <stop offset="30%" stopColor="rgba(158, 174, 218, 0.4)" stopOpacity="0.7" />
            <stop offset="70%" stopColor="rgba(122, 140, 196, 0.3)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgba(122, 140, 196, 0.2)" stopOpacity="0.3" />
          </radialGradient>
          
          {/* Inner stress layer gradient - depth effect with blue tones */}
          <radialGradient id="stressLayerInner" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(248, 246, 242, 0.7)" stopOpacity="1" />
            <stop offset="50%" stopColor="rgba(140, 156, 204, 0.4)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgba(122, 140, 196, 0.3)" stopOpacity="0.4" />
          </radialGradient>
          
          {/* Primary energy layer gradient - elegant radial fade with grey tones */}
          <radialGradient id="energyLayerGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" stopOpacity="0.9" />
            <stop offset="30%" stopColor="rgba(171, 185, 206, 0.4)" stopOpacity="0.7" />
            <stop offset="70%" stopColor="rgba(108, 128, 156, 0.3)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgba(90, 108, 132, 0.2)" stopOpacity="0.3" />
          </radialGradient>
          
          {/* Inner energy layer gradient - depth effect with grey tones */}
          <radialGradient id="energyLayerInner" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(248, 246, 242, 0.7)" stopOpacity="1" />
            <stop offset="50%" stopColor="rgba(153, 167, 188, 0.4)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgba(108, 128, 156, 0.3)" stopOpacity="0.4" />
          </radialGradient>
          
          {/* Primary body systems layer gradient - elegant radial fade with light grey tones */}
          <radialGradient id="bodySystemsLayerGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" stopOpacity="0.9" />
            <stop offset="30%" stopColor="rgba(185, 194, 210, 0.4)" stopOpacity="0.7" />
            <stop offset="70%" stopColor="rgba(138, 148, 168, 0.3)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgba(118, 128, 148, 0.2)" stopOpacity="0.3" />
          </radialGradient>
          
          {/* Inner body systems layer gradient - depth effect with light grey tones */}
          <radialGradient id="bodySystemsLayerInner" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(248, 246, 242, 0.7)" stopOpacity="1" />
            <stop offset="50%" stopColor="rgba(165, 175, 195, 0.4)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgba(138, 148, 168, 0.3)" stopOpacity="0.4" />
          </radialGradient>
          
          {/* New red-orange gradient for stress patterns - matches Figma design */}
          <radialGradient id="stressLayerGradientNew" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(227, 150, 132)" stopOpacity="1.0" />
          </radialGradient>
          
          {/* New purple gradient for energy patterns - matches Figma design */}
          <radialGradient id="energyLayerGradientNew" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(138, 111, 163)" stopOpacity="1.0" />
          </radialGradient>
          
          {/* New olive green gradient for body systems patterns - matches Figma design */}
          <radialGradient id="bodySystemsLayerGradientNew" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgb(252, 248, 244)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(163, 142, 58)" stopOpacity="1.0" />
          </radialGradient>
          
          {/* Mobile fallback gradient - solid and visible */}
          <linearGradient id="sleepLayerMobile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(75, 111, 168, 0.15)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="rgba(120, 144, 201, 0.12)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="rgba(150, 166, 223, 0.1)" stopOpacity="0.5" />
          </linearGradient>
          
          {/* Legacy gradients for compatibility - simplified for better mobile support */}
          <radialGradient id="radarGradientBase" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f8f6f2" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#e8b8a8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8db4d8" stopOpacity="0.3" />
          </radialGradient>
          
          <radialGradient id="radarGradientMid" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#f0ede8" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#b8a8c6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8db4d8" stopOpacity="0.2" />
          </radialGradient>
          
          <radialGradient id="radarGradientTop" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f8f6f2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#e8b8a8" stopOpacity="0.3" />
          </radialGradient>
        </defs>
          </svg>

          {/* Desktop Labels - Around the chart on desktop only, no percentages */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            {dimensions.map((dim, index) => {
              // Increased label spacing to sit well outside the radar chart
              const labelRadius = maxRadius + 35;
              const labelX = centerX + Math.cos(dim.angle) * labelRadius;
              const labelY = centerY + Math.sin(dim.angle) * labelRadius;
              const value = dim.getValue();
              
              return (
                <div 
                  key={`desktop-label-${index}`}
                  className="absolute text-[10px] font-light transition-all duration-500"
                  style={{
                    left: `${(labelX / 360) * 100}%`,
                    top: `${(labelY / 360) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    color: value > 0.15 ? '#3a3a3a' : 'rgba(58, 58, 58, 0.5)',
                    opacity: value > 0.15 ? 1 : 0.7
                  }}
                >
                  <div className="text-center font-light leading-tight">
                    {Array.isArray(dim.name) ? dim.name.map((word, wordIndex) => (
                      <div key={wordIndex}>{word}</div>
                    )) : dim.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tablet Key - Next to chart on tablet only, hidden on mobile and desktop */}
      <div className="hidden sm:block lg:hidden">
          {chartTitle && (
            <h3 className="text-base font-medium text-[#3a3a3a] mb-5">{chartTitle}</h3>
          )}
        <div className="space-y-4 min-w-[200px]">
          {dimensions.map((dim, index) => {
            const value = dim.getValue();
            const isActive = value > 0.15;
            
            return (
              <div 
                key={`tablet-key-${index}`}
                className="flex items-center space-x-3"
                style={{ opacity: isActive ? 1 : 0.6 }}
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: dim.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-normal text-[#3a3a3a] leading-tight">
                    {Array.isArray(dim.name) ? dim.name.join(' ') : dim.name}
                  </div>
                  {isActive && (
                    <div className="text-xs text-[#3a3a3a] font-medium mt-1">
                      {Math.round(value * 100)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Description - Below chart on desktop only */}
      <div className="hidden lg:block mt-4 px-4">
        <p className="text-sm text-[#3a3a3a]/70 text-left leading-relaxed">
          Your wellness signal evolves as you complete each section. Watch your unique pattern emerge as you progress through the assessment.
        </p>
      </div>
    </div>
  );
}
