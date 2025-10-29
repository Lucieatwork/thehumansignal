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
import {
  generateReportExecutiveSummary,
  generateReportSectionAnalysis,
  generateReportRecommendations
} from '../lib/client';
import {
  generateReportPDF,
  generateReportImage,
  shareReportLink,
  printReport
} from '../lib/pdf';

// Report page showing comprehensive personalized health report
export default function Report() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [analyses, setAnalyses] = useState<any>(null);
  const [overallScore, setOverallScore] = useState<number>(0);
  
  // Content state
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [sectionAnalyses, setSectionAnalyses] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // UI state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [visibleRecommendations, setVisibleRecommendations] = useState(8);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());
  const [expandedCardSections, setExpandedCardSections] = useState<Set<string>>(new Set());
  const [reportDate, setReportDate] = useState<string>('');
  const [reportTime, setReportTime] = useState<string>('');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [carouselItemsPerView, setCarouselItemsPerView] = useState(2);
  
  // Set report dates on client side only (avoid hydration error)
  useEffect(() => {
    const now = new Date();
    setReportDate(formatDate(now));
    setReportTime(now.toLocaleString());
  }, []);
  
  // Load assessment data and calculate scores
  useEffect(() => {
    const savedResponses = localStorage.getItem('humanSignalResponses');
    if (!savedResponses) {
      router.push('/findings');
      return;
    }
    
    const parsedResponses = JSON.parse(savedResponses);
    setResponses(parsedResponses);
    
    // Calculate analyses
    const sleepAnalysis = analyzeSleepResponses(parsedResponses);
    const stressAnalysis = analyzeStressResponses(parsedResponses);
    const energyAnalysis = analyzeEnergyResponses({
      energy_peak_time: parsedResponses.energy_peak_time,
      energy_consistency: parsedResponses.energy_consistency,
      weekly_energy_pattern: parsedResponses.weekly_energy_pattern,
      energy_crash_frequency: parsedResponses.energy_crash_frequency,
      recovery_time: parsedResponses.recovery_time
    });
    const bodySystemsAnalysis = analyzeBodySystemsResponses(parsedResponses);
    
    const calculatedAnalyses = {
      sleep: sleepAnalysis,
      stress: stressAnalysis,
      energy: energyAnalysis,
      bodySystems: bodySystemsAnalysis
    };
    
    setAnalyses(calculatedAnalyses);
    
    const calculatedScore = Math.round((
      sleepAnalysis.overallScore + 
      stressAnalysis.overallScore + 
      energyAnalysis.overallScore + 
      bodySystemsAnalysis.overallScore
    ) / 4);
    
    setOverallScore(calculatedScore);
    
    // Generate AI content
    generateContent(calculatedAnalyses, parsedResponses);
  }, [router]);
  
  const generateContent = async (calculatedAnalyses: any, parsedResponses: Record<string, any>) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(10);
      
      // Prepare assessment data for AI
      const assessmentData = {
        sleep: { responses: parsedResponses, analysis: calculatedAnalyses.sleep },
        stress: { responses: parsedResponses, analysis: calculatedAnalyses.stress },
        energy: { responses: parsedResponses, analysis: calculatedAnalyses.energy },
        body: { responses: parsedResponses, analysis: calculatedAnalyses.bodySystems }
      };
      
      // Generate executive summary (20-30%)
      setGenerationProgress(20);
      const summaryResult = await generateReportExecutiveSummary(assessmentData, calculatedAnalyses);
      setExecutiveSummary(summaryResult.text || summaryResult);
      setGenerationProgress(30);
      
      // Generate section analyses (30-60%)
      const sectionPromises = [
        generateReportSectionAnalysis('sleep', assessmentData, calculatedAnalyses.sleep).then(result => ({
          key: 'sleep',
          text: result.text || result
        })),
        generateReportSectionAnalysis('stress', assessmentData, calculatedAnalyses.stress).then(result => ({
          key: 'stress',
          text: result.text || result
        })),
        generateReportSectionAnalysis('energy', assessmentData, calculatedAnalyses.energy).then(result => ({
          key: 'energy',
          text: result.text || result
        })),
        generateReportSectionAnalysis('bodySystems', assessmentData, calculatedAnalyses.bodySystems).then(result => ({
          key: 'bodySystems',
          text: result.text || result
        }))
      ];
      
      const sectionResults = await Promise.all(sectionPromises);
      const sectionMap: Record<string, string> = {};
      sectionResults.forEach((result, index) => {
        sectionMap[result.key] = result.text;
        setGenerationProgress(30 + (index + 1) * 7.5); // 30, 37.5, 45, 52.5
      });
      setSectionAnalyses(sectionMap);
      
      // Generate recommendations (60-100%)
      setGenerationProgress(60);
      const recommendationsResult = await generateReportRecommendations(assessmentData, calculatedAnalyses);
      const recs = recommendationsResult.recommendations || recommendationsResult || [];
      
      // Calculate priorities for recommendations
      const prioritizedRecs = recs.map((rec: any) => {
        const sectionScore = rec.relatedScore || 70;
        const scoreImpact = (100 - sectionScore) * 0.4;
        const urgency = rec.priorityScore || 50;
        const urgencyMultiplier = urgency / 100 * 0.3;
        const overallDeficiency = overallScore < 50 ? 0.3 : 0;
        
        const priorityScore = (scoreImpact + urgencyMultiplier + overallDeficiency) * 100;
        
        let priority: 'high' | 'moderate' | 'ongoing' = 'moderate';
        if (priorityScore > 70) priority = 'high';
        else if (priorityScore < 40) priority = 'ongoing';
        
        return {
          ...rec,
          priority,
          priorityScore
        };
      });
      
      // Sort by priority score
      prioritizedRecs.sort((a: any, b: any) => b.priorityScore - a.priorityScore);
      
      setRecommendations(prioritizedRecs);
      setGenerationProgress(100);
      
      // Fade out progress indicator after brief delay
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
      
    } catch (error) {
      console.error('Error generating report content:', error);
      setIsGenerating(false);
      // Set fallback content
      setExecutiveSummary("Your Human Signal reflects your unique health patterns across four key dimensions. Review each section below to understand your personalized insights and recommendations.");
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };
  
  const toggleRecommendation = (id: string) => {
    setExpandedRecommendations(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const toggleCardSection = (cardId: string, sectionId: string) => {
    const key = `${cardId}-${sectionId}`;
    setExpandedCardSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  
  const handleShowMore = () => {
    setVisibleRecommendations(prev => prev + 4);
  };
  
  const handleCarouselNext = () => {
    const maxIndex = Math.max(0, Math.ceil(visibleRecs.length / carouselItemsPerView) - 1);
    setCurrentCarouselIndex(prev => Math.min(prev + 1, maxIndex));
  };
  
  const handleCarouselPrev = () => {
    setCurrentCarouselIndex(prev => Math.max(prev - 1, 0));
  };
  
  const handleCarouselDot = (index: number) => {
    setCurrentCarouselIndex(index);
  };
  
  // Update carousel items per view based on screen size
  useEffect(() => {
    const updateCarouselItems = () => {
      if (window.innerWidth < 640) {
        // Mobile: 1 card at a time
        setCarouselItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        // Tablet: 1 card at a time for better readability
        setCarouselItemsPerView(1);
      } else {
        // Desktop: 2 cards at a time
        setCarouselItemsPerView(2);
      }
    };
    
    updateCarouselItems();
    window.addEventListener('resize', updateCarouselItems);
    return () => window.removeEventListener('resize', updateCarouselItems);
  }, []);
  
  // Reset carousel when recommendations change
  useEffect(() => {
    setCurrentCarouselIndex(0);
  }, [recommendations.length, visibleRecommendations]);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4b6fa8'; // Indigo
    if (score >= 65) return '#7a8cc4'; // Periwinkle
    if (score >= 45) return '#8a6fa3'; // Violet
    return '#d95e40'; // Red-Orange
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Needs Attention';
  };
  
  const sectionConfig = [
    { id: 'sleep', name: 'Sleep Rhythms', color: '#4b6fa8', analysis: analyses?.sleep },
    { id: 'stress', name: 'Stress Patterns', color: '#7a8cc4', analysis: analyses?.stress },
    { id: 'energy', name: 'Energy Cycles', color: '#8a6fa3', analysis: analyses?.energy },
    { id: 'bodySystems', name: 'Body Systems', color: '#d95e40', analysis: analyses?.bodySystems }
  ];
  
  const needsMedicalReferral = analyses && (
    analyses.sleep.overallScore < 50 ||
    analyses.stress.overallScore < 50 ||
    analyses.energy.overallScore < 50 ||
    analyses.bodySystems.overallScore < 50
  );
  
  const medicalConcerns = analyses ? [
    analyses.sleep.overallScore < 50 && { dimension: 'Sleep Rhythms', score: analyses.sleep.overallScore, concerns: analyses.sleep.concerns },
    analyses.stress.overallScore < 50 && { dimension: 'Stress Patterns', score: analyses.stress.overallScore, concerns: analyses.stress.concerns },
    analyses.energy.overallScore < 50 && { dimension: 'Energy Cycles', score: analyses.energy.overallScore, concerns: analyses.energy.concerns },
    analyses.bodySystems.overallScore < 50 && { dimension: 'Body Systems', score: analyses.bodySystems.overallScore, concerns: analyses.bodySystems.concerns }
  ].filter(Boolean) : [];
  
  const visibleRecs = recommendations.slice(0, visibleRecommendations);
  const highPriority = visibleRecs.filter((r: any) => r.priority === 'high');
  const moderatePriority = visibleRecs.filter((r: any) => r.priority === 'moderate');
  const ongoingPriority = visibleRecs.filter((r: any) => r.priority === 'ongoing');
  
  // Carousel calculations
  const totalCarouselPages = Math.ceil(visibleRecs.length / carouselItemsPerView);
  const currentPageItems = visibleRecs.slice(
    currentCarouselIndex * carouselItemsPerView,
    (currentCarouselIndex + 1) * carouselItemsPerView
  );
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="min-h-screen bg-[#f8f6f2] relative">
      {/* Progress Indicator */}
      {isGenerating && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#d95e40]/20 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4b6fa8] via-[#7a8cc4] to-[#d95e40] transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[#3a3a3a] min-w-[3rem] text-right">
                {generationProgress}%
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button
          onClick={() => router.push('/findings')}
          className="text-[#3a3a3a] hover:text-[#d95e40] transition-colors duration-200 flex items-center gap-2 group"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Findings</span>
        </button>
      </div>
      
      <main id="report-content" className="max-w-4xl mx-auto px-6 pb-16">
        {/* Hero Section */}
        <section className="mt-12 mb-16 text-center">
          <h1 className="text-5xl font-light tracking-wider text-[#3a3a3a] mb-4">
            Your Human Signal Report
          </h1>
          <p className="text-[#3a3a3a]/70 mb-8">
            {reportDate ? `Generated on ${reportDate}` : 'Loading...'}
          </p>
          
          {/* Human Signal Chart */}
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-md aspect-square">
              <LayeredRadarChart 
                responses={responses}
                visibleLayers={{ sleep: true, stress: true, energy: true, bodySystems: true }}
                visiblePotentials={{ sleep: false, stress: false, energy: false, bodySystems: false }}
                size="large"
              />
            </div>
          </div>
          
          {/* Overall Score */}
          <div className="inline-block px-8 py-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm uppercase tracking-wider text-[#3a3a3a]/60 mb-2">
              Overall Score
            </div>
            <div className="text-4xl font-light mb-3" style={{ color: getScoreColor(overallScore) }}>
              {overallScore}
            </div>
            <div className="text-sm font-medium" style={{ color: getScoreColor(overallScore) }}>
              {getScoreLabel(overallScore)}
            </div>
            <div className="mt-3 w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${overallScore}%`,
                  backgroundColor: getScoreColor(overallScore)
                }}
              />
            </div>
          </div>
        </section>
        
        {/* Executive Summary */}
        {executiveSummary && (
          <section className="mb-16 fade-in">
            <h2 className="text-3xl font-light tracking-wide text-[#3a3a3a] mb-6">
              Understanding Your Signal
            </h2>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="prose prose-lg max-w-none text-[#3a3a3a] leading-relaxed whitespace-pre-line">
                {executiveSummary}
              </div>
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-[#4b6fa8] via-[#7a8cc4] to-[#8a6fa3] opacity-30" />
          </section>
        )}
        
        {/* Analysis Sections */}
        {sectionConfig.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const analysis = section.analysis;
          const sectionText = sectionAnalyses[section.id] || '';
          
          if (!analysis) return null;
          
          return (
            <section key={section.id} className="mb-12 fade-in">
                <div 
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md"
                onClick={() => toggleSection(section.id)}
              >
                {/* Header */}
                <div 
                  className="px-8 py-6 flex items-center justify-between"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-medium uppercase tracking-wider" style={{ color: section.color }}>
                      {section.name}
                    </h3>
                    <span className="text-lg font-light text-[#3a3a3a]">
                      {analysis.overallScore}%
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-[#3a3a3a] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Content */}
                <div className={`px-8 transition-all duration-300 overflow-hidden ${isExpanded ? 'pb-8 pt-4' : 'pb-0 pt-0 h-0'}`}>
                  {isExpanded && (
                    <div className="space-y-6">
                      {/* Chart */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-xs aspect-square">
                          <LayeredRadarChart 
                            responses={responses}
                            visibleLayers={{ 
                              sleep: section.id === 'sleep',
                              stress: section.id === 'stress',
                              energy: section.id === 'energy',
                              bodySystems: section.id === 'bodySystems'
                            }}
                            size="normal"
                          />
                        </div>
                      </div>
                      
                      {/* Analysis Text */}
                      {sectionText && (
                        <div className="prose max-w-none text-[#3a3a3a] leading-relaxed">
                          {sectionText}
                        </div>
                      )}
                      
                      {/* Strengths */}
                      {analysis.strengths && analysis.strengths.length > 0 && (
                        <div>
                          <h4 className="font-medium text-[#3a3a3a] mb-3">Strengths</h4>
                          <ul className="space-y-2">
                            {analysis.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-[#3a3a3a]">
                                <span className="text-green-600 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Concerns */}
                      {analysis.concerns && analysis.concerns.length > 0 && (
                        <div>
                          <h4 className="font-medium text-[#3a3a3a] mb-3">Areas for Attention</h4>
                          <ul className="space-y-2">
                            {analysis.concerns.map((concern: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-[#3a3a3a]">
                                <span className="text-[#d95e40] mt-1">•</span>
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Collapsed Preview */}
                {!isExpanded && (
                  <div className="px-8 py-4">
                    {sectionText && (
                      <p className="text-[#3a3a3a]/80 line-clamp-2">
                        {sectionText.substring(0, 150)}...
                      </p>
                    )}
                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <div className="mt-3 text-sm text-green-700">
                        {analysis.strengths.slice(0, 2).map((s: string, idx: number) => (
                          <div key={idx}>• {s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })}
        
        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="mb-16 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-light tracking-wide text-[#3a3a3a]">
                Your Personalized Recommendations
              </h2>
              <div className="text-sm text-[#3a3a3a]/60">
                Showing {Math.min(visibleRecommendations, recommendations.length)} of {recommendations.length}
              </div>
            </div>
            
            {/* Score Improvement Preview */}
            <div className="mb-8 p-6 bg-gradient-to-r from-[#4b6fa8]/5 via-[#7a8cc4]/5 to-[#8a6fa3]/5 rounded-lg border border-[#4b6fa8]/20">
              <h3 className="text-lg font-medium text-[#3a3a3a] mb-4">Potential Score Improvements</h3>
              <p className="text-sm text-[#3a3a3a]/70 mb-4">
                Following these recommendations could improve your Human Signal scores across all dimensions:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-light text-[#4b6fa8] mb-1">
                    {analyses ? Math.min(100, analyses.sleep.overallScore + 8) : 0}
                  </div>
                  <div className="text-xs text-[#3a3a3a]/60 uppercase tracking-wide">Sleep</div>
                  <div className="text-xs text-green-600">+8 points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-[#7a8cc4] mb-1">
                    {analyses ? Math.min(100, analyses.stress.overallScore + 6) : 0}
                  </div>
                  <div className="text-xs text-[#3a3a3a]/60 uppercase tracking-wide">Stress</div>
                  <div className="text-xs text-green-600">+6 points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-[#8a6fa3] mb-1">
                    {analyses ? Math.min(100, analyses.energy.overallScore + 7) : 0}
                  </div>
                  <div className="text-xs text-[#3a3a3a]/60 uppercase tracking-wide">Energy</div>
                  <div className="text-xs text-green-600">+7 points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-[#d95e40] mb-1">
                    {analyses ? Math.min(100, analyses.bodySystems.overallScore + 4) : 0}
                  </div>
                  <div className="text-xs text-[#3a3a3a]/60 uppercase tracking-wide">Body</div>
                  <div className="text-xs text-green-600">+4 points</div>
                </div>
              </div>
            </div>
            
            {/* Recommendations Carousel */}
            <div className="relative">
              {/* Carousel Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-[#3a3a3a] uppercase tracking-wide">
                  Recommendations ({visibleRecs.length} of {recommendations.length})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#3a3a3a]/60">
                    Page {currentCarouselIndex + 1} of {totalCarouselPages}
                  </span>
                </div>
              </div>
              
              {/* Carousel Container */}
              <div className="relative overflow-hidden rounded-lg w-full touch-pan-x">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ 
                    transform: `translateX(-${currentCarouselIndex * 100}%)`,
                  }}
                  onTouchStart={(e) => {
                    const startX = e.touches[0].clientX;
                    const startY = e.touches[0].clientY;
                    let isScrolling = false;
                    
                    const handleTouchMove = (e: TouchEvent) => {
                      const currentX = e.touches[0].clientX;
                      const currentY = e.touches[0].clientY;
                      const diffX = startX - currentX;
                      const diffY = startY - currentY;
                      
                      // Determine if this is a horizontal swipe (not vertical scroll)
                      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                        isScrolling = true;
                        e.preventDefault(); // Prevent vertical scroll during horizontal swipe
                      }
                      
                      // Only trigger carousel navigation for horizontal swipes
                      if (isScrolling && Math.abs(diffX) > 50) {
                        if (diffX > 0) {
                          handleCarouselNext();
                        } else {
                          handleCarouselPrev();
                        }
                        document.removeEventListener('touchend', handleTouchEnd);
                        document.removeEventListener('touchmove', handleTouchMove);
                      }
                    };
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchend', handleTouchEnd);
                      document.removeEventListener('touchmove', handleTouchMove);
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  {Array.from({ length: totalCarouselPages }).map((_, pageIndex) => {
                    const pageRecs = visibleRecs.slice(
                      pageIndex * carouselItemsPerView, 
                      (pageIndex + 1) * carouselItemsPerView
                    );
                    
                    return (
                      <div 
                        key={pageIndex}
                        className="flex-shrink-0 w-full"
                        style={{ 
                          minWidth: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                        <div className="flex" style={{ width: '100%', gap: '24px' }}>
                          {pageRecs.map((rec: any) => (
                            <div 
                              key={rec.id} 
                              className="flex-shrink-0" 
                              style={{ 
                                width: carouselItemsPerView === 1 ? '100%' : `calc(50% - 12px)`,
                                height: expandedRecommendations.has(rec.id) ? 'auto' : '400px'
                              }}
                            >
                              <RecommendationCard
                                recommendation={rec}
                                isExpanded={expandedRecommendations.has(rec.id)}
                                onToggle={() => toggleRecommendation(rec.id)}
                                expandedCardSections={expandedCardSections}
                                onToggleCardSection={toggleCardSection}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Carousel Navigation */}
              <div className="flex items-center justify-between mt-6">
                {/* Previous Button - Hidden on mobile */}
                <button
                  onClick={handleCarouselPrev}
                  disabled={currentCarouselIndex === 0}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentCarouselIndex === 0
                      ? 'text-[#3a3a3a]/30 cursor-not-allowed'
                      : 'text-[#3a3a3a] hover:bg-[#3a3a3a]/5 hover:scale-105 active:scale-95'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalCarouselPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleCarouselDot(index)}
                      className={`w-3 h-3 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                        index === currentCarouselIndex
                          ? 'bg-[#d95e40] scale-125'
                          : 'bg-[#3a3a3a]/30 hover:bg-[#3a3a3a]/50'
                      }`}
                    />
                  ))}
                  {totalCarouselPages > 1 && (
                    <span className="text-xs text-[#3a3a3a]/60 ml-2 hidden sm:block">
                      Swipe or use arrows to see all {visibleRecs.length} recommendations
                    </span>
                  )}
                  {totalCarouselPages > 1 && (
                    <span className="text-xs text-[#3a3a3a]/60 ml-2 block sm:hidden">
                      Swipe to see all {visibleRecs.length} recommendations
                    </span>
                  )}
                </div>
                
                {/* Next Button - Hidden on mobile */}
                <button
                  onClick={handleCarouselNext}
                  disabled={currentCarouselIndex === totalCarouselPages - 1}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentCarouselIndex === totalCarouselPages - 1
                      ? 'text-[#3a3a3a]/30 cursor-not-allowed'
                      : 'text-[#3a3a3a] hover:bg-[#3a3a3a]/5 hover:scale-105 active:scale-95'
                  }`}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Show More Button */}
            {visibleRecommendations < recommendations.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="px-8 py-3 bg-[#d95e40] text-white rounded-lg font-medium hover:bg-[#d95e40]/90 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Show 4 More ({recommendations.length - visibleRecommendations} remaining)
                </button>
              </div>
            )}
          </section>
        )}
        
        {/* Medical Referral */}
        {needsMedicalReferral && medicalConcerns.length > 0 && (
          <section className="mb-16 fade-in">
            <div className="border-2 border-[#d95e40]/30 rounded-lg p-8 bg-white shadow-sm">
              <h2 className="text-2xl font-light tracking-wide text-[#3a3a3a] mb-4">
                Healthcare Provider Consultation Recommended
              </h2>
              <p className="text-[#3a3a3a] mb-6">
                Based on your assessment, we recommend consulting with a healthcare provider about:
              </p>
              <ul className="space-y-4 mb-6">
                {medicalConcerns.map((concern: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#d95e40] mt-1">•</span>
                    <div>
                      <div className="font-medium text-[#3a3a3a]">{concern.dimension}</div>
                      {concern.concerns && concern.concerns.length > 0 && (
                        <div className="text-sm text-[#3a3a3a]/70 mt-1">
                          {concern.concerns.join(', ')}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <button className="px-6 py-3 bg-[#d95e40] text-white rounded-lg font-medium hover:bg-[#d95e40]/90 transition-colors duration-200">
                Find a Healthcare Provider
              </button>
              <p className="text-xs text-[#3a3a3a]/60 mt-4">
                Note: This report is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </section>
        )}
        
        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-[#3a3a3a]/10">
          <div className="text-center space-y-4">
            <div className="text-sm text-[#3a3a3a]/60">
              <div>Assessment Date: {reportDate || 'Loading...'}</div>
              <div className="mt-1">Report Generated: {reportTime || 'Loading...'}</div>
            </div>
            <p className="text-sm text-[#3a3a3a]/80">
              Your Human Signal reflects your responses to 22 questions across 4 health dimensions.
            </p>
            <div className="pt-6 space-y-4">
              <div className="text-xl font-light tracking-wide text-[#3a3a3a]">
                Human Signal
              </div>
              <div className="text-sm text-[#3a3a3a]/60 italic">
                Personal patterns, clearly visualized.
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <button 
                onClick={printReport}
                className="px-6 py-2 border border-[#d95e40] text-[#d95e40] rounded-lg font-medium hover:bg-[#d95e40] hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Print Report
              </button>
              <button 
                onClick={shareReportLink}
                className="px-6 py-2 border border-[#3a3a3a]/30 text-[#3a3a3a] rounded-lg font-medium hover:bg-[#3a3a3a]/5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Share Link
              </button>
            </div>
          </div>
        </footer>
      </main>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          #report-content {
            max-width: 100%;
          }
          button, #pdf-loading {
            display: none !important;
          }
          section {
            page-break-inside: avoid;
          }
          .bg-white {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ recommendation, isExpanded, onToggle, expandedCardSections, onToggleCardSection }: any) {
  const categoryLabels: Record<string, string> = {
    otc: 'OTC Remedies',
    exercise: 'Exercise',
    diet: 'Diet',
    meditation: 'Meditation',
    wellness: 'Wellness',
    medical: 'Medical'
  };
  
  const priorityColors: Record<string, string> = {
    high: '#d95e40',
    moderate: '#8a6fa3',
    ongoing: '#7a8cc4'
  };
  
  const categoryPatterns: Record<string, string> = {
    otc: 'Geometric capsule pattern',
    exercise: 'Geometric movement pattern',
    diet: 'Geometric plate pattern',
    meditation: 'Geometric wave pattern',
    wellness: 'Geometric leaf pattern',
    medical: 'Geometric cross pattern'
  };
  
  const isSectionExpanded = (sectionId: string) => {
    return expandedCardSections.has(`${recommendation.id}-${sectionId}`);
  };
  
  const toggleSection = (sectionId: string) => {
    onToggleCardSection(recommendation.id, sectionId);
  };
  
  // Collapsible Section Component
  const CollapsibleSection = ({ sectionId, title, children, maxHeight = '120px', isExpanded: forceExpanded }: any) => {
    const isExpanded = forceExpanded !== undefined ? forceExpanded : isSectionExpanded(sectionId);
    
    return (
      <div className="mb-4">
        <div className="mb-2">
          <div className="text-xs uppercase tracking-wide text-[#3a3a3a]/60 font-medium">
            {title}
          </div>
        </div>
        
        <div className="relative">
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-[120px]'
            }`}
            style={{ 
              maxHeight: isExpanded ? 'none' : maxHeight,
              maskImage: isExpanded ? 'none' : 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              WebkitMaskImage: isExpanded ? 'none' : 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)'
            }}
          >
            {children}
          </div>
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col ${isExpanded ? 'ring-2 ring-[#d95e40]/20' : ''}`}
      style={{ height: '100%', minHeight: '100%' }}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[recommendation.priority] }} />
          <span className="text-xs uppercase tracking-wider text-[#3a3a3a]/60 font-medium">
            {categoryLabels[recommendation.category] || recommendation.category}
          </span>
        </div>
        <span 
          className="text-xs px-2 py-1 rounded font-medium"
          style={{ 
            backgroundColor: `${priorityColors[recommendation.priority]}15`,
            color: priorityColors[recommendation.priority]
          }}
        >
          {recommendation.priority.toUpperCase()}
        </span>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-1 overflow-hidden">
        <h4 className="text-lg font-semibold uppercase tracking-wide text-[#3a3a3a] mb-3">
          {recommendation.title}
        </h4>
        
        {/* Short Summary */}
        <p className="text-sm text-[#3a3a3a]/70 mb-4 line-clamp-2">
          {recommendation.summary.length > 120 ? recommendation.summary.substring(0, 120) + '...' : recommendation.summary}
        </p>
        
        {/* Treatment Details - Collapsible */}
        {(recommendation.dosage || recommendation.frequency || recommendation.timing) && (
          <CollapsibleSection 
            sectionId="treatment" 
            title="Treatment" 
            maxHeight="100px"
            isExpanded={isExpanded}
          >
            <div className="p-4 bg-[#f8f6f2] rounded-lg border border-[#3a3a3a]/10">
              <ul className="space-y-2 text-sm text-[#3a3a3a]">
                {recommendation.dosage && (
                  <li className="flex items-start gap-2">
                    <span className="font-medium min-w-[70px]">Dosage:</span>
                    <span>{recommendation.dosage}</span>
                  </li>
                )}
                {recommendation.frequency && (
                  <li className="flex items-start gap-2">
                    <span className="font-medium min-w-[70px]">Frequency:</span>
                    <span>{recommendation.frequency}</span>
                  </li>
                )}
                {recommendation.timing && (
                  <li className="flex items-start gap-2">
                    <span className="font-medium min-w-[70px]">Timing:</span>
                    <span>{recommendation.timing}</span>
                  </li>
                )}
                {recommendation.duration && (
                  <li className="flex items-start gap-2">
                    <span className="font-medium min-w-[70px]">Duration:</span>
                    <span>{recommendation.duration}</span>
                  </li>
                )}
              </ul>
            </div>
          </CollapsibleSection>
        )}
        
        {/* Score Improvement Preview - Always visible when card is expanded */}
        {recommendation.scoreImprovement && isExpanded && (
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide text-[#3a3a3a]/60 mb-2 font-medium">
              Potential Score Improvements
            </div>
            <div className="p-3 bg-[#f8f6f2] rounded-lg border border-[#3a3a3a]/10">
              <div className="flex gap-4 text-xs flex-wrap">
                {Object.entries(recommendation.scoreImprovement).map(([dimension, improvement]) => {
                  const colors = {
                    sleep: '#4b6fa8',
                    stress: '#7a8cc4', 
                    energy: '#8a6fa3',
                    bodySystems: '#d95e40'
                  };
                  const labels = {
                    sleep: 'Sleep',
                    stress: 'Stress',
                    energy: 'Energy', 
                    bodySystems: 'Body'
                  };
                  return (
                    <div key={dimension} className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: colors[dimension as keyof typeof colors] }}
                      />
                      <span className="text-[#3a3a3a]/70">{labels[dimension as keyof typeof labels]}:</span>
                      <span className="font-medium text-green-600">+{improvement}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fadeIn">
            {/* Brief Rationale */}
            <div>
              <div className="text-xs uppercase tracking-wide text-[#3a3a3a]/60 mb-2 font-medium">
                Why This Matters
              </div>
              <p className="text-sm text-[#3a3a3a]/70 leading-relaxed">
                {recommendation.rationale.length > 150 ? recommendation.rationale.substring(0, 150) + '...' : recommendation.rationale}
              </p>
            </div>
            
            {/* Considerations */}
            {recommendation.considerations && recommendation.considerations.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-[#3a3a3a]/60 mb-2 font-medium">
                  Important Notes
                </div>
                <ul className="space-y-1 text-sm text-[#3a3a3a]/70">
                  {recommendation.considerations.map((consideration: string, idx: number) => (
                    <li key={idx}>• {consideration}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Expected Benefits */}
            {recommendation.expectedBenefits && recommendation.expectedBenefits.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-[#3a3a3a]/60 mb-2 font-medium">
                  Expected Benefits
                </div>
                <ul className="space-y-1 text-sm text-[#3a3a3a]/70">
                  {recommendation.expectedBenefits.map((benefit: string, idx: number) => (
                    <li key={idx}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Action Button - Always at bottom */}
      <div className="px-6 pb-6">
        <button 
          className="w-full text-sm text-[#d95e40] hover:text-[#d95e40]/80 font-medium px-4 py-2 rounded-lg border border-[#d95e40]/30 hover:bg-[#d95e40]/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </div>
    </div>
  );
}

