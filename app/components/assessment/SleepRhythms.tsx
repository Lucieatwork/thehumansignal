'use client';

// Sleep Rhythms assessment questions component
// Part of the 4-section health assessment system from PRD FR-02
export interface SleepQuestion {
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
  // Multiple choice and multi-select specific properties
  options?: { value: string; label: string }[];
  // Scale specific properties
  scaleLabels?: string[];
  scaleRange?: [number, number];
}

// Sleep analysis results interface
// Used to provide personalized insights and follow-up questions
export interface SleepAnalysis {
  overallScore: number; // 0-100 scale
  insights: string[];
  strengths: string[];
  concerns: string[];
  needsFollowUp: boolean;
  followUpQuestions: SleepQuestion[];
}

// All 6 questions for the Sleep Rhythms section
// Designed to understand user's sleep patterns and quality
export const sleepQuestions: SleepQuestion[] = [
  {
    id: 'sleep_duration',
    text: 'On average, how many hours of sleep do you get per night?',
    type: 'slider',
    helperText: 'Move the slider to select your average sleep duration',
    min: 3,
    max: 12,
    step: 0.5,
    defaultValue: 7.5,
    unit: 'hours'
  },
  {
    id: 'sleep_quality',
    text: 'How would you rate the overall quality of your sleep?',
    type: 'scale',
    helperText: 'Select the option that best describes your typical sleep quality',
    scaleLabels: ['Bad', 'Poor', 'Fair', 'Good', 'Great'],
    scaleRange: [1, 5]
  },
  {
    id: 'bedtime_consistency',
    text: 'How consistent is your bedtime from night to night?',
    type: 'multiple_choice',
    helperText: 'Think about your typical week, including weekends',
    options: [
      { value: 'very_consistent', label: 'Very consistent (within 30 minutes)' },
      { value: 'mostly_consistent', label: 'Mostly consistent (within 1 hour)' },
      { value: 'somewhat_variable', label: 'Somewhat variable (1-2 hours difference)' },
      { value: 'highly_variable', label: 'Highly variable (more than 2 hours difference)' }
    ]
  },
  {
    id: 'wake_feeling',
    text: 'How do you typically feel when you wake up in the morning?',
    type: 'scale',
    helperText: 'Rate your typical morning energy and alertness level',
    scaleLabels: ['Bad', 'Poor', 'Neutral', 'Good', 'Great'],
    scaleRange: [1, 5]
  },
  {
    id: 'sleep_interruptions',
    text: 'How often do you experience sleep interruptions during the night?',
    type: 'multiple_choice',
    helperText: 'Consider any awakenings that last more than a few minutes',
    options: [
      { value: 'never', label: 'Never or rarely' },
      { value: 'occasionally', label: 'Occasionally (1-2 times per week)' },
      { value: 'regularly', label: 'Regularly (3-4 times per week)' },
      { value: 'frequently', label: 'Frequently (5+ times per week)' }
    ]
  },
  {
    id: 'daytime_sleepiness',
    text: 'How often do you feel sleepy or drowsy during the day?',
    type: 'scale',
    helperText: 'Rate how frequently you experience daytime sleepiness',
    scaleLabels: ['Never', 'Rarely', 'Some', 'Often', 'Always'],
    scaleRange: [1, 5]
  }
];

// Helper function to get question by index
export const getSleepQuestion = (index: number): SleepQuestion | null => {
  return sleepQuestions[index] || null;
};

// Helper function to get total number of sleep questions
export const getTotalSleepQuestions = (): number => {
  return sleepQuestions.length;
};

