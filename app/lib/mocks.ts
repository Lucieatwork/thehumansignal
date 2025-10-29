export function analysis() {
  return Promise.resolve({
    paragraphs: [
      "Your sleep waves show gentle variability with sage green flows — steady overall, with room to smooth your schedule for deeper recovery.",
      "Angular amber geometry points to predictable stress windows around work; short movement breaks or a 5‑minute breathing cue help the pattern relax faster.",
      "Purple rhythmic pulses highlight a strong late‑morning energy peak and a small post‑meal dip; a brief walk after lunch can stabilize the curve."
    ]
  });
}

export function timeline() {
  return Promise.resolve({
    phases: [
      { name: "Foundation Years", text: "Simple, strong base patterns that set your core rhythm." },
      { name: "Transition", text: "Added responsibility introduced mild angular stress geometry." },
      { name: "The Shift", text: "Major changes increased complexity and interaction of layers." },
      { name: "Awareness & Management", text: "Intentional habits began harmonizing competing patterns." },
      { name: "Present", text: "Full Human Signal complexity with clear opportunities to optimize next." }
    ]
  });
}

export function recommendations() {
  return Promise.resolve({
    areas: [
      { id: "preDiabetes", summary: "Stabilize post‑meal energy dips with monitoring + nutrition tweaks.", items: ["Berberine", "Chromium", "A1C test"] },
      { id: "adhdStress", summary: "Support focus and recovery with calming + executive function aids.", items: ["L-Theanine+Magnesium", "Rhodiola"] }
    ]
  });
}

export function reportExecutiveSummary() {
  return Promise.resolve({
    text: "Your Human Signal reveals a pattern of steady sleep rhythms that provide a solid foundation for your daily functioning. Your sleep duration and quality create a stable base, though bedtime consistency presents an opportunity for optimization. Your stress patterns show moderate frequency with room for enhanced recovery strategies. Your energy cycles demonstrate clear peak times that align well with productive hours, while your body systems reflect overall comfort with specific areas that could benefit from targeted support. Together, these dimensions form a Human Signal that shows strength in foundational health patterns, with clear pathways for enhancement in stress recovery and routine stabilization."
  });
}

export function reportSectionAnalysis() {
  return Promise.resolve({
    text: "Your sleep patterns reveal a foundation of adequate duration and quality that supports your daily energy needs. The consistency of your bedtime routine varies somewhat, which may impact the depth and restorative quality of your sleep cycles. While you wake feeling refreshed most mornings, the occasional sleep interruptions suggest that optimizing your sleep environment or evening routine could further enhance your sleep quality."
  });
}

