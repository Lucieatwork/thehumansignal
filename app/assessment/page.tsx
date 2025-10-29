'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RadarChart from '../components/RadarChart';
import { 
  sleepQuestions, 
  getSleepQuestion, 
  getTotalSleepQuestions, 
  analyzeSleepResponses, 
  getSleepFollowUpQuestion, 
  getTotalFollowUpQuestions, 
  SleepAnalysis 
} from '../components/assessment/SleepRhythms';
import { 
  stressQuestions, 
  getStressQuestion, 
  getTotalStressQuestions,
  analyzeStressResponses,
  getStressFollowUpQuestion,
  getTotalStressFollowUpQuestions,
  StressAnalysis
} from '../components/assessment/StressPatterns';
import { energyQuestions, getEnergyQuestion, getTotalEnergyQuestions, analyzeEnergyResponses } from '../components/assessment/EnergyCycles';
import { 
  bodySystemsQuestions, 
  getBodySystemsQuestion, 
  getTotalBodySystemsQuestions, 
  analyzeBodySystemsResponses, 
  getBodySystemsFollowUpQuestion, 
  getTotalBodySystemsFollowUpQuestions,
  BodyAnalysis 
} from '../components/assessment/BodySystems';

// Assessment page implementing the Health Assessment System from PRD
function Assessment() {
  // Basic state management
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, number | string | string[]>>({
    sleep_duration: 7.5
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Enhanced sleep section state
  const [sleepSectionPhase, setSleepSectionPhase] = useState<'questions' | 'check_in' | 'follow_up'>('questions');
  const [sleepAnalysis, setSleepAnalysis] = useState<SleepAnalysis | null>(null);
  const [followUpQuestionIndex, setFollowUpQuestionIndex] = useState(0);

  // Enhanced stress section state
  const [stressSectionPhase, setStressSectionPhase] = useState<'questions' | 'check_in' | 'follow_up'>('questions');
  const [stressAnalysis, setStressAnalysis] = useState<StressAnalysis | null>(null);
  const [stressFollowUpQuestionIndex, setStressFollowUpQuestionIndex] = useState(0);

  // Enhanced energy section state
  const [energySectionPhase, setEnergySectionPhase] = useState<'questions' | 'summary'>('questions');
  const [energyAnalysis, setEnergyAnalysis] = useState<any>(null);

  // Enhanced body systems section state
  const [bodySystemsPhase, setBodySystemsPhase] = useState<'questions' | 'check_in' | 'follow_up'>('questions');
  const [bodySystemsAnalysis, setBodySystemsAnalysis] = useState<BodyAnalysis | null>(null);
  const [bodySystemsFollowUpQuestionIndex, setBodySystemsFollowUpQuestionIndex] = useState(0);

  // Animation states for the summary card
  const [animatedScore, setAnimatedScore] = useState(0);
  // Separate progress width states for each section
  const [sleepProgressWidth, setSleepProgressWidth] = useState(0);
  const [stressProgressWidth, setStressProgressWidth] = useState(0); 
  const [energyProgressWidth, setEnergyProgressWidth] = useState(0);
  const [bodySystemsProgressWidth, setBodySystemsProgressWidth] = useState(0);
  const [showStrengths, setShowStrengths] = useState(false);
  const [showConcerns, setShowConcerns] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  


  // Section configuration
  const sections = [
    { name: 'Sleep Rhythms', questions: getTotalSleepQuestions(), color: '#4b6fa8' },
    { name: 'Stress Patterns', questions: getTotalStressQuestions(), color: '#7a8cc4' },
    { name: 'Energy Cycles', questions: getTotalEnergyQuestions(), color: '#8a6fa3' },
    { name: 'Body Systems', questions: getTotalBodySystemsQuestions(), color: '#d95e40' }
  ];

  // Get search params to detect transition
  const searchParams = useSearchParams();

  // Transition states for coordinating with home page transition
  const [isFromHomeTransition, setIsFromHomeTransition] = useState(false);
  const [sidebarOpacity, setSidebarOpacity] = useState(1);
  const [mobileProgressOpacity, setMobileProgressOpacity] = useState(0); // Start hidden
  
  // Sidebar element states
  const [sidebarHeaderOpacity, setSidebarHeaderOpacity] = useState(0); // Start hidden
  const [sidebarIndicatorsOpacity, setSidebarIndicatorsOpacity] = useState(0); // Start hidden
  const [sidebarChartOpacity, setSidebarChartOpacity] = useState(0); // Start hidden
  
  // Individual main content element states
  const [mainContentContainerOpacity, setMainContentContainerOpacity] = useState(0); // Start hidden
  const [mainContentTransform, setMainContentTransform] = useState('translateX(50px)'); // Start offset
  const [sectionCounterOpacity, setSectionCounterOpacity] = useState(0); // Start hidden
  const [headingOpacity, setHeadingOpacity] = useState(0); // Start hidden
  const [questionContentOpacity, setQuestionContentOpacity] = useState(0); // Start hidden
  const [mobileChartOpacity, setMobileChartOpacity] = useState(1); // Start visible for cross-dissolve

  // Handle transition from home page
  useEffect(() => {
    const isTransitionFromHome = searchParams.get('transition') === 'true';
    
    if (isTransitionFromHome) {
      setIsFromHomeTransition(true);
      
      console.log('Starting transition animation'); // Debug log
      
      // Reset all states to hidden for transition
      setMobileProgressOpacity(0);
      setSidebarHeaderOpacity(0);
      setSidebarIndicatorsOpacity(0);
      setSidebarChartOpacity(0);
      setMainContentContainerOpacity(0);
      setMainContentTransform('translateX(50px)');
      setSectionCounterOpacity(0);
      setHeadingOpacity(0);
      setQuestionContentOpacity(0);
      setMobileChartOpacity(1);
      
      // Animation sequence with staggered timing
      
      // Step 1: Fade in mobile progress (300ms)
      const timeout1 = setTimeout(() => {
        setMobileProgressOpacity(1);
      }, 300);
      
      // Step 2: Sidebar elements fade in with stagger (400ms start)
      const timeout2 = setTimeout(() => {
        setSidebarHeaderOpacity(1);
      }, 400);
      
      const timeout3 = setTimeout(() => {
        setSidebarIndicatorsOpacity(1);
      }, 600);
      
      const timeout4 = setTimeout(() => {
        setSidebarChartOpacity(1);
        setMobileChartOpacity(0); // Cross-dissolve with sidebar chart
      }, 800);
      
      // Step 3: Main content container fades in and slides from right (1000ms)
      const timeout5 = setTimeout(() => {
        setMainContentContainerOpacity(1);
        setMainContentTransform('translateX(0)');
      }, 1000);
      
      // Step 4: Staggered main content elements (0.2s intervals starting at 1200ms)
      const timeout6 = setTimeout(() => {
        setSectionCounterOpacity(1);
      }, 1200);
      
      const timeout7 = setTimeout(() => {
        setHeadingOpacity(1);
      }, 1400);
      
      const timeout8 = setTimeout(() => {
        setQuestionContentOpacity(1);
      }, 1600);
      
      // Cleanup function to clear timeouts if component unmounts
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
        clearTimeout(timeout5);
        clearTimeout(timeout6);
        clearTimeout(timeout7);
        clearTimeout(timeout8);
      };
    } else if (!isTransitionFromHome) {
      // No transition - show everything immediately
      console.log('No transition - showing all elements immediately'); // Debug log
      
      setMobileProgressOpacity(1);
      setSidebarHeaderOpacity(1);
      setSidebarIndicatorsOpacity(1);
      setSidebarChartOpacity(1);
      setMainContentContainerOpacity(1);
      setMainContentTransform('translateX(0)');
      setSectionCounterOpacity(1);
      setHeadingOpacity(1);
      setQuestionContentOpacity(1);
      setMobileChartOpacity(1);
    }
  }, [searchParams]);

  // Sleep analysis computation
  const currentSleepAnalysis = useMemo(() => {
    if (currentSection === 0) {
      return analyzeSleepResponses(responses);
    }
    return null;
  }, [responses, currentSection]);

  // Stress analysis computation
  const currentStressAnalysis = useMemo(() => {
    if (currentSection === 1) {
      return analyzeStressResponses(responses);
    }
    return null;
  }, [responses, currentSection]);

  // Helper function to get score interpretation and styling using brand palette
  const getScoreDetails = (score: number, section: 'sleep' | 'stress' | 'energy' | 'body') => {
    const sectionConfig = {
      sleep: {
        excellent: { label: "Excellent Sleep Health", description: "You're maintaining great sleep habits" },
        good: { label: "Good Sleep Health", description: "Your sleep patterns are generally healthy" },
        fair: { label: "Fair Sleep Health", description: "There's room for improvement in your sleep" },
        needs_attention: { label: "Sleep Needs Attention", description: "Let's work on improving your sleep quality" }
      },
      stress: {
        excellent: { label: "Excellent Stress Management", description: "You're handling stress very effectively" },
        good: { label: "Good Stress Resilience", description: "You manage stress well with room for fine-tuning" },
        fair: { label: "Fair Stress Management", description: "There's room for improvement in managing stress" },
        needs_attention: { label: "Stress Needs Attention", description: "Let's work on building better stress management skills" }
      },
      energy: {
        excellent: { label: "Excellent Energy Management", description: "You're maintaining great energy patterns" },
        good: { label: "Good Energy Balance", description: "Your energy patterns are generally healthy" },
        fair: { label: "Fair Energy Management", description: "There's room for improvement in your energy cycles" },
        needs_attention: { label: "Energy Needs Attention", description: "Let's work on optimizing your energy patterns" }
      },
      body: {
        excellent: { label: "Excellent Physical Health", description: "You're maintaining great body awareness and care" },
        good: { label: "Good Physical Health", description: "Your body systems are generally functioning well" },
        fair: { label: "Fair Physical Health", description: "There's room for improvement in supporting your body" },
        needs_attention: { label: "Physical Health Needs Attention", description: "Let's work on supporting your body systems better" }
      }
    };

    const config = sectionConfig[section];
    let levelKey: keyof typeof config;

    if (score >= 80) {
      levelKey = 'excellent';
      return {
        label: config[levelKey].label,
        description: config[levelKey].description,
        colorClass: "text-[#4b6fa8]", // Using brand indigo
        bgGradient: "from-[#4b6fa8]/5 to-[#7a8cc4]/5", // Subtle brand gradients
        barGradient: "from-[#4b6fa8] to-[#7a8cc4]" // Brand indigo to periwinkle
      };
    } else if (score >= 65) {
      levelKey = 'good';
      return {
        label: config[levelKey].label,
        description: config[levelKey].description,
        colorClass: "text-[#7a8cc4]", // Using brand periwinkle
        bgGradient: "from-[#7a8cc4]/5 to-[#8a6fa3]/5", // Periwinkle to violet
        barGradient: "from-[#7a8cc4] to-[#8a6fa3]"
      };
    } else if (score >= 45) {
      levelKey = 'fair';
      return {
        label: config[levelKey].label,
        description: config[levelKey].description,
        colorClass: "text-[#8a6fa3]", // Using brand violet
        bgGradient: "from-[#8a6fa3]/5 to-[#d95e40]/5", // Violet to red-orange
        barGradient: "from-[#8a6fa3] to-[#d95e40]"
      };
    } else {
      levelKey = 'needs_attention';
      return {
        label: config[levelKey].label,
        description: config[levelKey].description,
        colorClass: "text-[#d95e40]", // Using brand red-orange
        bgGradient: "from-[#d95e40]/5 to-[#d95e40]/10", // Red-orange variations
        barGradient: "from-[#d95e40] to-[#d95e40]/80"
      };
    }
  };

  // Animation sequence for sleep check-in
  useEffect(() => {
    if (currentSection === 0 && sleepSectionPhase === 'check_in' && sleepAnalysis) {
      // Reset all animation states
      setAnimatedScore(0);
      setSleepProgressWidth(0);
      setShowStrengths(false);
      setShowConcerns(false);
      setShowFollowUp(false);
      setCardVisible(false);

      // Start animation sequence
      const timer1 = setTimeout(() => {
        setCardVisible(true);
      }, 100);
      
      const timer2 = setTimeout(() => {
        setSleepProgressWidth(sleepAnalysis.overallScore);
        
        // Animate score count-up
        let currentScore = 0;
        const targetScore = sleepAnalysis.overallScore;
        const increment = targetScore / 30; // 30 steps for smooth animation
        
        const scoreInterval = setInterval(() => {
          currentScore += increment;
          if (currentScore >= targetScore) {
            setAnimatedScore(targetScore);
            clearInterval(scoreInterval);
          } else {
            setAnimatedScore(Math.floor(currentScore));
          }
        }, 50);
      }, 500);

      const timer3 = setTimeout(() => setShowStrengths(true), 1200);
      const timer4 = setTimeout(() => setShowConcerns(true), 1600);
      const timer5 = setTimeout(() => setShowFollowUp(true), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [currentSection, sleepSectionPhase, sleepAnalysis]);

  // Animation sequence for stress check-in
  useEffect(() => {
    if (currentSection === 1 && stressSectionPhase === 'check_in' && stressAnalysis) {
      // Reset all animation states
      setAnimatedScore(0);
      setStressProgressWidth(0);
      setShowStrengths(false);
      setShowConcerns(false);
      setShowFollowUp(false);
      setCardVisible(false);

      // Start animation sequence
      const timer1 = setTimeout(() => {
        setCardVisible(true);
      }, 100);
      
      const timer2 = setTimeout(() => {
        setStressProgressWidth(stressAnalysis.overallScore);
        
        // Animate score count-up
        let currentScore = 0;
        const targetScore = stressAnalysis.overallScore;
        const increment = targetScore / 30; // 30 steps for smooth animation
        
        const scoreInterval = setInterval(() => {
          currentScore += increment;
          if (currentScore >= targetScore) {
            setAnimatedScore(targetScore);
            clearInterval(scoreInterval);
          } else {
            setAnimatedScore(Math.floor(currentScore));
          }
        }, 50);
      }, 500);

      const timer3 = setTimeout(() => setShowStrengths(true), 1200);
      const timer4 = setTimeout(() => setShowConcerns(true), 1600);
      const timer5 = setTimeout(() => setShowFollowUp(true), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [currentSection, stressSectionPhase, stressAnalysis]);


  // Animation sequence for energy summary
  useEffect(() => {
    if (currentSection === 2 && energySectionPhase === 'summary' && energyAnalysis) {
      
      // Reset all animation states
      setAnimatedScore(0);
      setEnergyProgressWidth(0);
      setShowStrengths(false);
      setShowConcerns(false);
      setCardVisible(false);

      // Start animation sequence
      const timer1 = setTimeout(() => {
        setCardVisible(true);
      }, 100);
      
      const timer2 = setTimeout(() => {
        setEnergyProgressWidth(energyAnalysis.overallScore);
        
        // Animate score count-up
        let currentScore = 0;
        const targetScore = energyAnalysis.overallScore;
        const increment = targetScore / 30; // 30 steps for smooth animation
        
        const scoreInterval = setInterval(() => {
          currentScore += increment;
          if (currentScore >= targetScore) {
            setAnimatedScore(targetScore);
            clearInterval(scoreInterval);
          } else {
            setAnimatedScore(Math.floor(currentScore));
          }
        }, 50);
      }, 500);

      const timer3 = setTimeout(() => setShowStrengths(true), 1200);
      const timer4 = setTimeout(() => setShowConcerns(true), 1600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [currentSection, energySectionPhase, energyAnalysis]);

  // Animation sequence for body systems summary
  useEffect(() => {
    if (currentSection === 3 && bodySystemsPhase === 'check_in') {
      // Use the same analysis function that the component uses
      const analysis = analyzeBodySystemsResponses(responses);
      const targetScore = analysis.overallScore;

      // Reset all animation states
      setAnimatedScore(0);
      setBodySystemsProgressWidth(0);
      setShowStrengths(false);
      setShowConcerns(false);
      setShowFollowUp(false);
      setCardVisible(false);

      // Start animation sequence
      const timer1 = setTimeout(() => {
        setCardVisible(true);
      }, 100);
      
      const timer2 = setTimeout(() => {
        setBodySystemsProgressWidth(targetScore);
        
        // Animate score count-up
        let currentScore = 0;
        const increment = targetScore / 30; // 30 steps for smooth animation
        
        const scoreInterval = setInterval(() => {
          currentScore += increment;
          if (currentScore >= targetScore) {
            setAnimatedScore(targetScore);
            clearInterval(scoreInterval);
          } else {
            setAnimatedScore(Math.floor(currentScore));
          }
        }, 50);
      }, 500);

      const timer3 = setTimeout(() => setShowStrengths(true), 1200);
      const timer4 = setTimeout(() => setShowConcerns(true), 1600);
      const timer5 = setTimeout(() => setShowFollowUp(true), 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [currentSection, bodySystemsPhase, responses]);

  // Get current question logic
  const getCurrentQuestion = () => {
    if (currentSection === 0) {
      if (sleepSectionPhase === 'questions') {
        return getSleepQuestion(currentQuestion);
      } else if (sleepSectionPhase === 'follow_up' && sleepAnalysis) {
        return getSleepFollowUpQuestion(sleepAnalysis, followUpQuestionIndex);
      }
      return null;
    } else if (currentSection === 1) {
      if (stressSectionPhase === 'questions') {
        return getStressQuestion(currentQuestion);
      } else if (stressSectionPhase === 'follow_up' && stressAnalysis) {
        return getStressFollowUpQuestion(stressAnalysis, stressFollowUpQuestionIndex);
      }
      return null;
    } else if (currentSection === 2) {
      return getEnergyQuestion(currentQuestion);
    } else if (currentSection === 3) {
      if (bodySystemsPhase === 'questions') {
        return getBodySystemsQuestion(currentQuestion);
      } else if (bodySystemsPhase === 'follow_up' && bodySystemsAnalysis) {
        return getBodySystemsFollowUpQuestion(bodySystemsAnalysis, bodySystemsFollowUpQuestionIndex);
      }
      return null;
    }
    return null;
  };

  const currentQuestionData = getCurrentQuestion();

  // Handle response changes
  const handleResponseChange = (questionId: string, value: number | string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle multi-select response changes
  const handleMultiSelectChange = (questionId: string, optionValue: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = (prev[questionId] as string[]) || [];
      if (checked) {
        // Add the option if it's not already selected
        if (!currentValues.includes(optionValue)) {
          return {
            ...prev,
            [questionId]: [...currentValues, optionValue]
          };
        }
      } else {
        // Remove the option if it's selected
        return {
          ...prev,
          [questionId]: currentValues.filter(value => value !== optionValue)
        };
      }
      return prev;
    });
  };

  // Navigation - Next button
  const handleNext = () => {
    // Ensure we scroll to the absolute top after content updates
    setTimeout(() => {
      // Double-ensure we get to the very top
      window.scrollTo(0, 0);  // Immediate scroll
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Smooth for visual feedback
      }, 50);
    }, 10);
    
    if (currentSection === 0) {
      if (sleepSectionPhase === 'questions') {
        const maxQuestions = sleepQuestions.length;
        if (currentQuestion < maxQuestions - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          const analysis = analyzeSleepResponses(responses);
          setSleepAnalysis(analysis);
          setSleepSectionPhase('check_in');
        }
      } else if (sleepSectionPhase === 'check_in') {
        if (currentSleepAnalysis?.needsFollowUp && currentSleepAnalysis.followUpQuestions.length > 0) {
          setSleepSectionPhase('follow_up');
          setFollowUpQuestionIndex(0);
        } else {
          setCurrentSection(1);
          setCurrentQuestion(0);
          // Don't reset sleep section phase - preserve where user left off
        }
      } else if (sleepSectionPhase === 'follow_up') {
        const totalFollowUps = currentSleepAnalysis ? getTotalFollowUpQuestions(currentSleepAnalysis) : 0;
        if (followUpQuestionIndex < totalFollowUps - 1) {
          setFollowUpQuestionIndex(prev => prev + 1);
        } else {
          setCurrentSection(1);
          setCurrentQuestion(0);
          // Don't reset sleep section state - preserve where user left off
        }
      }
    } else if (currentSection === 1) {
      // Stress Patterns section logic
      if (stressSectionPhase === 'questions') {
        const maxQuestions = sections[currentSection].questions;
        if (currentQuestion < maxQuestions - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          const analysis = analyzeStressResponses(responses);
          setStressAnalysis(analysis);
          setStressSectionPhase('check_in');
        }
      } else if (stressSectionPhase === 'check_in') {
        if (currentStressAnalysis?.needsFollowUp && currentStressAnalysis.followUpQuestions.length > 0) {
          setStressSectionPhase('follow_up');
          setStressFollowUpQuestionIndex(0);
        } else {
          setCurrentSection(2); // Move to Energy Cycles
          setCurrentQuestion(0);
          // Don't reset stress section state - preserve where user left off
        }
      } else if (stressSectionPhase === 'follow_up') {
        const totalFollowUps = currentStressAnalysis ? getTotalStressFollowUpQuestions(currentStressAnalysis) : 0;
        if (stressFollowUpQuestionIndex < totalFollowUps - 1) {
          setStressFollowUpQuestionIndex(prev => prev + 1);
        } else {
          setCurrentSection(2); // Move to Energy Cycles
          setCurrentQuestion(0);
          // Don't reset stress section state - preserve where user left off
        }
      }
    } else if (currentSection === 2) {
      // Energy Cycles section logic
      if (energySectionPhase === 'questions') {
        const maxQuestions = sections[currentSection].questions;
        if (currentQuestion < maxQuestions - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          // Create energy analysis
          const analysis = analyzeEnergyResponses({
            energy_peak_time: responses.energy_peak_time as string,
            energy_consistency: responses.energy_consistency as number,
            weekly_energy_pattern: responses.weekly_energy_pattern as string,
            energy_crash_frequency: responses.energy_crash_frequency as number,
            recovery_time: responses.recovery_time as string
          });
          setEnergyAnalysis(analysis);
          setEnergySectionPhase('summary');
        }
      } else if (energySectionPhase === 'summary') {
        setCurrentSection(3); // Move to Body Systems
        setCurrentQuestion(0);
        // Don't reset energy section state - preserve where user left off
      }
    } else if (currentSection === 3) {
      // Body Systems section logic
      if (bodySystemsPhase === 'questions') {
        const maxQuestions = sections[currentSection].questions;
        if (currentQuestion < maxQuestions - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          const analysis = analyzeBodySystemsResponses(responses);
          setBodySystemsAnalysis(analysis);
          setBodySystemsPhase('check_in');
        }
      } else if (bodySystemsPhase === 'check_in') {
        if (bodySystemsAnalysis?.needsFollowUp && bodySystemsAnalysis.followUpQuestions.length > 0) {
          setBodySystemsPhase('follow_up');
          setBodySystemsFollowUpQuestionIndex(0);
        } else {
          // At the end of the assessment - redirect to findings page
          // Save responses and navigate to comprehensive analysis
          localStorage.setItem('humanSignalResponses', JSON.stringify(responses));
          window.location.href = '/findings';
          return;
        }
      } else if (bodySystemsPhase === 'follow_up') {
        const totalFollowUps = bodySystemsAnalysis ? getTotalBodySystemsFollowUpQuestions(bodySystemsAnalysis) : 0;
        if (bodySystemsFollowUpQuestionIndex < totalFollowUps - 1) {
          setBodySystemsFollowUpQuestionIndex(prev => prev + 1);
        } else {
          // At the end of the assessment - redirect to findings page
          // Save responses and navigate to comprehensive analysis
          localStorage.setItem('humanSignalResponses', JSON.stringify(responses));
          window.location.href = '/findings';
          return;
        }
      }
    } else {
      const maxQuestions = sections[currentSection].questions;
      if (currentQuestion < maxQuestions - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        setCurrentQuestion(0);
      }
    }
  };

  // Navigation - Previous button
  const handlePrevious = () => {
    // Ensure we scroll to the absolute top after content updates
    setTimeout(() => {
      // Double-ensure we get to the very top
      window.scrollTo(0, 0);  // Immediate scroll
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Smooth for visual feedback
      }, 50);
    }, 10);
    
    if (currentSection === 0) {
      if (sleepSectionPhase === 'questions') {
        if (currentQuestion > 0) {
          setCurrentQuestion(prev => prev - 1);
        }
      } else if (sleepSectionPhase === 'check_in') {
        setSleepSectionPhase('questions');
        setCurrentQuestion(sleepQuestions.length - 1);
      } else if (sleepSectionPhase === 'follow_up') {
        if (followUpQuestionIndex > 0) {
          setFollowUpQuestionIndex(prev => prev - 1);
        } else {
          setSleepSectionPhase('check_in');
        }
      }
    } else if (currentSection === 1) {
      // Stress Patterns section logic
      if (stressSectionPhase === 'questions') {
        if (currentQuestion > 0) {
          setCurrentQuestion(prev => prev - 1);
        } else {
          // Go back to Sleep section - state is preserved, so just switch sections
          setCurrentSection(0);
        }
      } else if (stressSectionPhase === 'check_in') {
        setStressSectionPhase('questions');
        setCurrentQuestion(stressQuestions.length - 1);
      } else if (stressSectionPhase === 'follow_up') {
        if (stressFollowUpQuestionIndex > 0) {
          setStressFollowUpQuestionIndex(prev => prev - 1);
        } else {
          setStressSectionPhase('check_in');
        }
      }
    } else if (currentSection === 2) {
      // Energy Cycles section logic
      if (energySectionPhase === 'summary') {
        setEnergySectionPhase('questions');
        setCurrentQuestion(energyQuestions.length - 1);
      } else if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else {
        // Go back to Stress section - state is preserved, so just switch sections
        setCurrentSection(1);
      }
    } else if (currentSection === 3) {
      // Body Systems section logic
      if (bodySystemsPhase === 'check_in') {
        setBodySystemsPhase('questions');
        setCurrentQuestion(bodySystemsQuestions.length - 1);
      } else if (bodySystemsPhase === 'follow_up') {
        if (bodySystemsFollowUpQuestionIndex > 0) {
          setBodySystemsFollowUpQuestionIndex(prev => prev - 1);
        } else {
          setBodySystemsPhase('check_in');
        }
      } else if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else {
        // Go back to Energy section - state is preserved, so just switch sections
        setCurrentSection(2);
      }
    } else {
      if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else if (currentSection > 0) {
        // Go back to previous section - state is preserved, so just switch sections
        setCurrentSection(prev => prev - 1);
      }
    }
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    // Check-in/summary phases are always considered "answered" since they're review screens
    if (currentSection === 0 && sleepSectionPhase === 'check_in') {
      return true;
    }
    if (currentSection === 1 && stressSectionPhase === 'check_in') {
      return true;
    }
    if (currentSection === 2 && energySectionPhase === 'summary') {
      return true;
    }
    if (currentSection === 3 && bodySystemsPhase === 'check_in') {
      return true;
    }
    
    // For follow-up questions, we need to validate the current follow-up question
    if (currentSection === 0 && sleepSectionPhase === 'follow_up' && currentSleepAnalysis) {
      const followUpQuestion = getSleepFollowUpQuestion(currentSleepAnalysis, followUpQuestionIndex);
      if (!followUpQuestion) return false;
      const answer = responses[followUpQuestion.id];
      
      if (answer === undefined || answer === null || answer === '') {
        return false;
      }
      
      if (followUpQuestion.type === 'scale') {
        const [min, max] = followUpQuestion.scaleRange || [1, 5];
        return typeof answer === 'number' && answer >= min && answer <= max;
      }
      
      if (followUpQuestion.type === 'multiple_choice') {
        return typeof answer === 'string' && answer.length > 0;
      }
      
      if (followUpQuestion.type === 'multi_select') {
        return Array.isArray(answer) && answer.length > 0;
      }
      
      return true;
    }
    
    if (currentSection === 1 && stressSectionPhase === 'follow_up' && currentStressAnalysis) {
      const followUpQuestion = getStressFollowUpQuestion(currentStressAnalysis, stressFollowUpQuestionIndex);
      if (!followUpQuestion) return false;
      const answer = responses[followUpQuestion.id];
      
      if (answer === undefined || answer === null || answer === '') {
        return false;
      }
      
      if (followUpQuestion.type === 'scale') {
        const [min, max] = followUpQuestion.scaleRange || [1, 5];
        return typeof answer === 'number' && answer >= min && answer <= max;
      }
      
      if (followUpQuestion.type === 'multiple_choice') {
        return typeof answer === 'string' && answer.length > 0;
      }
      
      if (followUpQuestion.type === 'multi_select') {
        return Array.isArray(answer) && answer.length > 0;
      }
      
      return true;
    }
    
    if (currentSection === 3 && bodySystemsPhase === 'follow_up' && bodySystemsAnalysis) {
      const followUpQuestion = getBodySystemsFollowUpQuestion(bodySystemsAnalysis, bodySystemsFollowUpQuestionIndex);
      if (!followUpQuestion) return false;
      const answer = responses[followUpQuestion.id];
      
      if (answer === undefined || answer === null || answer === '') {
        return false;
      }
      
      if (followUpQuestion.type === 'scale') {
        const [min, max] = followUpQuestion.scaleRange || [1, 5];
        return typeof answer === 'number' && answer >= min && answer <= max;
      }
      
      if (followUpQuestion.type === 'multiple_choice') {
        return typeof answer === 'string' && answer.length > 0;
      }
      
      if (followUpQuestion.type === 'multi_select') {
        return Array.isArray(answer) && answer.length > 0;
      }
      
      return true;
    }
    
    // For regular questions, validate based on the current question data
    if (!currentQuestionData) return false;
    const answer = responses[currentQuestionData.id];
    
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }
    
    if (currentQuestionData.type === 'scale') {
      const [min, max] = currentQuestionData.scaleRange || [1, 5];
      return typeof answer === 'number' && answer >= min && answer <= max;
    }
    
    if (currentQuestionData.type === 'slider') {
      const min = currentQuestionData.min || 0;
      const max = currentQuestionData.max || 10;
      return typeof answer === 'number' && answer >= min && answer <= max;
    }
    
    if (currentQuestionData.type === 'multiple_choice') {
      return typeof answer === 'string' && answer.length > 0;
    }
    
    if (currentQuestionData.type === 'multi_select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return true;
  };

  // Navigation state
  const canGoBack = currentSection > 0 || currentQuestion > 0 || (currentSection === 0 && sleepSectionPhase !== 'questions') || (currentSection === 1 && stressSectionPhase !== 'questions') || (currentSection === 2 && energySectionPhase !== 'questions') || (currentSection === 3 && bodySystemsPhase !== 'questions');
  const hasMoreQuestions = () => {
    if (currentSection === 0) {
      if (sleepSectionPhase === 'questions') {
        return currentQuestion < sleepQuestions.length - 1;
      } else if (sleepSectionPhase === 'check_in') {
        return currentSleepAnalysis?.needsFollowUp || false;
      } else if (sleepSectionPhase === 'follow_up') {
        const totalFollowUps = currentSleepAnalysis ? getTotalFollowUpQuestions(currentSleepAnalysis) : 0;
        return followUpQuestionIndex < totalFollowUps - 1;
      }
    } else if (currentSection === 1) {
      if (stressSectionPhase === 'questions') {
        return currentQuestion < stressQuestions.length - 1;
      } else if (stressSectionPhase === 'check_in') {
        return currentStressAnalysis?.needsFollowUp || false;
      } else if (stressSectionPhase === 'follow_up') {
        const totalFollowUps = currentStressAnalysis ? getTotalStressFollowUpQuestions(currentStressAnalysis) : 0;
        return stressFollowUpQuestionIndex < totalFollowUps - 1;
      }
    } else if (currentSection === 2) {
      if (energySectionPhase === 'questions') {
        return currentQuestion < energyQuestions.length - 1;
      } else if (energySectionPhase === 'summary') {
        return true; // There's always a next section after energy summary
      }
    } else if (currentSection === 3) {
      if (bodySystemsPhase === 'questions') {
        return currentQuestion < bodySystemsQuestions.length - 1;
      } else if (bodySystemsPhase === 'check_in') {
        return bodySystemsAnalysis?.needsFollowUp || false;
      } else if (bodySystemsPhase === 'follow_up') {
        const totalFollowUps = bodySystemsAnalysis ? getTotalBodySystemsFollowUpQuestions(bodySystemsAnalysis) : 0;
        return bodySystemsFollowUpQuestionIndex < totalFollowUps - 1;
      }
    }
    return currentSection < sections.length - 1 || currentQuestion < sections[currentSection].questions - 1;
  };
  const canGoNext = hasMoreQuestions() ? isCurrentQuestionAnswered() : true;

  // Helper function to get questions answered in a section
  const getQuestionsAnsweredInSection = (sectionIndex: number) => {
    let questionsForSection: Array<{ id: string }> = [];
    
    if (sectionIndex === 0) {
      questionsForSection = sleepQuestions;
    } else if (sectionIndex === 1) {
      questionsForSection = stressQuestions;
    } else if (sectionIndex === 2) {
      questionsForSection = energyQuestions;
    } else if (sectionIndex === 3) {
      questionsForSection = bodySystemsQuestions;
    }
    
    return questionsForSection.filter(q => {
      const answer = responses[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
  };

  // Helper function to check if a section can be accessed
  const canAccessSection = (sectionIndex: number) => {
    // Always allow current section
    if (sectionIndex === currentSection) return true;
    
    // Allow access to any section where user has answered at least one question
    // This is for reviewing/editing previous work
    if (getQuestionsAnsweredInSection(sectionIndex) > 0) return true;
    
    // Don't allow jumping ahead to new sections - users must use Continue button
    return false;
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img src="/home_page.svg" alt="" className="w-full h-full object-cover opacity-30" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Mobile/Tablet Progress Header - visible on smaller screens */}
        <div 
          className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b border-white/30"
          style={{
            opacity: mobileProgressOpacity,
            transition: 'opacity 0.8s ease-in-out'
          }}
        >
          <div className="p-3 pb-4 pt-4">
            <h2 className="text-sm font-medium text-[#3a3a3a] mb-2">Your Human Signal is building</h2>
            
            {/* Horizontal progress indicators for mobile/tablet */}
            <div className="flex items-center justify-between space-x-2">
              {sections.map((section, index) => (
                <button
                  key={section.name}
                  onClick={() => {
                    if (canAccessSection(index)) {
                      setCurrentSection(index);
                      setCurrentQuestion(0);
                      if (index === 0) {
                        setSleepSectionPhase('questions');
                        setFollowUpQuestionIndex(0);
                      }
                      // Ensure we scroll to the absolute top after content updates
                      setTimeout(() => {
                        // Double-ensure we get to the very top
                        window.scrollTo(0, 0);  // Immediate scroll
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });  // Smooth for visual feedback
                        }, 50);
                      }, 10);
                    }
                  }}
                  disabled={!canAccessSection(index)}
                  className={`flex-1 p-2 rounded-lg text-center transition-colors duration-200 ${
                    canAccessSection(index)
                      ? 'hover:bg-white/20 cursor-pointer' 
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div 
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentSection 
                          ? 'bg-[#d95e40]' 
                          : index < currentSection 
                          ? 'bg-[#4b6fa8]' 
                          : 'bg-white/40'
                      }`}
                    />
                    <span className="text-xs font-medium text-[#3a3a3a]/80">
                      {section.name.split(' ')[0]}
                    </span>
                    <span className="text-xs text-[#3a3a3a]/60">
                      {index === currentSection ? 
                        (index === 0 && sleepSectionPhase === 'check_in' ? 
                          'Review' : 
                          index === 0 && sleepSectionPhase === 'follow_up' ?
                          `${followUpQuestionIndex + 1}/${currentSleepAnalysis ? getTotalFollowUpQuestions(currentSleepAnalysis) : 0}` :
                          index === 1 && stressSectionPhase === 'check_in' ?
                          'Review' :
                          index === 1 && stressSectionPhase === 'follow_up' ?
                          `${stressFollowUpQuestionIndex + 1}/${currentStressAnalysis ? getTotalStressFollowUpQuestions(currentStressAnalysis) : 0}` :
                          `${currentQuestion + 1}/${section.questions}`) : 
                        `${getQuestionsAnsweredInSection(index)}/${section.questions}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside 
          className="hidden lg:flex w-[550px] bg-white/90 backdrop-blur-sm border-r border-white/40 flex flex-col shadow-lg"
          style={{
            opacity: sidebarOpacity,
            transition: 'opacity 1.0s ease-in-out'
          }}
        >
          
          {/* Progress header */}
          <div className="p-8 border-b border-white/20">
            <h2 
              className="text-xl font-medium text-[#3a3a3a] mb-6"
              style={{
                opacity: sidebarHeaderOpacity,
                transition: 'opacity 0.4s ease-out'
              }}
            >
              Your Human Signal is building
            </h2>
            
            {/* Section progress indicators - clickable for visited sections */}
            <div 
              className="space-y-4"
              style={{
                opacity: sidebarIndicatorsOpacity,
                transition: 'opacity 0.4s ease-out'
              }}
            >
              {sections.map((section, index) => (
                <button
                  key={section.name}
                  onClick={() => {
                    // Allow navigation to any accessible section
                    if (canAccessSection(index)) {
                      setCurrentSection(index);
                      setCurrentQuestion(0);
                      if (index === 0) {
                        setSleepSectionPhase('questions');
                        setFollowUpQuestionIndex(0);
                      }
                      // Ensure we scroll to the absolute top after content updates
                      setTimeout(() => {
                        // Double-ensure we get to the very top
                        window.scrollTo(0, 0);  // Immediate scroll
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });  // Smooth for visual feedback
                        }, 50);
                      }, 10);
                    }
                  }}
                  disabled={!canAccessSection(index)}
                  className={`w-full flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200 ${
                    canAccessSection(index)
                      ? 'hover:bg-white/30 cursor-pointer' 
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                      index === currentSection 
                        ? 'bg-[#d95e40]' 
                        : index < currentSection 
                        ? 'bg-[#4b6fa8]' 
                        : 'bg-white/40'
                    }`}
                  />
                  <span className={`text-base ${
                    index === currentSection ? 'text-[#3a3a3a] font-medium' : 'text-[#3a3a3a]/60'
                  }`}>
                    {section.name}
                  </span>
                  <span className="text-sm text-[#3a3a3a]/40 ml-auto">
                    {index === currentSection ? 
                      (index === 0 && sleepSectionPhase === 'check_in' ? 
                        'Review' : 
                        index === 0 && sleepSectionPhase === 'follow_up' ?
                        `Follow-up ${followUpQuestionIndex + 1}/${currentSleepAnalysis ? getTotalFollowUpQuestions(currentSleepAnalysis) : 0}` :
                        index === 1 && stressSectionPhase === 'check_in' ?
                        'Review' :
                        index === 1 && stressSectionPhase === 'follow_up' ?
                        `Follow-up ${stressFollowUpQuestionIndex + 1}/${currentStressAnalysis ? getTotalStressFollowUpQuestions(currentStressAnalysis) : 0}` :
                        `${currentQuestion + 1}/${section.questions} (${getQuestionsAnsweredInSection(index)} answered)`) : 
                      getQuestionsAnsweredInSection(index) > 0 ? 
                        `${getQuestionsAnsweredInSection(index)}/${section.questions} answered` :
                        `${getQuestionsAnsweredInSection(index)}/${section.questions}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Radar Chart visualization area */}
          <div 
            className="lg:h-[30rem] lg:flex-none flex-1 p-8 flex items-center justify-center"
            style={{
              opacity: sidebarChartOpacity,
              transition: 'opacity 0.4s ease-out'
            }}
          >
            <div className="w-full h-96 relative">
              <RadarChart responses={responses} sectionProgress={currentSection} currentSection={currentSection} />
            </div>
          </div>

        </aside>

        <main 
          className="flex-1 flex flex-col pt-32 lg:pt-0 pb-32 lg:pb-0 sm:mx-8 md:mx-16 lg:mx-0 lg:pl-12"
          style={{
            opacity: mainContentContainerOpacity,
            transform: mainContentTransform,
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
          }}
        >
          <header className="p-8 lg:p-10 border-b border-white/20">
            <div className="max-w-2xl sm:max-w-none lg:max-w-2xl">
              {/* Section counter */}
              <div 
                className="mb-4"
                style={{
                  opacity: sectionCounterOpacity,
                  transition: 'opacity 0.4s ease-out'
                }}
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#4b6fa8]/10 to-[#4b6fa8]/5 text-[#4b6fa8] border border-[#4b6fa8]/20">
                  Section {currentSection + 1} of {sections.length}
                </span>
              </div>
              
              <div
                style={{
                  opacity: headingOpacity,
                  transition: 'opacity 0.4s ease-out'
                }}
              >
                <h1 className="text-3xl lg:text-4xl font-light text-[#3a3a3a] mb-3">
                  {sections[currentSection].name}
                </h1>
                <p className="text-lg lg:text-xl text-[#3a3a3a]/70 leading-relaxed">
                {currentSection === 0 && sleepSectionPhase === 'check_in' && "Let's review what we've learned about your sleep patterns"}
                {currentSection === 1 && stressSectionPhase === 'check_in' && "Let's review what we've learned about your stress patterns"}
                {currentSection === 2 && energySectionPhase === 'summary' && "Let's review what we've learned about your energy cycles"}
                {currentSection === 3 && bodySystemsPhase === 'check_in' && "Let's review what we've learned about your body systems"}
                {currentSection === 3 && bodySystemsPhase === 'follow_up' && "A few more questions to help us provide better recommendations"}
                {currentSection === 0 && sleepSectionPhase === 'follow_up' && "A few more questions to help us provide better recommendations"}
                {currentSection === 1 && stressSectionPhase === 'follow_up' && "A few more questions to help us provide better recommendations"}
                {currentSection === 0 && sleepSectionPhase === 'questions' && "Help us understand your unique sleep patterns by sharing insights about your sleep rhythms."}
                {currentSection === 1 && stressSectionPhase === 'questions' && "Let's explore how you manage and respond to stress in your daily life."}
                {currentSection === 2 && energySectionPhase === 'questions' && "Tell us about your natural energy patterns throughout the day and week."}
                {currentSection === 3 && bodySystemsPhase === 'questions' && "Help us understand how your body systems are functioning overall."}
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 sm:p-8 lg:p-10">
            <div 
              className="max-w-2xl sm:max-w-none lg:max-w-2xl"
              style={{
                opacity: questionContentOpacity,
                transition: 'opacity 0.4s ease-out'
              }}
            >
              
              {/* Check-in display for sleep section */}
              {currentSection === 0 && sleepSectionPhase === 'check_in' && sleepAnalysis ? (
                <div className={`bg-white/60 backdrop-blur-sm rounded-2xl pt-2 px-4 pb-2 sm:pt-3 sm:px-6 sm:pb-3 lg:pt-4 lg:px-8 lg:pb-4 shadow-sm border border-white/40 transition-all duration-700 ease-out transform ${
                  cardVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}>
                  <h3 className="text-lg lg:text-xl font-medium text-[#3a3a3a] mt-4 mb-4 leading-relaxed">
                    Here&apos;s what we&apos;ve learned about your sleep patterns
                  </h3>
                  
                  {(() => {
                    const scoreDetails = getScoreDetails(sleepAnalysis.overallScore, 'sleep');
                    return (
                      <div className={`mb-6 p-6 bg-gradient-to-br ${scoreDetails.bgGradient} rounded-xl transition-all duration-500 ease-out shadow-sm`}>
                        {/* Score Header */}
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center mb-2">
                            {/* Sleep Icon */}
                            <div className="mr-3 text-2xl opacity-60">🌙</div>
                            <h4 className="text-lg font-medium text-[#3a3a3a]">Sleep Health Score</h4>
                          </div>
                          
                          {/* Large Score Display */}
                          <div className={`text-6xl lg:text-7xl font-light ${scoreDetails.colorClass} leading-none mb-2 transition-all duration-300 ${
                            animatedScore === sleepAnalysis.overallScore ? 'animate-score-breathe' : ''
                          }`}>
                            {animatedScore}
                          </div>
                          <div className="text-sm text-[#3a3a3a]/60 font-medium mb-3">out of 100</div>
                          
                          {/* Score Interpretation */}
                          <div className="space-y-1">
                            <div className={`text-lg font-semibold ${scoreDetails.colorClass}`}>
                              {scoreDetails.label}
                            </div>
                            <div className="text-sm text-[#3a3a3a]/70 max-w-sm mx-auto">
                              {scoreDetails.description}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className={`h-3 rounded-full bg-gradient-to-r ${scoreDetails.barGradient} transition-all duration-1500 ease-out shadow-sm ${
                                sleepProgressWidth > 0 ? 'animate-progress-shimmer' : ''
                              }`}
                              style={{ 
                                width: `${sleepProgressWidth}%`
                              }}
                            />
                          </div>
                          
                          {/* Score Range Labels */}
                          <div className="flex justify-between text-xs text-[#3a3a3a]/50 font-medium px-1">
                            <span>Poor</span>
                            <span>Fair</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Show insights with staggered animations */}
                  {(sleepAnalysis.strengths.length > 0 || sleepAnalysis.concerns.length > 0 || sleepAnalysis.insights.length > 0) && (
                    <div className="space-y-4">
                      {sleepAnalysis.strengths.length > 0 && (
                        <div className={`transition-all duration-600 ease-out transform ${
                          showStrengths 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}>
                          <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                            <span className="w-2 h-2 bg-[#A38E3A] rounded-full mr-2"></span>
                            What&apos;s working well
                          </h4>
                          <ul className="space-y-1">
                            {sleepAnalysis.strengths.map((strength, index) => (
                              <li 
                                key={index} 
                                className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                  showStrengths 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-2'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                              >
                                • {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {sleepAnalysis.concerns.length > 0 && (
                        <div className={`transition-all duration-600 ease-out transform ${
                          showConcerns 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}>
                          <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                            Areas for potential improvement
                          </h4>
                          <ul className="space-y-1">
                            {sleepAnalysis.concerns.map((concern, index) => (
                              <li 
                                key={index} 
                                className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                  showConcerns 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-2'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                              >
                                • {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up preview */}
                  {sleepAnalysis.needsFollowUp && sleepAnalysis.followUpQuestions.length > 0 && (
                    <div className={`mt-4 p-4 rounded-lg transition-all duration-800 ease-out transform ${
                      showFollowUp 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95'
                    }`}>
                      <p className="text-sm text-[#3a3a3a]/70">
                        We have a few follow-up questions to help us provide you with personalized recommendations.
                      </p>
                    </div>
                  )}
                </div>
              ) : currentSection === 1 && stressSectionPhase === 'check_in' && stressAnalysis ? (
                <div className={`bg-white/60 backdrop-blur-sm rounded-2xl pt-2 px-4 pb-2 sm:pt-3 sm:px-6 sm:pb-3 lg:pt-4 lg:px-8 lg:pb-4 shadow-sm border border-white/40 transition-all duration-700 ease-out transform ${
                  cardVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}>
                  <h3 className="text-lg lg:text-xl font-medium text-[#3a3a3a] mt-4 mb-4 leading-relaxed">
                    Here&apos;s what we&apos;ve learned about your stress patterns
                  </h3>
                  
                  {(() => {
                    const scoreDetails = getScoreDetails(stressAnalysis.overallScore, 'stress');
                    return (
                      <div className={`mb-6 p-6 bg-gradient-to-br ${scoreDetails.bgGradient} rounded-xl transition-all duration-500 ease-out shadow-sm`}>
                        {/* Score Header */}
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center mb-2">
                            {/* Stress Icon */}
                            <div className="mr-3 text-2xl opacity-60">⚡</div>
                            <h4 className="text-lg font-medium text-[#3a3a3a]">Stress Health Score</h4>
                          </div>
                          
                          {/* Large Score Display */}
                          <div className={`text-6xl lg:text-7xl font-light ${scoreDetails.colorClass} leading-none mb-2 transition-all duration-300 ${
                            animatedScore === stressAnalysis.overallScore ? 'animate-score-breathe' : ''
                          }`}>
                            {animatedScore}
                          </div>
                          <div className="text-sm text-[#3a3a3a]/60 font-medium mb-3">out of 100</div>
                          
                          {/* Score Interpretation */}
                          <div className="space-y-1">
                            <div className={`text-lg font-semibold ${scoreDetails.colorClass}`}>
                              {scoreDetails.label}
                            </div>
                            <div className="text-sm text-[#3a3a3a]/70 max-w-sm mx-auto">
                              {scoreDetails.description}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className={`h-3 rounded-full bg-gradient-to-r ${scoreDetails.barGradient} transition-all duration-1500 ease-out shadow-sm ${
                                stressProgressWidth > 0 ? 'animate-progress-shimmer' : ''
                              }`}
                              style={{ width: `${stressProgressWidth}%` }}
                            />
                          </div>
                          
                          {/* Score Range Labels */}
                          <div className="flex justify-between text-xs text-[#3a3a3a]/50 font-medium px-1">
                            <span>Poor</span>
                            <span>Fair</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Show insights with staggered animations */}
                  {(stressAnalysis.strengths.length > 0 || stressAnalysis.concerns.length > 0 || stressAnalysis.insights.length > 0) && (
                    <div className="space-y-4">
                      {stressAnalysis.strengths.length > 0 && (
                        <div className={`transition-all duration-600 ease-out transform ${
                          showStrengths 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}>
                          <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                            <span className="w-2 h-2 bg-[#A38E3A] rounded-full mr-2"></span>
                            What&apos;s working well
                          </h4>
                          <ul className="space-y-1">
                            {stressAnalysis.strengths.map((strength, index) => (
                              <li 
                                key={index} 
                                className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                  showStrengths 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-2'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                              >
                                • {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {stressAnalysis.concerns.length > 0 && (
                        <div className={`transition-all duration-600 ease-out transform ${
                          showConcerns 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}>
                          <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                            Areas for potential improvement
                          </h4>
                          <ul className="space-y-1">
                            {stressAnalysis.concerns.map((concern, index) => (
                              <li 
                                key={index} 
                                className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                  showConcerns 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-2'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                              >
                                • {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-up preview */}
                  {stressAnalysis.needsFollowUp && stressAnalysis.followUpQuestions.length > 0 && (
                    <div className={`mt-4 p-4 rounded-lg transition-all duration-800 ease-out transform ${
                      showFollowUp 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95'
                    }`}>
                      <p className="text-sm text-[#3a3a3a]/70">
                        We have a few follow-up questions to help us provide you with personalized recommendations.
                      </p>
                    </div>
                  )}
                </div>
              ) : currentSection === 2 && energySectionPhase === 'summary' ? (
                /* Energy Cycles Summary */
                <div className={`bg-white/60 backdrop-blur-sm rounded-2xl pt-2 px-4 pb-2 sm:pt-3 sm:px-6 sm:pb-3 lg:pt-4 lg:px-8 lg:pb-4 shadow-sm border border-white/40 transition-all duration-700 ease-out transform ${
                  cardVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}>
                  <h3 className="text-lg lg:text-xl font-medium text-[#3a3a3a] mt-4 mb-4 leading-relaxed">
                    Here&apos;s what we&apos;ve learned about your energy cycles
                  </h3>
                  
                  {(() => {
                    if (!energyAnalysis) return null;
                    const scoreDetails = getScoreDetails(energyAnalysis.overallScore, 'energy');
                    return (
                      <div className={`mb-6 p-6 bg-gradient-to-br ${scoreDetails.bgGradient} rounded-xl transition-all duration-500 ease-out shadow-sm`}>
                        {/* Score Header */}
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center mb-2">
                            {/* Energy Icon */}
                            <div className="mr-3 text-2xl opacity-60">🔋</div>
                            <h4 className="text-lg font-medium text-[#3a3a3a]">Energy Management Score</h4>
                          </div>
                          
                          {/* Large Score Display */}
                          <div className={`text-6xl lg:text-7xl font-light ${scoreDetails.colorClass} leading-none mb-2 transition-all duration-300 ${
                            animatedScore === energyAnalysis.overallScore ? 'animate-score-breathe' : ''
                          }`}>
                            {animatedScore}
                          </div>
                          <div className="text-sm text-[#3a3a3a]/60 font-medium mb-3">out of 100</div>
                          
                          {/* Score Interpretation */}
                          <div className="space-y-1">
                            <div className={`text-lg font-semibold ${scoreDetails.colorClass}`}>
                              {scoreDetails.label}
                            </div>
                            <div className="text-sm text-[#3a3a3a]/70 max-w-sm mx-auto">
                              {scoreDetails.description}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className={`h-3 rounded-full bg-gradient-to-r ${scoreDetails.barGradient} transition-all duration-1500 ease-out shadow-sm ${
                                energyProgressWidth > 0 ? 'animate-progress-shimmer' : ''
                              }`}
                              style={{ width: `${energyProgressWidth}%` }}
                            />
                          </div>
                          
                          {/* Score Range Labels */}
                          <div className="flex justify-between text-xs text-[#3a3a3a]/50 font-medium px-1">
                            <span>Needs Focus</span>
                            <span>Moderate</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Show insights with staggered animations */}
                  {(() => {
                    if (!energyAnalysis) return null;
                    return (energyAnalysis.strengths.length > 0 || energyAnalysis.concerns.length > 0) && (
                      <div className="space-y-4">
                        {energyAnalysis.strengths.length > 0 && (
                          <div className={`transition-all duration-600 ease-out transform ${
                            showStrengths 
                              ? 'opacity-100 translate-x-0' 
                              : 'opacity-0 -translate-x-4'
                          }`}>
                            <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                              <span className="w-2 h-2 bg-[#A38E3A] rounded-full mr-2"></span>
                              What&apos;s working well
                            </h4>
                            <ul className="space-y-1">
                              {energyAnalysis.strengths.map((strength: string, index: number) => (
                                <li 
                                  key={index} 
                                  className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                    showStrengths 
                                      ? 'opacity-100 translate-x-0' 
                                      : 'opacity-0 -translate-x-2'
                                  }`}
                                  style={{ transitionDelay: `${index * 200}ms` }}
                                >
                                  • {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {energyAnalysis.concerns.length > 0 && (
                          <div className={`transition-all duration-600 ease-out transform ${
                            showConcerns 
                              ? 'opacity-100 translate-x-0' 
                              : 'opacity-0 -translate-x-4'
                          }`}>
                            <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              Areas for improvement
                            </h4>
                            <ul className="space-y-1">
                              {energyAnalysis.concerns.map((concern: string, index: number) => (
                                <li 
                                  key={index} 
                                  className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                    showConcerns 
                                      ? 'opacity-100 translate-x-0' 
                                      : 'opacity-0 -translate-x-2'
                                  }`}
                                  style={{ transitionDelay: `${index * 200}ms` }}
                                >
                                  • {concern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : currentSection === 3 && bodySystemsPhase === 'check_in' && bodySystemsAnalysis ? (
                /* Body Systems Check-In */
                <div className={`bg-white/60 backdrop-blur-sm rounded-2xl pt-2 px-4 pb-2 sm:pt-3 sm:px-6 sm:pb-3 lg:pt-4 lg:px-8 lg:pb-4 shadow-sm border border-white/40 transition-all duration-700 ease-out transform ${
                  cardVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}>
                  <h3 className="text-lg lg:text-xl font-medium text-[#3a3a3a] mt-4 mb-4 leading-relaxed">
                    Here&apos;s what we&apos;ve learned about your body systems
                  </h3>
                  
                  {(() => {
                    const scoreDetails = getScoreDetails(bodySystemsAnalysis.overallScore, 'body');
                    return (
                      <div className={`mb-6 p-6 bg-gradient-to-br ${scoreDetails.bgGradient} rounded-xl transition-all duration-500 ease-out shadow-sm`}>
                        {/* Score Header */}
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center mb-2">
                            {/* Body Systems Icon */}
                            <div className="mr-3 text-2xl opacity-60">🏃‍♀️</div>
                            <h4 className="text-lg font-medium text-[#3a3a3a]">Physical Health Score</h4>
                          </div>
                          
                          {/* Large Score Display */}
                          <div className={`text-6xl lg:text-7xl font-light ${scoreDetails.colorClass} leading-none mb-2 transition-all duration-300 ${
                            animatedScore === bodySystemsAnalysis.overallScore ? 'animate-score-breathe' : ''
                          }`}>
                            {animatedScore}
                          </div>
                          <div className="text-sm text-[#3a3a3a]/60 font-medium mb-3">out of 100</div>
                          
                          {/* Score Interpretation */}
                          <div className="space-y-1">
                            <div className={`text-lg font-semibold ${scoreDetails.colorClass}`}>
                              {scoreDetails.label}
                            </div>
                            <div className="text-sm text-[#3a3a3a]/70 max-w-sm mx-auto">
                              {scoreDetails.description}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className={`h-3 rounded-full bg-gradient-to-r ${scoreDetails.barGradient} transition-all duration-1500 ease-out shadow-sm ${
                                bodySystemsProgressWidth > 0 ? 'animate-progress-shimmer' : ''
                              }`}
                              style={{ width: `${bodySystemsProgressWidth}%` }}
                            />
                          </div>
                          
                          {/* Score Range Labels */}
                          <div className="flex justify-between text-xs text-[#3a3a3a]/50 font-medium px-1">
                            <span>Needs Focus</span>
                            <span>Moderate</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Show insights with staggered animations */}
                  {(bodySystemsAnalysis.strengths.length > 0 || bodySystemsAnalysis.concerns.length > 0) && (
                    <div className="space-y-4">
                      {bodySystemsAnalysis.strengths.length > 0 && (
                        <div className={`transition-all duration-600 ease-out transform ${
                          showStrengths 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}>
                          <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                            <span className="w-2 h-2 bg-[#A38E3A] rounded-full mr-2"></span>
                            What&apos;s working well
                          </h4>
                          <ul className="space-y-1">
                            {bodySystemsAnalysis.strengths.map((strength: string, index: number) => (
                              <li 
                                key={index} 
                                className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                  showStrengths 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-2'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                              >
                                • {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {bodySystemsAnalysis.concerns.length > 0 && (
                        <div className={`transition-all duration-600 ease-out transform ${
                          showConcerns 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-4'
                        }`}>
                          <h4 className="text-base font-medium text-[#3a3a3a] mb-2 flex items-center">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            Areas for improvement
                          </h4>
                          <ul className="space-y-1">
                            {bodySystemsAnalysis.concerns.map((concern: string, index: number) => (
                              <li 
                                key={index} 
                                className={`text-sm text-[#3a3a3a]/70 pl-4 transition-all duration-400 ease-out transform ${
                                  showConcerns 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-2'
                                }`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                              >
                                • {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Follow-up preview */}
                  {bodySystemsAnalysis.needsFollowUp && bodySystemsAnalysis.followUpQuestions.length > 0 && (
                    <div className={`mt-4 p-4 rounded-lg transition-all duration-800 ease-out transform ${
                      showFollowUp 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-4 scale-95'
                    }`}>
                      <p className="text-sm text-[#3a3a3a]/70">
                        We have a few follow-up questions to help us provide you with personalized recommendations.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular question display */
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl pt-2 px-4 pb-2 sm:pt-3 sm:px-6 sm:pb-3 lg:pt-4 lg:px-8 lg:pb-4 shadow-sm border border-white/40">
                  {currentQuestionData ? (
                    <>
                      <div className="mt-4 mb-4">
                        {/* Follow-up question indicator */}
                        {((currentSection === 0 && sleepSectionPhase === 'follow_up') ||
                          (currentSection === 1 && stressSectionPhase === 'follow_up') ||
                          (currentSection === 3 && bodySystemsPhase === 'follow_up')) && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#4b6fa8]/10 to-[#4b6fa8]/5 text-[#4b6fa8] border border-[#4b6fa8]/20">
                              Follow-up {
                                currentSection === 0 ? `${followUpQuestionIndex + 1} of ${currentSleepAnalysis ? getTotalFollowUpQuestions(currentSleepAnalysis) : 0}` :
                                currentSection === 1 ? `${stressFollowUpQuestionIndex + 1} of ${currentStressAnalysis ? getTotalStressFollowUpQuestions(currentStressAnalysis) : 0}` :
                                `${bodySystemsFollowUpQuestionIndex + 1} of ${bodySystemsAnalysis ? getTotalBodySystemsFollowUpQuestions(bodySystemsAnalysis) : 0}`
                              }
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-base sm:text-lg lg:text-xl font-medium text-[#3a3a3a] mb-4 leading-relaxed break-words">
                          {currentQuestionData.text}
                          <span className="text-[#d95e40] ml-1">*</span>
                        </h3>
                        {currentQuestionData.helperText && (
                          <p className="text-sm text-[#3a3a3a]/60 leading-relaxed">{currentQuestionData.helperText}</p>
                        )}
                      </div>

                      {/* Question inputs */}
                      <div className="mb-4">
                        {currentQuestionData.type === 'slider' && (
                          <div className="mb-4">
                            <div className="relative">
                              <input
                                type="range"
                                id={currentQuestionData.id}
                                min={currentQuestionData.min}
                                max={currentQuestionData.max}
                                step={currentQuestionData.step}
                                value={responses[currentQuestionData.id] || currentQuestionData.defaultValue}
                                onChange={(e) => handleResponseChange(currentQuestionData.id, parseFloat(e.target.value))}
                                className="w-full h-2 bg-white/40 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <div className="flex justify-between text-sm text-[#3a3a3a]/60 mt-3">
                                <span>{currentQuestionData.min} {currentQuestionData.unit}</span>
                                <span className="font-medium text-[#3a3a3a] text-lg">
                                  {responses[currentQuestionData.id] || currentQuestionData.defaultValue} {currentQuestionData.unit}
                                </span>
                                <span>{currentQuestionData.max} {currentQuestionData.unit}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentQuestionData.type === 'multiple_choice' && (
                          <div className="mb-4 space-y-3">
                            {currentQuestionData.options?.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center p-3 sm:p-4 bg-white/30 rounded-xl border border-white/40 cursor-pointer hover:bg-white/40 transition-colors duration-200"
                              >
                                <input
                                  type="radio"
                                  name={currentQuestionData.id}
                                  value={option.value}
                                  checked={responses[currentQuestionData.id] === option.value}
                                  onChange={(e) => handleResponseChange(currentQuestionData.id, e.target.value)}
                                  className="mr-3 sm:mr-4 w-4 h-4 text-[#d95e40] border-2 border-[#3a3a3a]/30 focus:outline-none flex-shrink-0"
                                />
                                <span className="text-sm sm:text-base text-[#3a3a3a] font-medium leading-relaxed">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {currentQuestionData.type === 'multi_select' && (
                          <div className="mb-4 space-y-3">
                            {currentQuestionData.options?.map((option) => {
                              const isSelected = ((responses[currentQuestionData.id] as string[]) || []).includes(option.value);
                              return (
                                <label
                                  key={option.value}
                                  className="flex items-center p-3 sm:p-4 bg-white/30 rounded-xl border border-white/40 cursor-pointer hover:bg-white/40 transition-colors duration-200"
                                >
                                  <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={(e) => handleMultiSelectChange(currentQuestionData.id, option.value, e.target.checked)}
                                    className="mr-3 sm:mr-4 w-4 h-4 text-[#d95e40] border-2 border-[#3a3a3a]/30 focus:outline-none flex-shrink-0 rounded"
                                  />
                                  <span className="text-sm sm:text-base text-[#3a3a3a] font-medium leading-relaxed">{option.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {currentQuestionData.type === 'scale' && (
                          <div className="mb-4">
                            <div className="flex justify-center items-center gap-3 sm:gap-5 lg:gap-8 mb-4 px-1 sm:px-2 overflow-x-auto">
                              {currentQuestionData.scaleLabels?.map((label, index) => (
                                <div key={index} className="flex flex-col items-center space-y-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleResponseChange(currentQuestionData.id, index + (currentQuestionData.scaleRange?.[0] || 1))}
                                    className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 transition-all duration-200 text-sm sm:text-base font-medium ${
                                      responses[currentQuestionData.id] === index + (currentQuestionData.scaleRange?.[0] || 1)
                                        ? 'bg-[#d95e40] border-[#d95e40] text-white'
                                        : 'bg-white/30 border-[#3a3a3a]/30 text-[#3a3a3a] hover:bg-white/40'
                                    }`}
                                  >
                                    {index + (currentQuestionData.scaleRange?.[0] || 1)}
                                  </button>
                                  <span className="text-xs text-[#3a3a3a]/60 text-center whitespace-nowrap leading-tight px-1">{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 mb-4">
                      <p className="text-[#3a3a3a]/60">Loading question...</p>
                    </div>
                  )}
                </div>
              )}

                    {/* Mobile/Tablet Radar Chart - visible only on mobile/tablet, positioned below questions */}
      <div 
        className="lg:hidden mt-8 mb-2 px-2"
        style={{
          opacity: mobileChartOpacity,
          transition: 'opacity 0.6s ease-out'
        }}
      >
        {/* Mobile title - centered above chart */}
        <div className="sm:hidden mb-4">
          <h3 className="text-base font-medium text-[#3a3a3a] text-center">Your Human Signal</h3>
        </div>
        
        {/* Chart container with tablet title */}
        <div className="w-full relative mb-4">
          <RadarChart responses={responses} sectionProgress={currentSection} chartTitle="Your Human Signal" currentSection={currentSection} />
        </div>
        <p className="text-sm text-[#3a3a3a]/70 text-center leading-relaxed px-2">
          Your wellness signal evolves as you complete each section. Watch your unique pattern emerge as you progress through the assessment.
        </p>
      </div>

              {/* Navigation buttons - sticky on mobile/tablet */}
              <div className="lg:relative lg:mt-4 fixed bottom-0 left-0 right-0 lg:static z-30 bg-white/80 lg:bg-white/60 backdrop-blur-sm lg:rounded-2xl pt-2 px-4 pb-2 sm:pt-3 sm:px-6 sm:pb-3 lg:pt-4 lg:px-8 lg:pb-4 shadow-lg lg:shadow-sm border-t lg:border border-white/40 lg:border-white/40">
                <div className="flex justify-between items-center">
                  <button 
                    disabled={!canGoBack}
                    onClick={handlePrevious}
                    className={`px-4 py-2 font-normal rounded-full border transition-all duration-200 shadow-sm ${
                      canGoBack 
                        ? 'text-[#3a3a3a] border-[#AE7401] bg-transparent hover:text-[#AE7401] hover:border-[#AE7401] hover:bg-[#AE7401]/5 cursor-pointer transform hover:scale-[1.01]' 
                        : 'text-[#3a3a3a]/40 border-[#3a3a3a]/20 bg-transparent cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button 
                    disabled={!canGoNext}
                    onClick={handleNext}
                    className={`px-4 py-2 font-normal rounded-full transition-all duration-200 shadow-sm ${
                      canGoNext
                        ? 'bg-[#AE7401] text-white hover:bg-[#8B5A00] cursor-pointer hover:shadow-md transform hover:scale-[1.01]'
                        : 'bg-[#3a3a3a]/20 text-[#3a3a3a]/40 cursor-not-allowed'
                    }`}
                  >
                    {(() => {
                      if (currentSection === 0 && sleepSectionPhase === 'check_in') {
                        return currentSleepAnalysis?.needsFollowUp ? 'Continue' : 'Next Section';
                      } else if (currentSection === 0 && sleepSectionPhase === 'follow_up') {
                        return hasMoreQuestions() ? 'Continue' : 'Next Section';
                      } else if (currentSection === 1 && stressSectionPhase === 'check_in') {
                        return currentStressAnalysis?.needsFollowUp ? 'Continue' : 'Next Section';
                      } else if (currentSection === 1 && stressSectionPhase === 'follow_up') {
                        return hasMoreQuestions() ? 'Continue' : 'Next Section';
                      } else if (currentSection === 2 && energySectionPhase === 'summary') {
                        return 'Next Section';
                      } else if (currentSection === 3 && bodySystemsPhase === 'check_in') {
                        return bodySystemsAnalysis?.needsFollowUp ? 'Continue' : 'Complete Assessment';
                      } else if (currentSection === 3 && bodySystemsPhase === 'follow_up') {
                        const totalFollowUps = bodySystemsAnalysis ? getTotalBodySystemsFollowUpQuestions(bodySystemsAnalysis) : 0;
                        return bodySystemsFollowUpQuestionIndex < totalFollowUps - 1 ? 'Continue' : 'Complete Assessment';
                      } else {
                        return hasMoreQuestions() ? 'Continue' : 'Review Summary';
                      }
                    })()}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// Wrapper component with Suspense for useSearchParams
function AssessmentWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Assessment />
    </Suspense>
  );
}

export default AssessmentWithSuspense;