// Analyze sleep responses and provide personalized insights
// Returns analysis with insights, strengths, concerns, and follow-up questions
// Note: Multi-select questions will have array values (string[]) for processing follow-up responses
export const analyzeSleepResponses = (responses: Record<string, number | string | string[]>): SleepAnalysis => {
  // Extract sleep-specific responses
  const sleepDuration = Number(responses.sleep_duration) || 7.5;
  const sleepQuality = Number(responses.sleep_quality);
  const bedtimeConsistency = responses.bedtime_consistency as string;
  const wakeFeeling = Number(responses.wake_feeling);
  const sleepInterruptions = responses.sleep_interruptions as string;
  const daytimeSleepiness = Number(responses.daytime_sleepiness);

  // Initialize analysis components
  let overallScore = 0;
  const insights: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const followUpQuestions: SleepQuestion[] = [];

  // Analyze sleep duration (optimal range: 7-9 hours)
  if (sleepDuration >= 7 && sleepDuration <= 9) {
    overallScore += 20;
    strengths.push("You're getting an appropriate amount of sleep");
  } else if (sleepDuration >= 6 && sleepDuration < 7) {
    overallScore += 10;
    concerns.push("You may benefit from getting a bit more sleep");
    insights.push("Most adults need 7-9 hours of sleep for optimal health");
  } else if (sleepDuration < 6) {
    concerns.push("You're getting significantly less sleep than recommended");
    insights.push("Short sleep duration can impact energy, mood, and overall health");
  } else if (sleepDuration > 9) {
    concerns.push("You may be sleeping more than necessary");
    insights.push("Excessive sleep can sometimes indicate underlying health issues");
  }

  // Analyze sleep quality
  if (sleepQuality >= 4) {
    overallScore += 25;
    strengths.push("You feel your sleep quality is good to excellent");
  } else if (sleepQuality === 3) {
    overallScore += 15;
    insights.push("Your sleep quality is fair - there may be room for improvement");
  } else if (sleepQuality <= 2) {
    concerns.push("Your sleep quality needs attention");
    insights.push("Poor sleep quality can significantly impact daily functioning");
  }

  // Analyze bedtime consistency
  if (bedtimeConsistency === 'very_consistent' || bedtimeConsistency === 'mostly_consistent') {
    overallScore += 20;
    strengths.push("You maintain good bedtime consistency");
  } else if (bedtimeConsistency === 'somewhat_variable') {
    overallScore += 10;
    insights.push("More consistent bedtimes could improve your sleep quality");
  } else if (bedtimeConsistency === 'highly_variable') {
    concerns.push("Your irregular bedtime may be affecting your sleep quality");
    insights.push("A consistent sleep schedule helps regulate your body's internal clock");
  }

  // Analyze wake feeling
  if (wakeFeeling >= 4) {
    overallScore += 20;
    strengths.push("You wake up feeling refreshed and energized");
  } else if (wakeFeeling === 3) {
    overallScore += 10;
    insights.push("You wake up feeling neutral - optimizing sleep could help you feel more energized");
  } else if (wakeFeeling <= 2) {
    concerns.push("You're not waking up feeling refreshed");
    insights.push("How you feel upon waking is a key indicator of sleep quality");
  }

  // Analyze sleep interruptions
  if (sleepInterruptions === 'never') {
    overallScore += 15;
    strengths.push("You maintain uninterrupted sleep");
  } else if (sleepInterruptions === 'occasionally') {
    overallScore += 10;
    insights.push("Occasional sleep interruptions are normal but worth monitoring");
  } else if (sleepInterruptions === 'regularly' || sleepInterruptions === 'frequently') {
    concerns.push("Frequent sleep interruptions may be impacting your rest quality");
    insights.push("Regular sleep disruptions can prevent you from reaching deep, restorative sleep stages");
  }

  // Generate personalized follow-up questions based on concerns
  const needsFollowUp = concerns.length > 0 || overallScore < 60;

  if (needsFollowUp) {
    // Add follow-up questions based on specific concerns
    
    // Sleep duration follow-ups
    if (sleepDuration < 7) {
      followUpQuestions.push({
        id: 'sleep_obstacles',
        text: 'What are the main things that prevent you from getting more sleep?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding barriers helps us provide better recommendations',
        options: [
          { value: 'work_schedule', label: 'Work schedule or responsibilities' },
          { value: 'trouble_falling_asleep', label: 'Difficulty falling asleep' },
          { value: 'evening_activities', label: 'Evening activities or screen time' },
          { value: 'family_obligations', label: 'Family or caregiving obligations' }
        ]
      });
    }

    // Sleep quality follow-ups
    if (sleepQuality <= 3) {
      followUpQuestions.push({
        id: 'sleep_environment',
        text: 'How would you rate your sleep environment?',
        type: 'scale',
        helperText: 'Consider factors like room temperature, noise, light, and comfort',
        scaleLabels: ['Bad', 'Poor', 'Fair', 'Good', 'Great'],
        scaleRange: [1, 5]
      });
    }

    // Bedtime consistency follow-ups
    if (bedtimeConsistency === 'highly_variable' || bedtimeConsistency === 'somewhat_variable') {
      followUpQuestions.push({
        id: 'bedtime_routine',
        text: 'Do you have a regular pre-sleep routine?',
        type: 'multiple_choice',
        helperText: 'A consistent routine helps signal your body to prepare for sleep',
        options: [
          { value: 'consistent_routine', label: 'Yes, I have a consistent routine I follow most nights' },
          { value: 'sometimes_routine', label: 'Sometimes, but it varies' },
          { value: 'no_routine', label: 'No, I don\'t have a regular routine' }
        ]
      });
    }

    // Sleep interruption follow-ups
    if (sleepInterruptions === 'regularly' || sleepInterruptions === 'frequently') {
      followUpQuestions.push({
        id: 'interruption_causes',
        text: 'What typically causes your sleep interruptions?',
        type: 'multi_select',
        helperText: 'Select all that apply - identifying causes helps us suggest targeted solutions',
        options: [
          { value: 'bathroom_trips', label: 'Need to use the bathroom' },
          { value: 'noise', label: 'External noise or sounds' },
          { value: 'temperature', label: 'Room temperature or comfort' },
          { value: 'thoughts_worry', label: 'Racing thoughts or worry' },
          { value: 'partner_pet', label: 'Partner or pet movements' },
          { value: 'unknown', label: 'Not sure what wakes me up' }
        ]
      });
    }

    // Daytime sleepiness follow-ups
    if (daytimeSleepiness >= 4) {
      followUpQuestions.push({
        id: 'energy_patterns',
        text: 'When do you typically feel most alert and energized?',
        type: 'multiple_choice',
        helperText: 'Understanding your natural rhythm helps optimize your schedule',
        options: [
          { value: 'early_morning', label: 'Early morning (6-9 AM)' },
          { value: 'mid_morning', label: 'Mid-morning (9-12 PM)' },
          { value: 'afternoon', label: 'Afternoon (12-5 PM)' },
          { value: 'evening', label: 'Evening (5-9 PM)' },
          { value: 'night', label: 'Night (9 PM or later)' },
          { value: 'varies', label: 'It varies from day to day' }
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
export const getSleepFollowUpQuestion = (analysis: SleepAnalysis, index: number): SleepQuestion | null => {
  return analysis.followUpQuestions[index] || null;
};

// Get total number of follow-up questions for a given analysis
export const getTotalFollowUpQuestions = (analysis: SleepAnalysis): number => {
  return analysis.followUpQuestions.length;
};
