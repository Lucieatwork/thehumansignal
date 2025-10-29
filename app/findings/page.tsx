'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayeredRadarChart from '../components/LayeredRadarChart';
import { 
  analyzeSleepResponses,
  SleepAnalysis
} from '../components/assessment/SleepRhythms';
import { 
  analyzeStressResponses,
  StressAnalysis
} from '../components/assessment/StressPatterns';
import { 
  analyzeEnergyResponses
} from '../components/assessment/EnergyCycles';
import { 
  analyzeBodySystemsResponses,
  BodyAnalysis
} from '../components/assessment/BodySystems';

// Comprehensive findings page showing layered health analysis
// This is where users see their complete Human Signal with all dimensions
export default function Findings() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [showPotential, setShowPotential] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    sleep: true,
    stress: true,
    energy: true,
    bodySystems: true
  });
  // Individual potential visibility controls for each layer
  const [visiblePotentials, setVisiblePotentials] = useState({
    sleep: false,
    stress: false,
    energy: false,
    bodySystems: false
  });
  const [expansionPhase, setExpansionPhase] = useState<'entering' | 'exploring' | 'storytelling'>('entering');
  const [currentStory, setCurrentStory] = useState<string | null>(null);

  // Load assessment responses from localStorage on mount
  useEffect(() => {
    const savedResponses = localStorage.getItem('humanSignalResponses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }

    // Trigger expansion animation after mount
    setTimeout(() => {
      setExpansionPhase('exploring');
    }, 1000);
  }, []);

  // Calculate comprehensive analysis across all dimensions
  const generateComprehensiveAnalysis = () => {
    if (Object.keys(responses).length === 0) return null;

    const sleepAnalysis = analyzeSleepResponses(responses);
    const stressAnalysis = analyzeStressResponses(responses);
    const energyAnalysis = analyzeEnergyResponses({
      energy_peak_time: responses.energy_peak_time,
      energy_consistency: responses.energy_consistency,
      weekly_energy_pattern: responses.weekly_energy_pattern,
      energy_crash_frequency: responses.energy_crash_frequency,
      recovery_time: responses.recovery_time
    });
    const bodySystemsAnalysis = analyzeBodySystemsResponses(responses);

    return {
      sleep: sleepAnalysis,
      stress: stressAnalysis,
      energy: energyAnalysis,
      bodySystems: bodySystemsAnalysis,
      overallScore: Math.round((
        sleepAnalysis.overallScore + 
        stressAnalysis.overallScore + 
        energyAnalysis.overallScore + 
        bodySystemsAnalysis.overallScore
      ) / 4)
    };
  };

  const analysis = generateComprehensiveAnalysis();

  // Layer control functions
  const toggleLayer = (layerId: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  // Individual potential control functions
  const toggleLayerPotential = (layerId: keyof typeof visiblePotentials) => {
    setVisiblePotentials(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const focusOnLayer = (layerId: string) => {
    // Only toggle the active layer selection, don't change visibility
    setActiveLayer(activeLayer === layerId ? null : layerId);
  };

  const focusExclusivelyOnLayer = (layerId: string) => {
    // Hide all other layers and show only the selected one
    setVisibleLayers({
      sleep: layerId === 'sleep',
      stress: layerId === 'stress', 
      energy: layerId === 'energy',
      bodySystems: layerId === 'bodySystems'
    });
    setActiveLayer(layerId);
  };

  const showAllLayers = () => {
    setVisibleLayers({
      sleep: true,
      stress: true,
      energy: true,
      bodySystems: true
    });
    setActiveLayer(null);
  };

  // Story generation for different layers
  const generateLayerStory = (layerId: string) => {
    if (!analysis) return '';

    const stories = {
      sleep: `Your sleep patterns reveal ${analysis.sleep.overallScore >= 75 ? 'strong' : analysis.sleep.overallScore >= 50 ? 'moderate' : 'developing'} foundations. ${analysis.sleep.strengths.length > 0 ? 'Your ' + analysis.sleep.strengths[0].toLowerCase() + '.' : ''} ${analysis.sleep.concerns.length > 0 ? 'Areas for growth include ' + analysis.sleep.concerns[0].toLowerCase() + '.' : ''}`,
      
      stress: `Your stress management shows ${analysis.stress.overallScore >= 75 ? 'excellent' : analysis.stress.overallScore >= 50 ? 'good' : 'developing'} resilience patterns. ${analysis.stress.strengths.length > 0 ? analysis.stress.strengths[0] + '.' : ''} ${analysis.stress.concerns.length > 0 ? 'Focus areas include ' + analysis.stress.concerns[0].toLowerCase() + '.' : ''}`,
      
      energy: `Your energy cycles demonstrate ${analysis.energy.overallScore >= 75 ? 'strong' : analysis.energy.overallScore >= 50 ? 'moderate' : 'developing'} vitality patterns. ${analysis.energy.strengths.length > 0 ? analysis.energy.strengths[0] + '.' : ''} ${analysis.energy.concerns.length > 0 ? 'Opportunities lie in ' + analysis.energy.concerns[0].toLowerCase() + '.' : ''}`,
      
      bodySystems: `Your physical systems show ${analysis.bodySystems.overallScore >= 75 ? 'excellent' : analysis.bodySystems.overallScore >= 50 ? 'good' : 'developing'} harmony. ${analysis.bodySystems.strengths.length > 0 ? analysis.bodySystems.strengths[0] + '.' : ''} ${analysis.bodySystems.concerns.length > 0 ? 'Growth areas include ' + analysis.bodySystems.concerns[0].toLowerCase() + '.' : ''}`
    };

    return stories[layerId as keyof typeof stories] || '';
  };

  // If no responses, redirect back to assessment
  useEffect(() => {
    if (Object.keys(responses).length === 0) {
      const timer = setTimeout(() => {
        window.location.href = '/assessment';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [responses]);

  if (Object.keys(responses).length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#3a3a3a] mb-4">Loading your Human Signal...</div>
          <div className="text-sm text-[#3a3a3a]/60">Redirecting to assessment if no data found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img src="/home_page.svg" alt="" className="w-full h-full object-cover opacity-20" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Header and Chart */}
        <div className="flex flex-col lg:flex-1">
          {/* Header */}
          <header className="p-6 lg:p-8 border-b border-white/20">
            <div className="max-w-4xl">
              <h1 className="text-3xl lg:text-4xl font-light text-[#3a3a3a] mb-3">
                {analysis ? `Comprehensive Health Analysis: ${analysis.overallScore}%` : 'Comprehensive Health Analysis'}
              </h1>
              
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#3a3a3a] text-white">
                  Your Complete Human Signal
                </span>
              </div>
              
              <p className="text-lg text-[#3a3a3a]/70 leading-relaxed max-w-2xl mb-6">
                Your unique health pattern emerges through the intersection of sleep, stress, energy, and body systems. 
                Explore each layer to discover personalized insights and improvement opportunities.
              </p>
            </div>
          </header>

          {/* Chart Area */}
          <div className="flex-1 px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center">
            <div className={`transition-all duration-1000 ease-out transform ${
              expansionPhase === 'entering' ? 'scale-75 opacity-60' : 'scale-100 opacity-100'
            }`}>
              <LayeredRadarChart
                responses={responses}
                showPotential={showPotential}
                visibleLayers={visibleLayers}
                visiblePotentials={visiblePotentials}
                size="fullscreen"
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Key Card and Insights */}
        <aside className="w-full lg:w-96 p-6 lg:p-8 flex flex-col">
          {/* Key Card */}
          <div className="backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/30 mb-8" style={{backgroundColor: 'rgba(232, 230, 227, 0.4)'}}>
            <h3 className="text-lg font-medium text-[#3a3a3a] mb-6">Explore your signal</h3>
            
            {/* Header row with column labels */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#3a3a3a]/10">
              <div className="w-16"></div> {/* Spacer for category names */}
              <div className="flex-1 text-center">
                <span className="text-sm font-medium text-[#3a3a3a]/60">Your Reality</span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm font-medium text-[#3a3a3a]/60">Your Potential</span>
              </div>
            </div>

            {/* Layer rows */}
            <div className="space-y-4">
              {[
                { id: 'sleep', name: 'Sleep', color: '#B6985A' },
                { id: 'stress', name: 'Stress', color: '#E39684' },
                { id: 'energy', name: 'Energy', color: '#8A6FA3' },
                { id: 'bodySystems', name: 'Body', color: '#4B6FA8' }
              ].map((layer) => (
                <div key={layer.id} className="flex items-center justify-between gap-4">
                  {/* Category name */}
                  <div className="w-16 text-sm font-normal text-[#3a3a3a]">
                    {layer.name}
                  </div>
                  
                  {/* Your Reality column - solid colored bar with eye icon */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <div 
                      className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <button
                      onClick={() => toggleLayer(layer.id as keyof typeof visibleLayers)}
                      className={`p-1 rounded-md transition-all duration-200 ${
                        visibleLayers[layer.id as keyof typeof visibleLayers]
                          ? 'text-[#3a3a3a] hover:bg-white/30'
                          : 'text-[#3a3a3a]/40 hover:bg-white/20'
                      }`}
                      title={`${visibleLayers[layer.id as keyof typeof visibleLayers] ? 'Hide' : 'Show'} ${layer.name}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Your Potential column - dotted line with eye icon */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <div 
                      className="h-1.5 flex-1 border-t-2 border-dotted"
                      style={{ borderColor: layer.color }}
                    />
                    <button
                      onClick={() => toggleLayerPotential(layer.id as keyof typeof visiblePotentials)}
                      disabled={!visibleLayers[layer.id as keyof typeof visibleLayers]}
                      className={`p-1 rounded-md transition-all duration-200 ${
                        !visibleLayers[layer.id as keyof typeof visibleLayers]
                          ? 'text-[#3a3a3a]/20 cursor-not-allowed'
                          : visiblePotentials[layer.id as keyof typeof visiblePotentials]
                            ? 'text-[#3a3a3a] hover:bg-white/30'
                            : 'text-[#3a3a3a]/40 hover:bg-white/20'
                      }`}
                      title={`${visiblePotentials[layer.id as keyof typeof visiblePotentials] ? 'Hide' : 'Show'} potential for ${layer.name}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle controls at bottom */}
            <div className="mt-8 space-y-3">
              {/* Hide/Show Your Reality */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3a3a3a]">Hide/Show Your Reality</span>
                <button
                  onClick={() => {
                    const allVisible = Object.values(visibleLayers).every(Boolean);
                    if (allVisible) {
                      setVisibleLayers({ sleep: false, stress: false, energy: false, bodySystems: false });
                    } else {
                      setVisibleLayers({ sleep: true, stress: true, energy: true, bodySystems: true });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    Object.values(visibleLayers).some(Boolean)
                      ? 'bg-[#AE7401]'
                      : 'bg-[#D4D4D8]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      Object.values(visibleLayers).some(Boolean) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Hide/Show Your Potential */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#3a3a3a]">Hide/Show Your Potential</span>
                <button
                  onClick={() => {
                    const anyVisible = Object.values(visiblePotentials).some(Boolean);
                    if (anyVisible) {
                      setVisiblePotentials({ sleep: false, stress: false, energy: false, bodySystems: false });
                    } else {
                      setVisiblePotentials({ sleep: true, stress: true, energy: true, bodySystems: true });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    Object.values(visiblePotentials).some(Boolean)
                      ? 'bg-[#AE7401]'
                      : 'bg-[#D4D4D8]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      Object.values(visiblePotentials).some(Boolean) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Key Insights Below Key */}
          <div className="flex-1">
            <div className="rounded-2xl px-6 lg:px-8 pt-2 lg:pt-3 pb-6 lg:pb-8">
              {/* Dynamic Insights */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#3a3a3a] mb-4">
                  {activeLayer ? `${activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)} Insights` : 'Key Insights'}
                </h3>
                
                <div className="space-y-3">
                  {activeLayer ? (
                    <div>
                      <p className="text-sm text-[#3a3a3a] leading-relaxed">
                        {generateLayerStory(activeLayer)}
                      </p>
                    </div>
                  ) : (
                    analysis && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-[#3a3a3a] mb-2 flex items-center">
                            Top Strengths
                          </h4>
                          <div className="space-y-1">
                            {[...analysis.sleep.strengths, ...analysis.stress.strengths, ...analysis.energy.strengths, ...analysis.bodySystems.strengths]
                              .slice(0, 3)
                              .map((strength, index) => (
                                <div key={index} className="text-xs text-[#3a3a3a]/70">• {strength}</div>
                              ))
                            }
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-[#3a3a3a] mb-2 flex items-center">
                            Growth Opportunities
                          </h4>
                          <div className="space-y-1">
                            {[...analysis.sleep.concerns, ...analysis.stress.concerns, ...analysis.energy.concerns, ...analysis.bodySystems.concerns]
                              .slice(0, 3)
                              .map((concern, index) => (
                                <div key={index} className="text-xs text-[#3a3a3a]/70">• {concern}</div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/report')}
                  className="w-full px-4 py-2 bg-[#d95e40] hover:bg-[#d95e40]/90 text-white rounded-full font-normal transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.01]"
                >
                  Generate Full Report
                </button>
                
                <button
                  onClick={() => window.location.href = '/assessment'}
                  className="w-full px-4 py-2 bg-transparent hover:bg-[#3a3a3a]/5 text-[#3a3a3a] border border-[#3a3a3a] hover:border-[#3a3a3a] rounded-full font-normal transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Retake Assessment
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