export function reportRecommendations() {
  return Promise.resolve({
    recommendations: [
      {
        id: "mag_supplement",
        category: "otc",
        title: "Magnesium Supplement",
        priority: "high",
        priorityScore: 85,
        summary: "Consider adding a magnesium supplement to support sleep quality and stress recovery. Your assessment shows sleep interruptions and moderate stress levels that may benefit from magnesium's calming effects.",
        description: "Magnesium plays a crucial role in nervous system regulation and can significantly improve sleep quality by promoting muscle relaxation and supporting the body's natural stress recovery mechanisms. Research shows that many individuals have suboptimal magnesium levels, which can contribute to sleep disruptions and heightened stress responses.",
        rationale: "Your sleep interruptions and moderate stress levels suggest that magnesium supplementation could help calm your nervous system and improve sleep depth. Additionally, your energy patterns indicate that better sleep recovery could enhance your daytime energy consistency.",
        dosage: "200-400mg magnesium glycinate",
        frequency: "Once daily",
        timing: "30 minutes before bedtime",
        duration: "Start with 3 weeks, assess improvements",
        considerations: ["Take with food to minimize digestive sensitivity", "Magnesium glycinate is more bioavailable than other forms"],
        expectedBenefits: ["Improved sleep quality within 2-3 weeks", "Reduced stress recovery time", "Enhanced morning wakefulness"],
        relatedDimension: "sleep",
        relatedConcerns: ["sleep_interruptions", "moderate_stress"],
        relatedScore: 75,
        scoreImprovement: { sleep: 8, stress: 5, energy: 3, bodySystems: 2 },
        generatedByAI: true
      },
      {
        id: "walking_routine",
        category: "exercise",
        title: "Daily Walking Routine",
        priority: "moderate",
        priorityScore: 65,
        summary: "Establish a daily 20-30 minute walking routine to support energy cycles and stress management. Your assessment shows clear energy peaks that could be further optimized with consistent movement.",
        description: "Regular walking is one of the most accessible and effective forms of exercise for supporting overall health. It can help regulate energy cycles, improve stress recovery, and support cardiovascular health without requiring intensive equipment or preparation.",
        rationale: "Your energy cycles show clear peak patterns, and incorporating regular movement can help stabilize these rhythms while also supporting stress recovery. Walking is particularly effective because it's low-impact and can be easily integrated into daily routines.",
        frequency: "5-6 days per week",
        timing: "Ideally during your natural energy peaks (late morning)",
        duration: "Continue as ongoing lifestyle habit",
        considerations: ["Start with 15 minutes if 30 feels overwhelming", "Gradually increase pace as fitness improves"],
        expectedBenefits: ["Stabilized energy cycles", "Improved stress recovery", "Enhanced cardiovascular health"],
        relatedDimension: "energy",
        relatedConcerns: ["energy_consistency"],
        relatedScore: 70,
        scoreImprovement: { sleep: 2, stress: 4, energy: 7, bodySystems: 5 },
        generatedByAI: true
      },
      {
        id: "sleep_schedule",
        category: "wellness",
        title: "Consistent Sleep Schedule",
        priority: "high",
        priorityScore: 80,
        summary: "Establish a consistent bedtime and wake time to improve sleep quality and energy levels. Your assessment shows variable sleep patterns that could benefit from routine stabilization.",
        description: "Maintaining a consistent sleep schedule helps regulate your body's internal clock, leading to better sleep quality, improved energy levels, and enhanced overall well-being. Even small variations in bedtime can disrupt your circadian rhythm and impact sleep depth.",
        rationale: "Your sleep consistency patterns suggest room for improvement in establishing a regular routine. A consistent schedule can help reduce sleep latency and improve overall sleep quality, which will positively impact your energy and stress levels.",
        frequency: "Daily",
        timing: "Same bedtime and wake time every day (including weekends)",
        duration: "Ongoing lifestyle habit",
        considerations: ["Gradually adjust bedtime by 15-30 minutes if current schedule is very different", "Avoid screens 1 hour before bedtime"],
        expectedBenefits: ["Faster sleep onset", "Deeper sleep quality", "More consistent energy levels"],
        relatedDimension: "sleep",
        relatedConcerns: ["bedtime_consistency", "sleep_quality"],
        relatedScore: 75,
        scoreImprovement: { sleep: 12, stress: 3, energy: 6, bodySystems: 2 },
        generatedByAI: true
      },
      {
        id: "stress_breathing",
        category: "meditation",
        title: "Daily Breathing Exercises",
        priority: "moderate",
        priorityScore: 70,
        summary: "Practice 10-15 minutes of daily breathing exercises to improve stress management and recovery. Your assessment indicates moderate stress levels that could benefit from regular relaxation techniques.",
        description: "Controlled breathing exercises activate the parasympathetic nervous system, helping to reduce stress hormones and promote calm. Regular practice can improve your ability to manage stress in real-time and enhance overall emotional resilience.",
        rationale: "Your stress management patterns show opportunities for improvement. Daily breathing practice can help you develop better stress response patterns and improve your overall stress recovery time.",
        frequency: "Daily",
        timing: "Morning or evening, or during stressful moments",
        duration: "Ongoing practice",
        considerations: ["Start with 5 minutes and gradually increase", "Use apps or guided videos if helpful"],
        expectedBenefits: ["Reduced stress response", "Faster stress recovery", "Improved emotional regulation"],
        relatedDimension: "stress",
        relatedConcerns: ["stress_management", "stress_recovery"],
        relatedScore: 70,
        scoreImprovement: { sleep: 3, stress: 10, energy: 4, bodySystems: 3 },
        generatedByAI: true
      },
      {
        id: "protein_optimization",
        category: "diet",
        title: "Optimize Protein Intake",
        priority: "moderate",
        priorityScore: 60,
        summary: "Increase protein intake to support energy stability and body system function. Your assessment suggests opportunities to optimize nutrition for better energy consistency throughout the day.",
        description: "Adequate protein intake helps stabilize blood sugar levels, supports muscle maintenance, and provides sustained energy. Many people don't get enough protein, especially at breakfast, which can lead to energy crashes and cravings.",
        rationale: "Your energy patterns show some inconsistency that may be related to blood sugar fluctuations. Optimizing protein intake, especially in the morning, can help stabilize your energy levels throughout the day.",
        dosage: "1.2-1.6g protein per kg body weight daily",
        frequency: "Distributed across all meals",
        timing: "Especially important at breakfast and snacks",
        duration: "Ongoing dietary adjustment",
        considerations: ["Include protein in every meal and snack", "Choose lean sources like fish, poultry, legumes"],
        expectedBenefits: ["Stabilized energy levels", "Reduced afternoon crashes", "Better muscle maintenance"],
        relatedDimension: "energy",
        relatedConcerns: ["energy_consistency", "energy_crashes"],
        relatedScore: 70,
        scoreImprovement: { sleep: 2, stress: 3, energy: 8, bodySystems: 6 },
        generatedByAI: true
      },
      {
        id: "hydration_optimization",
        category: "wellness",
        title: "Optimize Daily Hydration",
        priority: "ongoing",
        priorityScore: 45,
        summary: "Improve daily hydration habits to support all body systems and energy levels. Proper hydration is foundational for optimal health and can improve multiple aspects of your Human Signal.",
        description: "Adequate hydration supports every system in your body, from brain function to joint health. Many people are chronically dehydrated, which can impact energy, mood, sleep quality, and physical performance.",
        rationale: "Your body systems and energy patterns could benefit from improved hydration. Even mild dehydration can impact cognitive function, energy levels, and physical comfort.",
        frequency: "Throughout the day",
        timing: "Consistent intake, not just when thirsty",
        duration: "Ongoing lifestyle habit",
        considerations: ["Aim for 8-10 glasses of water daily", "Monitor urine color (should be pale yellow)"],
        expectedBenefits: ["Improved energy levels", "Better cognitive function", "Enhanced physical comfort"],
        relatedDimension: "bodySystems",
        relatedConcerns: ["overall_wellness", "energy_levels"],
        relatedScore: 80,
        scoreImprovement: { sleep: 2, stress: 2, energy: 4, bodySystems: 5 },
        generatedByAI: true
      },
      {
        id: "evening_wind_down",
        category: "wellness",
        title: "Evening Wind-Down Routine",
        priority: "moderate",
        priorityScore: 55,
        summary: "Create a consistent evening wind-down routine to improve sleep quality and stress recovery. Your assessment suggests that evening habits could be optimized for better rest.",
        description: "A structured evening routine signals to your body that it's time to prepare for sleep, helping to improve sleep onset and quality. This can include activities like reading, gentle stretching, or meditation.",
        rationale: "Your sleep patterns and stress levels suggest that a more structured evening routine could help improve sleep quality and reduce stress. A wind-down routine helps transition from active to restful state.",
        frequency: "Daily",
        timing: "1-2 hours before bedtime",
        duration: "Ongoing routine",
        considerations: ["Keep it simple and consistent", "Avoid stimulating activities or screens"],
        expectedBenefits: ["Faster sleep onset", "Improved sleep quality", "Better stress recovery"],
        relatedDimension: "sleep",
        relatedConcerns: ["sleep_quality", "bedtime_routine"],
        relatedScore: 75,
        scoreImprovement: { sleep: 6, stress: 4, energy: 3, bodySystems: 2 },
        generatedByAI: true
      },
      {
        id: "stress_boundaries",
        category: "wellness",
        title: "Set Work-Life Boundaries",
        priority: "moderate",
        priorityScore: 60,
        summary: "Establish clear boundaries between work and personal time to improve stress management and overall well-being. Your assessment indicates stress patterns that could benefit from better boundary management.",
        description: "Clear boundaries help prevent work stress from spilling into personal time and vice versa. This includes setting specific work hours, creating physical or mental separation, and learning to say no to excessive demands.",
        rationale: "Your stress patterns suggest that work-life balance could be improved. Setting clear boundaries can help reduce chronic stress and improve your ability to recover from daily stressors.",
        frequency: "Daily practice",
        timing: "Throughout the day, especially during transitions",
        duration: "Ongoing boundary maintenance",
        considerations: ["Start small with one boundary", "Communicate boundaries clearly to others"],
        expectedBenefits: ["Reduced chronic stress", "Better work-life balance", "Improved recovery time"],
        relatedDimension: "stress",
        relatedConcerns: ["stress_management", "work_life_balance"],
        relatedScore: 70,
        scoreImprovement: { sleep: 3, stress: 8, energy: 4, bodySystems: 3 },
        generatedByAI: true
      }
    ]
  });
}
