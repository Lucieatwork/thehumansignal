'use client';

// Stress Patterns assessment questions component
// Part of the 4-section health assessment system from PRD FR-02
export interface StressQuestion {
  id: string;
  text: string;
  type: 'slider' | 'multiple_choice' | 'multi_select' | 'scale';
  helperText?: string;
  // Slider specific properties
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  // Multiple choice specific properties
  options?: { value: string; label: string }[];
  // Scale specific properties
  scaleLabels?: string[];
  scaleRange?: [number, number];
}

// Stress analysis results interface
// Used to provide personalized insights and follow-up questions
export interface StressAnalysis {
  overallScore: number; // 0-100 scale
  insights: string[];
  strengths: string[];
  concerns: string[];
  needsFollowUp: boolean;
  followUpQuestions: StressQuestion[];
}

// All 6 questions for the Stress Patterns section
// Designed to understand user's stress levels, triggers, and management
export const stressQuestions: StressQuestion[] = [
  {
    id: 'stress_frequency',
    text: 'How often do you experience noticeable stress in your daily life?',
    type: 'scale',
    helperText: 'Consider both minor daily stressors and more significant stress events',
    scaleLabels: ['Rarely', 'Sometimes', 'Regularly', 'Often', 'Constantly'],
    scaleRange: [1, 5]
  },
  {
    id: 'stress_intensity',
    text: 'When you do experience stress, how intense does it typically feel?',
    type: 'slider',
    helperText: 'Rate the typical intensity of your stress on a scale from mild to overwhelming',
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 5,
    unit: '/10'
  },
  {
    id: 'stress_sources',
    text: 'What are your primary sources of stress?',
    type: 'multiple_choice',
    helperText: 'Select the option that represents your biggest stress contributor',
    options: [
      { value: 'work_career', label: 'Work or career demands' },
      { value: 'relationships', label: 'Family or relationship issues' },
      { value: 'financial', label: 'Financial concerns' },
      { value: 'health', label: 'Health or physical concerns' },
      { value: 'time_management', label: 'Time management and overwhelm' },
      { value: 'multiple', label: 'Multiple sources equally' }
    ]
  },
  {
    id: 'stress_management',
    text: 'How effectively do you feel you manage your stress?',
    type: 'scale',
    helperText: 'Rate your confidence in your ability to handle and recover from stress',
    scaleLabels: ['Bad', 'Poor', 'Okay', 'Well', 'Great'],
    scaleRange: [1, 5]
  },
  {
    id: 'stress_recovery',
    text: 'How quickly do you typically recover from stressful situations?',
    type: 'multiple_choice',
    helperText: 'Think about how long it takes you to feel calm and balanced again',
    options: [
      { value: 'immediate', label: 'Almost immediately (within minutes)' },
      { value: 'quick', label: 'Within a few hours' },
      { value: 'moderate', label: 'Within a day or two' },
      { value: 'slow', label: 'Several days to a week' },
      { value: 'very_slow', label: 'Longer than a week' }
    ]
  },
  {
    id: 'stress_physical_symptoms',
    text: 'How often do you experience physical symptoms when stressed?',
    type: 'scale',
    helperText: 'Consider symptoms like tension, headaches, digestive issues, or fatigue',
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scaleRange: [1, 5]
  }
];

// Helper function to get question by index
export const getStressQuestion = (index: number): StressQuestion | null => {
  return stressQuestions[index] || null;
};

// Helper function to get total number of stress questions
export const getTotalStressQuestions = (): number => {
  return stressQuestions.length;
};

