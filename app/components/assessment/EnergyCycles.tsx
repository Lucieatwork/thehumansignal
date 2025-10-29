'use client';

// Energy Cycles assessment questions component
// Part of the 4-section health assessment system from PRD FR-02
export interface EnergyQuestion {
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

// Energy analysis results interface
// Used to provide personalized insights and follow-up questions
export interface EnergyAnalysis {
  overallScore: number; // 0-100 scale
  insights: string[];
  strengths: string[];
  concerns: string[];
  needsFollowUp: boolean;
  followUpQuestions: EnergyQuestion[];
}

// All 5 questions for the Energy Cycles section
// Designed to understand user's natural energy patterns and rhythms
export const energyQuestions: EnergyQuestion[] = [
  {
    id: 'energy_peak_time',
    text: 'When do you typically feel most energized during the day?',
    type: 'multiple_choice',
    helperText: 'Think about when you naturally feel most alert and productive',
    options: [
      { value: 'early_morning', label: 'Early morning (5am - 8am)' },
      { value: 'mid_morning', label: 'Mid-morning (8am - 11am)' },
      { value: 'midday', label: 'Midday (11am - 2pm)' },
      { value: 'afternoon', label: 'Afternoon (2pm - 5pm)' },
      { value: 'early_evening', label: 'Early evening (5pm - 8pm)' },
      { value: 'late_evening', label: 'Late evening (8pm onwards)' }
    ]
  },
  {
    id: 'energy_consistency',
    text: 'How consistent is your energy level from day to day?',
    type: 'scale',
    helperText: 'Rate how predictable your daily energy patterns are',
    scaleLabels: ['Bad', 'Poor', 'Fair', 'Good', 'Great'],
    scaleRange: [1, 5]
  },
  {
    id: 'weekly_energy_pattern',
    text: 'How does your energy typically change throughout the week?',
    type: 'multiple_choice',
    helperText: 'Consider your energy patterns from Monday through Sunday',
    options: [
      { value: 'starts_high_decreases', label: 'Starts high, gradually decreases toward weekend' },
      { value: 'builds_up', label: 'Builds up momentum as the week progresses' },
      { value: 'midweek_peak', label: 'Peaks in the middle of the week' },
      { value: 'weekend_boost', label: 'Gets a boost on weekends' },
      { value: 'fairly_consistent', label: 'Stays fairly consistent throughout the week' }
    ]
  },
  {
    id: 'energy_crash_frequency',
    text: 'How often do you experience noticeable energy crashes or dips?',
    type: 'scale',
    helperText: 'Consider sudden drops in energy that affect your ability to focus or be active',
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Daily'],
    scaleRange: [1, 5]
  },
  {
    id: 'recovery_time',
    text: 'After physical or mental exertion, how long does it typically take you to feel energized again?',
    type: 'multiple_choice',
    helperText: 'Think about your recovery time after exercise, work, or mentally demanding activities',
    options: [
      { value: 'immediate', label: 'Almost immediately (within 15 minutes)' },
      { value: 'quick', label: '15-60 minutes' },
      { value: 'moderate', label: '1-3 hours' },
      { value: 'extended', label: '4-8 hours' },
      { value: 'overnight', label: 'Need a full night\'s sleep' },
      { value: 'multiday', label: 'Several days to feel fully recovered' }
    ]
  }
];

// Helper function to get question by index
export const getEnergyQuestion = (index: number): EnergyQuestion | null => {
  return energyQuestions[index] || null;
};

// Helper function to get total number of energy questions
export const getTotalEnergyQuestions = (): number => {
  return energyQuestions.length;
};

// Analyze energy responses and provide personalized insights
// Returns analysis with insights, strengths, concerns, and follow-up questions
export const analyzeEnergyResponses = (responses: Record<string, number | string>): EnergyAnalysis => {
  // Extract energy-specific responses
  const energyPeakTime = responses.energy_peak_time as string;
  const energyConsistency = Number(responses.energy_consistency);
  const weeklyEnergyPattern = responses.weekly_energy_pattern as string;
  const energyCrashFrequency = Number(responses.energy_crash_frequency);
  const recoveryTime = responses.recovery_time as string;

  // Initialize analysis components
  let overallScore = 0;
  const insights: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const followUpQuestions: EnergyQuestion[] = [];

  // Analyze energy consistency (1-5 scale, higher is better)
  if (energyConsistency >= 4) {
    overallScore += 25;
    strengths.push("You have consistent and predictable energy patterns");
  } else if (energyConsistency === 3) {
    overallScore += 15;
    insights.push("Your energy consistency is moderate - there may be room for improvement");
  } else if (energyConsistency <= 2) {
    concerns.push("Inconsistent energy patterns may be affecting your daily productivity");
    insights.push("Establishing more consistent routines could help stabilize your energy");
  }

  // Analyze energy crash frequency (1-5 scale, lower is better)
  if (energyCrashFrequency <= 2) {
    overallScore += 25;
    strengths.push("You rarely experience disruptive energy crashes");
  } else if (energyCrashFrequency === 3) {
    overallScore += 15;
    insights.push("You experience occasional energy dips - identifying triggers could help");
  } else if (energyCrashFrequency >= 4) {
    concerns.push("Frequent energy crashes could signal underlying imbalances");
    insights.push("Regular energy crashes can significantly impact focus and productivity");
  }

  // Analyze recovery time (string values, faster is better)
  if (recoveryTime === 'immediate' || recoveryTime === 'quick') {
    overallScore += 20;
    strengths.push("You recover from exertion quickly and efficiently");
  } else if (recoveryTime === 'moderate') {
    overallScore += 10;
    insights.push("Your recovery time is moderate - optimizing rest could improve efficiency");
  } else if (recoveryTime === 'extended' || recoveryTime === 'overnight' || recoveryTime === 'multiday') {
    concerns.push("Extended recovery times may indicate energy depletion");
    insights.push("Slow energy recovery can limit your ability to maintain consistent performance");
  }

  // Analyze energy peak time (chronotype implications)
  if (energyPeakTime === 'early_morning' || energyPeakTime === 'mid_morning') {
    overallScore += 15;
    strengths.push("You have a morning chronotype with early peak energy");
    insights.push("Morning chronotypes often have more consistent energy throughout the day");
  } else if (energyPeakTime === 'midday') {
    overallScore += 10;
    insights.push("Midday energy peaks suggest a balanced circadian rhythm");
  } else if (energyPeakTime === 'afternoon') {
    overallScore += 8;
    insights.push("Afternoon peaks may indicate delayed circadian rhythms");
  } else if (energyPeakTime === 'early_evening' || energyPeakTime === 'late_evening') {
    overallScore += 5;
    insights.push("Evening chronotypes may experience more energy variability during the day");
  }

  // Analyze weekly energy pattern (sustainability indicators)
  if (weeklyEnergyPattern === 'fairly_consistent') {
    overallScore += 15;
    strengths.push("Your energy remains stable throughout the week");
  } else if (weeklyEnergyPattern === 'builds_up') {
    overallScore += 12;
    insights.push("Your energy builds momentum - this can be sustainable if managed well");
  } else if (weeklyEnergyPattern === 'midweek_peak') {
    overallScore += 8;
    insights.push("Midweek peaks may indicate good work-life balance but watch for burnout");
  } else if (weeklyEnergyPattern === 'weekend_boost') {
    overallScore += 5;
    concerns.push("Depending on weekends for energy recovery may indicate work-related depletion");
    insights.push("Weekend energy boosts often signal the need for better weekday energy management");
  } else if (weeklyEnergyPattern === 'starts_high_decreases') {
    concerns.push("Energy declining through the week could lead to burnout");
    insights.push("Starting strong but declining suggests unsustainable energy expenditure patterns");
  }

  // Generate personalized follow-up questions based on concerns
  const needsFollowUp = concerns.length > 0 || overallScore < 60;

  if (needsFollowUp) {
    // Energy consistency follow-ups
    if (energyConsistency <= 3) {
      followUpQuestions.push({
        id: 'energy_factors',
        text: 'What factors do you think most affect your daily energy levels?',
        type: 'multiple_choice',
        helperText: 'Understanding your energy influences helps develop targeted strategies',
        options: [
          { value: 'sleep_quality', label: 'Sleep quality and duration' },
          { value: 'meal_timing', label: 'Meal timing and food choices' },
          { value: 'physical_activity', label: 'Physical activity and movement' },
          { value: 'stress_levels', label: 'Stress levels and mental load' },
          { value: 'weather_season', label: 'Weather or seasonal changes' },
          { value: 'work_schedule', label: 'Work schedule and demands' }
        ]
      });
    }

    // Energy crash follow-ups
    if (energyCrashFrequency >= 4) {
      followUpQuestions.push({
        id: 'crash_timing',
        text: 'When do your energy crashes typically occur?',
        type: 'multiple_choice',
        helperText: 'Timing patterns can help identify specific triggers',
        options: [
          { value: 'mid_morning', label: 'Mid-morning (9-11 AM)' },
          { value: 'post_lunch', label: 'After lunch (1-3 PM)' },
          { value: 'late_afternoon', label: 'Late afternoon (3-5 PM)' },
          { value: 'early_evening', label: 'Early evening (5-7 PM)' },
          { value: 'varies_daily', label: 'Varies from day to day' },
          { value: 'multiple_times', label: 'Multiple times throughout the day' }
        ]
      });
    }

    // Recovery time follow-ups
    if (recoveryTime === 'extended' || recoveryTime === 'overnight' || recoveryTime === 'multiday') {
      followUpQuestions.push({
        id: 'recovery_barriers',
        text: 'What makes it difficult for you to recover your energy?',
        type: 'multiple_choice',
        helperText: 'Understanding recovery barriers helps improve energy restoration',
        options: [
          { value: 'poor_sleep', label: 'Poor sleep quality or insufficient rest' },
          { value: 'ongoing_stress', label: 'Ongoing stress or mental demands' },
          { value: 'physical_fatigue', label: 'Physical fatigue that persists' },
          { value: 'busy_schedule', label: 'No time for proper rest and recovery' },
          { value: 'nutrition_issues', label: 'Irregular eating or poor nutrition' },
          { value: 'lack_of_movement', label: 'Too little physical activity or movement' }
        ]
      });
    }

    // Chronotype optimization follow-ups
    if (energyPeakTime === 'early_evening' || energyPeakTime === 'late_evening') {
      followUpQuestions.push({
        id: 'evening_energy_challenges',
        text: 'How does your evening energy peak affect your daily routine?',
        type: 'multiple_choice',
        helperText: 'Understanding chronotype challenges helps optimize your schedule',
        options: [
          { value: 'morning_struggles', label: 'I struggle with morning productivity' },
          { value: 'sleep_delayed', label: 'I have trouble falling asleep at night' },
          { value: 'social_conflicts', label: 'It conflicts with work or social schedules' },
          { value: 'afternoon_crashes', label: 'I experience significant afternoon energy dips' },
          { value: 'works_well', label: 'It actually works well for my lifestyle' },
          { value: 'weekend_shift', label: 'My pattern shifts significantly on weekends' }
        ]
      });
    }

    // Weekly pattern optimization follow-ups
    if (weeklyEnergyPattern === 'starts_high_decreases' || weeklyEnergyPattern === 'weekend_boost') {
      followUpQuestions.push({
        id: 'weekly_energy_strategies',
        text: 'What strategies have you tried to maintain energy throughout the week?',
        type: 'multiple_choice',
        helperText: 'This helps us suggest new approaches for consistent weekly energy',
        options: [
          { value: 'schedule_breaks', label: 'Scheduling regular breaks and downtime' },
          { value: 'workout_routine', label: 'Maintaining consistent exercise routines' },
          { value: 'meal_planning', label: 'Planning meals and nutrition throughout the week' },
          { value: 'sleep_schedule', label: 'Keeping consistent sleep and wake times' },
          { value: 'workload_management', label: 'Managing workload and expectations' },
          { value: 'none_tried', label: 'I haven\'t tried specific strategies yet' }
        ]
      });
    }

    // Energy optimization tools follow-up
    if (energyCrashFrequency >= 3 || energyConsistency <= 3) {
      followUpQuestions.push({
        id: 'energy_tracking',
        text: 'Have you ever tracked your energy patterns systematically?',
        type: 'multiple_choice',
        helperText: 'Tracking can reveal patterns and help optimize your energy',
        options: [
          { value: 'detailed_tracking', label: 'Yes, I track energy levels regularly' },
          { value: 'occasional_tracking', label: 'Sometimes, but not consistently' },
          { value: 'informal_awareness', label: 'I notice patterns but don\'t track formally' },
          { value: 'no_tracking', label: 'No, I haven\'t tracked my energy patterns' },
          { value: 'want_to_start', label: 'I\'d like to start tracking but need guidance' }
        ]
      });
    }

    // Energy and lifestyle integration
    if (overallScore < 60) {
      followUpQuestions.push({
        id: 'energy_priorities',
        text: 'What aspects of your energy patterns would you most like to improve?',
        type: 'multiple_choice',
        helperText: 'Understanding your priorities helps focus improvement efforts',
        options: [
          { value: 'morning_energy', label: 'Having more energy in the morning' },
          { value: 'sustained_energy', label: 'Maintaining energy throughout the day' },
          { value: 'faster_recovery', label: 'Recovering from activities more quickly' },
          { value: 'fewer_crashes', label: 'Reducing sudden energy dips or crashes' },
          { value: 'evening_vitality', label: 'Having energy for evening activities' },
          { value: 'weekend_consistency', label: 'Maintaining energy patterns on weekends' }
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
export const getEnergyFollowUpQuestion = (analysis: EnergyAnalysis, index: number): EnergyQuestion | null => {
  return analysis.followUpQuestions[index] || null;
};

// Get total number of follow-up questions for a given analysis
export const getTotalEnergyFollowUpQuestions = (analysis: EnergyAnalysis): number => {
  return analysis.followUpQuestions.length;
};
