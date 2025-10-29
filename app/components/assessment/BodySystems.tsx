'use client';

// Body Systems assessment questions component
// Part of the 4-section health assessment system from PRD FR-02
export interface BodySystemsQuestion {
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

// Body systems analysis results interface
// Used to provide personalized insights and follow-up questions
export interface BodyAnalysis {
  overallScore: number; // 0-100 scale
  insights: string[];
  strengths: string[];
  concerns: string[];
  needsFollowUp: boolean;
  followUpQuestions: BodySystemsQuestion[];
}

// All 5 questions for the Body Systems section
// Designed to understand user's physical health, body harmony, and system functioning
export const bodySystemsQuestions: BodySystemsQuestion[] = [
  {
    id: 'digestive_comfort',
    text: 'How comfortable do you typically feel with your digestive system?',
    type: 'scale',
    helperText: 'Consider bloating, stomach discomfort, regularity, and how your body responds to food',
    scaleLabels: ['Bad', 'Poor', 'Neutral', 'Good', 'Great'],
    scaleRange: [1, 5]
  },
  {
    id: 'physical_strength',
    text: 'How would you rate your current physical strength and vitality?',
    type: 'scale',
    helperText: 'Think about your overall physical capability for daily activities and movement',
    scaleLabels: ['Bad', 'Poor', 'Moderate', 'Strong', 'Great'],
    scaleRange: [1, 5]
  },
  {
    id: 'immune_resilience',
    text: 'How often do you get sick or feel run down?',
    type: 'multiple_choice',
    helperText: 'Consider colds, infections, and general feelings of being unwell',
    options: [
      { value: 'rarely', label: 'Rarely (less than once per year)' },
      { value: 'occasionally', label: 'Occasionally (1-2 times per year)' },
      { value: 'regularly', label: 'Regularly (3-4 times per year)' },
      { value: 'frequently', label: 'Frequently (5+ times per year)' },
      { value: 'constantly', label: 'I feel like I\'m always fighting something off' }
    ]
  },
  {
    id: 'body_discomfort',
    text: 'How often do you experience physical discomfort, aches, or pain?',
    type: 'scale',
    helperText: 'Consider headaches, muscle tension, joint pain, or any recurring physical discomfort',
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'],
    scaleRange: [1, 5]
  },
  {
    id: 'body_satisfaction',
    text: 'How satisfied do you feel with how your body functions overall?',
    type: 'scale',
    helperText: 'Rate your overall sense of physical well-being and body harmony',
    scaleLabels: ['Bad', 'Poor', 'Neutral', 'Good', 'Great'],
    scaleRange: [1, 5]
  }
];

// Helper function to get question by index
export const getBodySystemsQuestion = (index: number): BodySystemsQuestion | null => {
  return bodySystemsQuestions[index] || null;
};

// Helper function to get total number of body systems questions
export const getTotalBodySystemsQuestions = (): number => {
  return bodySystemsQuestions.length;
};

// Analyze body systems responses and provide personalized insights
// Returns analysis with insights, strengths, concerns, and follow-up questions
// Note: Multi-select questions will have array values (string[]) for processing follow-up responses
export const analyzeBodySystemsResponses = (responses: Record<string, number | string | string[]>): BodyAnalysis => {
  // Extract body systems-specific responses
  const digestiveComfort = Number(responses.digestive_comfort);
  const physicalStrength = Number(responses.physical_strength);
  const immuneResilience = responses.immune_resilience as string;
  const bodyDiscomfort = Number(responses.body_discomfort);
  const bodySatisfaction = Number(responses.body_satisfaction);

  // Initialize analysis components
  let overallScore = 0;
  const insights: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const followUpQuestions: BodySystemsQuestion[] = [];

  // Analyze digestive comfort (1-5 scale, higher is better)
  if (digestiveComfort >= 4) {
    overallScore += 20;
    strengths.push("Your digestive system feels comfortable and well-functioning");
  } else if (digestiveComfort === 3) {
    overallScore += 12;
    insights.push("Your digestive comfort is moderate - there may be opportunities for improvement");
  } else if (digestiveComfort <= 2) {
    concerns.push("Digestive discomfort may be impacting your overall well-being");
    insights.push("Supporting digestive health could significantly improve daily comfort");
  }

  // Analyze physical strength (1-5 scale, higher is better)
  if (physicalStrength >= 4) {
    overallScore += 20;
    strengths.push("You feel strong and vital in your physical capabilities");
  } else if (physicalStrength === 3) {
    overallScore += 12;
    insights.push("Your physical strength is moderate - building vitality could enhance daily activities");
  } else if (physicalStrength <= 2) {
    concerns.push("Low physical strength may limit your daily activities and energy");
    insights.push("Building physical vitality could improve your overall quality of life");
  }

  // Analyze immune resilience (string values, less frequent illness is better)
  if (immuneResilience === 'rarely' || immuneResilience === 'occasionally') {
    overallScore += 25;
    strengths.push("Your immune system shows excellent resilience");
  } else if (immuneResilience === 'regularly') {
    overallScore += 12;
    insights.push("Getting sick regularly suggests your immune system could use support");
  } else if (immuneResilience === 'frequently' || immuneResilience === 'constantly') {
    concerns.push("Frequent illness indicates your immune system may need significant support");
    insights.push("Strengthening immune resilience should be a priority for your health");
  }

  // Analyze body discomfort (1-5 scale, lower is better)
  if (bodyDiscomfort <= 2) {
    overallScore += 20;
    strengths.push("You experience minimal physical discomfort or pain");
  } else if (bodyDiscomfort === 3) {
    overallScore += 10;
    insights.push("Occasional physical discomfort is manageable but could be addressed");
  } else if (bodyDiscomfort >= 4) {
    concerns.push("Frequent physical discomfort may indicate underlying issues");
    insights.push("Addressing sources of physical discomfort could greatly improve daily life");
  }

  // Analyze body satisfaction (1-5 scale, higher is better)
  if (bodySatisfaction >= 4) {
    overallScore += 15;
    strengths.push("You feel satisfied with how your body functions overall");
  } else if (bodySatisfaction === 3) {
    overallScore += 8;
    insights.push("Moderate body satisfaction suggests room for improvement in physical well-being");
  } else if (bodySatisfaction <= 2) {
    concerns.push("Low body satisfaction may reflect underlying health concerns");
    insights.push("Improving body satisfaction often involves addressing specific physical issues");
  }

  // Generate personalized follow-up questions based on concerns
  const needsFollowUp = concerns.length > 0 || overallScore < 60;

  if (needsFollowUp) {
    // Digestive issues follow-ups
    if (digestiveComfort <= 3) {
      followUpQuestions.push({
        id: 'digestive_symptoms',
        text: 'What digestive symptoms do you experience most commonly?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding specific symptoms helps identify targeted support strategies',
        options: [
          { value: 'bloating', label: 'Bloating or gas after meals' },
          { value: 'stomach_pain', label: 'Stomach pain or cramping' },
          { value: 'irregular_bowels', label: 'Irregular bowel movements' },
          { value: 'food_sensitivities', label: 'Reactions to certain foods' },
          { value: 'heartburn_reflux', label: 'Heartburn or acid reflux' },
          { value: 'general_discomfort', label: 'General digestive uneasiness' }
        ]
      });
    }

    // Physical strength follow-ups
    if (physicalStrength <= 3) {
      followUpQuestions.push({
        id: 'strength_limitations',
        text: 'In what areas do you notice physical strength or vitality limitations?',
        type: 'multi_select',
        helperText: 'Select all that apply - identifying specific areas helps target strength-building efforts',
        options: [
          { value: 'daily_tasks', label: 'Basic daily tasks (climbing stairs, carrying groceries)' },
          { value: 'endurance', label: 'Cardiovascular endurance and stamina' },
          { value: 'muscle_strength', label: 'Overall muscle strength' },
          { value: 'flexibility_mobility', label: 'Flexibility and mobility' },
          { value: 'energy_vitality', label: 'General energy and vitality' },
          { value: 'recovery_capacity', label: 'Recovery from physical activities' }
        ]
      });
    }

    // Immune system follow-ups
    if (immuneResilience === 'regularly' || immuneResilience === 'frequently' || immuneResilience === 'constantly') {
      followUpQuestions.push({
        id: 'illness_patterns',
        text: 'What types of illnesses do you get most frequently?',
        type: 'multi_select',
        helperText: 'Select all that apply - different illness patterns can indicate different immune system needs',
        options: [
          { value: 'respiratory_infections', label: 'Colds, flu, and respiratory infections' },
          { value: 'digestive_issues', label: 'Digestive bugs and stomach problems' },
          { value: 'chronic_fatigue', label: 'Chronic fatigue or feeling run down' },
          { value: 'recurring_infections', label: 'Recurring infections (skin, urinary, etc.)' },
          { value: 'allergic_reactions', label: 'Allergic reactions or sensitivities' },
          { value: 'slow_healing', label: 'Slow healing from cuts or injuries' }
        ]
      });
    }

    // Body discomfort follow-ups
    if (bodyDiscomfort >= 3) {
      followUpQuestions.push({
        id: 'discomfort_types',
        text: 'What types of physical discomfort do you experience most often?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding pain patterns helps identify potential causes and solutions',
        options: [
          { value: 'headaches_migraines', label: 'Headaches or migraines' },
          { value: 'muscle_tension', label: 'Muscle tension and stiffness' },
          { value: 'joint_pain', label: 'Joint pain or stiffness' },
          { value: 'back_neck_pain', label: 'Back or neck pain' },
          { value: 'general_aches', label: 'General body aches and soreness' },
          { value: 'chronic_pain', label: 'Chronic pain conditions' }
        ]
      });
    }

    // Body satisfaction follow-ups
    if (bodySatisfaction <= 3) {
      followUpQuestions.push({
        id: 'satisfaction_factors',
        text: 'What aspects of your physical health most affect your body satisfaction?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding satisfaction factors helps prioritize improvement areas',
        options: [
          { value: 'energy_levels', label: 'Overall energy levels and vitality' },
          { value: 'physical_appearance', label: 'Physical appearance and body image' },
          { value: 'physical_function', label: 'How well your body performs daily functions' },
          { value: 'pain_discomfort', label: 'Freedom from pain and discomfort' },
          { value: 'strength_fitness', label: 'Physical strength and fitness' },
          { value: 'health_resilience', label: 'Overall health and disease resistance' }
        ]
      });
    }

    // Lifestyle and body systems integration
    if (digestiveComfort <= 2 || bodyDiscomfort >= 4 || overallScore < 50) {
      followUpQuestions.push({
        id: 'lifestyle_factors',
        text: 'Which lifestyle factors do you think most impact your physical health?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding lifestyle connections helps create holistic health strategies',
        options: [
          { value: 'diet_nutrition', label: 'Diet and nutrition choices' },
          { value: 'sleep_quality', label: 'Sleep quality and duration' },
          { value: 'stress_levels', label: 'Stress levels and management' },
          { value: 'physical_activity', label: 'Physical activity and exercise' },
          { value: 'work_environment', label: 'Work environment and posture' },
          { value: 'emotional_wellbeing', label: 'Emotional well-being and mental health' }
        ]
      });
    }

    // Health management approach
    if (concerns.length >= 2 || overallScore < 40) {
      followUpQuestions.push({
        id: 'health_management',
        text: 'How do you currently approach managing your physical health?',
        type: 'multi_select',
        helperText: 'Select all that apply - understanding current approaches helps suggest complementary strategies',
        options: [
          { value: 'regular_medical_care', label: 'Regular medical check-ups and professional care' },
          { value: 'self_care_routine', label: 'Consistent self-care and wellness routines' },
          { value: 'symptom_responsive', label: 'Address issues as they arise' },
          { value: 'natural_approaches', label: 'Prefer natural and holistic approaches' },
          { value: 'minimal_intervention', label: 'Minimal intervention unless necessary' },
          { value: 'seeking_guidance', label: 'Looking for guidance on where to start' }
        ]
      });
    }

    // Recovery and resilience patterns
    if (immuneResilience === 'frequently' || immuneResilience === 'constantly' || bodyDiscomfort >= 4) {
      followUpQuestions.push({
        id: 'recovery_patterns',
        text: 'How would you describe your body\'s ability to recover and heal?',
        type: 'scale',
        helperText: 'Recovery ability affects overall resilience and health outcomes',
        scaleLabels: ['Very slow', 'Slow', 'Moderate', 'Good', 'Excellent'],
        scaleRange: [1, 5]
      });
    }

    // Body awareness and signals
    if (bodySatisfaction <= 2 || (digestiveComfort <= 2 && bodyDiscomfort >= 3)) {
      followUpQuestions.push({
        id: 'body_awareness',
        text: 'How well do you feel you understand your body\'s signals and needs?',
        type: 'scale',
        helperText: 'Body awareness helps with early intervention and better health decisions',
        scaleLabels: ['Very poor', 'Poor', 'Moderate', 'Good', 'Excellent'],
        scaleRange: [1, 5]
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
export const getBodySystemsFollowUpQuestion = (analysis: BodyAnalysis, index: number): BodySystemsQuestion | null => {
  return analysis.followUpQuestions[index] || null;
};

// Get total number of follow-up questions for a given analysis
export const getTotalBodySystemsFollowUpQuestions = (analysis: BodyAnalysis): number => {
  return analysis.followUpQuestions.length;
};