// Analyze stress responses and provide personalized insights
// Returns analysis with insights, strengths, concerns, and follow-up questions
// Note: Multi-select questions will have array values (string[]) for processing follow-up responses
export const analyzeStressResponses = (responses: Record<string, number | string | string[]>): StressAnalysis => {
  // Extract stress-specific responses
  const stressFrequency = Number(responses.stress_frequency);
  const stressIntensity = Number(responses.stress_intensity) || 5;
  const stressSources = responses.stress_sources as string;
  const stressManagement = Number(responses.stress_management);
  const stressRecovery = responses.stress_recovery as string;
  const stressPhysicalSymptoms = Number(responses.stress_physical_symptoms);

  // Initialize analysis components
  let overallScore = 0;
  const insights: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const followUpQuestions: StressQuestion[] = [];

  // Analyze stress frequency (1-5 scale, lower is better)
  if (stressFrequency <= 2) {
    overallScore += 25;
    strengths.push("You experience stress infrequently");
  } else if (stressFrequency === 3) {
    overallScore += 15;
    insights.push("Your stress levels are moderate but manageable");
  } else if (stressFrequency >= 4) {
    concerns.push("You experience stress frequently");
    insights.push("Frequent stress can impact your overall health and wellbeing");
  }

  // Analyze stress intensity (1-10 scale, lower is better)
  if (stressIntensity <= 4) {
    overallScore += 20;
    strengths.push("When you experience stress, it tends to be mild");
  } else if (stressIntensity <= 6) {
    overallScore += 10;
    insights.push("Your stress intensity is moderate - there may be ways to reduce it");
  } else if (stressIntensity >= 7) {
    concerns.push("You experience high-intensity stress");
    insights.push("High-intensity stress can significantly impact daily functioning");
  }

  // Analyze stress management (1-5 scale, higher is better)
  if (stressManagement >= 4) {
    overallScore += 25;
    strengths.push("You feel confident in managing your stress");
  } else if (stressManagement === 3) {
    overallScore += 15;
    insights.push("Your stress management skills are adequate but could be improved");
  } else if (stressManagement <= 2) {
    concerns.push("You struggle with managing stress effectively");
    insights.push("Developing better coping strategies could significantly improve your wellbeing");
  }

  // Analyze stress recovery (string values)
  if (stressRecovery === 'immediate' || stressRecovery === 'quick') {
    overallScore += 20;
    strengths.push("You recover from stress quickly");
  } else if (stressRecovery === 'moderate') {
    overallScore += 10;
    insights.push("Your stress recovery time is moderate - faster recovery could improve resilience");
  } else if (stressRecovery === 'slow' || stressRecovery === 'very_slow') {
    concerns.push("You take a long time to recover from stress");
    insights.push("Slow stress recovery can lead to chronic stress and health impacts");
  }

  // Analyze physical symptoms (1-5 scale, lower is better)
  if (stressPhysicalSymptoms <= 2) {
    overallScore += 10;
    strengths.push("You rarely experience physical symptoms from stress");
  } else if (stressPhysicalSymptoms === 3) {
    overallScore += 5;
    insights.push("You sometimes experience physical stress symptoms");
  } else if (stressPhysicalSymptoms >= 4) {
    concerns.push("You frequently experience physical symptoms when stressed");
    insights.push("Physical stress symptoms can indicate your body is under significant strain");
  }

  // Generate personalized follow-up questions based on concerns
  const needsFollowUp = concerns.length > 0 || overallScore < 60;

  if (needsFollowUp) {
    // Stress frequency follow-ups
    if (stressFrequency >= 4) {
      followUpQuestions.push({
        id: 'stress_triggers',
        text: 'What are your most common stress triggers?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding triggers helps develop targeted coping strategies',
        options: [
          { value: 'deadlines', label: 'Deadlines and time pressure' },
          { value: 'interpersonal', label: 'Interpersonal conflicts or social situations' },
          { value: 'uncertainty', label: 'Uncertainty and unpredictable situations' },
          { value: 'perfectionism', label: 'High expectations and perfectionism' },
          { value: 'workload', label: 'Heavy workload or overwhelming responsibilities' }
        ]
      });
    }

    // Stress management follow-ups
    if (stressManagement <= 3) {
      followUpQuestions.push({
        id: 'coping_strategies',
        text: 'Which stress management techniques have you tried?',
        type: 'multi_select',
        helperText: 'Select all that apply - this helps us suggest new or refined approaches',
        options: [
          { value: 'breathing_meditation', label: 'Breathing exercises or meditation' },
          { value: 'physical_activity', label: 'Physical exercise or movement' },
          { value: 'social_support', label: 'Talking with friends, family, or professionals' },
          { value: 'time_management', label: 'Better planning and time management' },
          { value: 'hobbies', label: 'Engaging in hobbies or creative activities' },
          { value: 'none', label: 'I haven\'t tried specific techniques' }
        ]
      });
    }

    // Physical symptoms follow-ups
    if (stressPhysicalSymptoms >= 4) {
      followUpQuestions.push({
        id: 'symptom_types',
        text: 'What types of physical symptoms do you most commonly experience?',
        type: 'multi_select',
        helperText: 'Select all that apply - different symptoms may indicate different stress patterns',
        options: [
          { value: 'muscle_tension', label: 'Muscle tension, neck/shoulder pain' },
          { value: 'headaches', label: 'Headaches or migraines' },
          { value: 'digestive', label: 'Digestive issues or stomach problems' },
          { value: 'sleep_issues', label: 'Sleep disruption or insomnia' },
          { value: 'fatigue', label: 'Chronic fatigue or exhaustion' }
        ]
      });
    }

    // Recovery time follow-ups
    if (stressRecovery === 'slow' || stressRecovery === 'very_slow') {
      followUpQuestions.push({
        id: 'recovery_barriers',
        text: 'What makes it difficult for you to recover from stress?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding barriers helps us suggest targeted recovery strategies',
        options: [
          { value: 'rumination', label: 'Difficulty stopping worried thoughts' },
          { value: 'ongoing_stressors', label: 'Ongoing stressful situations that don\'t resolve' },
          { value: 'perfectionism', label: 'High standards that keep me activated' },
          { value: 'lack_of_downtime', label: 'No time for proper rest and recovery' },
          { value: 'physical_symptoms', label: 'Physical symptoms that persist' },
          { value: 'sleep_issues', label: 'Poor sleep that prevents recovery' }
        ]
      });
    }

    // Stress timing and context follow-ups
    if (stressFrequency >= 3 || stressIntensity >= 6) {
      followUpQuestions.push({
        id: 'stress_timing',
        text: 'When do you typically experience the most stress during your day?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding timing patterns helps identify stress cycles',
        options: [
          { value: 'morning', label: 'Morning (getting ready, starting the day)' },
          { value: 'midday', label: 'Midday (work peak hours, lunch rush)' },
          { value: 'afternoon', label: 'Afternoon (end of workday, evening transition)' },
          { value: 'evening', label: 'Evening (family time, personal responsibilities)' },
          { value: 'night', label: 'Night (winding down, thinking about tomorrow)' },
          { value: 'varies', label: 'It varies unpredictably' }
        ]
      });
    }

    // Support system follow-ups for high stress
    if ((stressFrequency >= 4 || stressIntensity >= 7) && stressManagement <= 3) {
      followUpQuestions.push({
        id: 'support_system',
        text: 'How would you describe your current support system for managing stress?',
        type: 'scale',
        helperText: 'Consider both emotional support and practical help available to you',
        scaleLabels: ['Very poor', 'Limited', 'Adequate', 'Good', 'Excellent'],
        scaleRange: [1, 5]
      });
    }

    // Stress impact on lifestyle follow-ups
    if (stressFrequency >= 4 || stressPhysicalSymptoms >= 4) {
      followUpQuestions.push({
        id: 'stress_lifestyle_impact',
        text: 'Which areas of your life are most affected by stress?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding broader impacts helps prioritize interventions',
        options: [
          { value: 'sleep_quality', label: 'Sleep quality and duration' },
          { value: 'eating_habits', label: 'Eating patterns and food choices' },
          { value: 'relationships', label: 'Relationships and social interactions' },
          { value: 'work_performance', label: 'Work or task performance' },
          { value: 'physical_activity', label: 'Exercise and physical activity' },
          { value: 'mood_enjoyment', label: 'Mood and ability to enjoy activities' }
        ]
      });
    }

    // Workplace vs personal stress context
    if (stressSources === 'work_career' || stressSources === 'multiple') {
      followUpQuestions.push({
        id: 'work_stress_nature',
        text: 'What aspect of your work contributes most to your stress?',
        type: 'multi_select',
        helperText: 'Select all that apply - identifying specific work stressors helps target solutions',
        options: [
          { value: 'workload_volume', label: 'High workload or volume of tasks' },
          { value: 'time_pressure', label: 'Tight deadlines and time pressure' },
          { value: 'workplace_relationships', label: 'Difficult relationships with colleagues or supervisors' },
          { value: 'job_security', label: 'Job insecurity or career uncertainty' },
          { value: 'work_life_balance', label: 'Difficulty maintaining work-life balance' },
          { value: 'lack_of_control', label: 'Lack of control over decisions or processes' }
        ]
      });
    }

    // Stress perception and mindset follow-ups
    if (stressIntensity >= 7 || stressRecovery === 'slow' || stressRecovery === 'very_slow') {
      followUpQuestions.push({
        id: 'stress_mindset',
        text: 'How do you typically think about stressful situations?',
        type: 'multi_select',
        helperText: 'Select all that apply - your mindset about stress can significantly influence how it affects you',
        options: [
          { value: 'challenge_opportunity', label: 'As challenges that help me grow stronger' },
          { value: 'temporary_manageable', label: 'As temporary situations I can manage' },
          { value: 'neutral_part_of_life', label: 'As a neutral part of life that happens to everyone' },
          { value: 'threat_overwhelming', label: 'As threats that feel overwhelming' },
          { value: 'unfair_burden', label: 'As unfair burdens that shouldn\'t happen to me' },
          { value: 'depends_situation', label: 'It depends on the specific situation' }
        ]
      });
    }
  }

  return {
    overallScore: Math.min(100, overallScore),
    insights,
    strengths,
    concerns,
    needsFollowUp,
    followUpQuestions
  };
};

// Get follow-up question by index
export const getStressFollowUpQuestion = (analysis: StressAnalysis, index: number): StressQuestion | null => {
  return analysis.followUpQuestions[index] || null;
};

// Get total number of follow-up questions for a given analysis
export const getTotalStressFollowUpQuestions = (analysis: StressAnalysis): number => {
  return analysis.followUpQuestions.length;
};
