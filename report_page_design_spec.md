# Full Report Page - Detailed Design Specification

## Overview
A comprehensive, personalized health report that synthesizes assessment data into actionable insights and recommendations. Designed with mid-century modern aesthetics, progressive disclosure, and AI-powered personalization.

---

## Page Structure & Flow

### 1. **Hero/Cover Section**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│         [Human Signal Logo/Icon]               │
│                                                 │
│         Your Human Signal Report                │
│         Generated [Date/Time]                  │
│                                                 │
│         [Complete Human Signal Chart]           │
│         [LayeredRadarChart - full visualization]│
│                                                 │
│         Overall Score: [XX]                     │
│         [Color-coded metric bar]                │
│                                                 │
│         [Subtle geometric pattern overlay]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Elements:**
- Large, letter-spaced title: "Your Human Signal Report"
- Generation timestamp (formatted nicely: "Generated on January 15, 2025")
- **Complete Human Signal Chart** - Full LayeredRadarChart visualization (non-animated for print/static context)
- Overall score displayed prominently with color-coded status
- Minimal, mid-century geometric pattern as background texture
- Smooth fade-in animation on load
- Back button to findings page (top-left)
- Sticky navigation bar appears on scroll (if implementing section nav)

---

### 2. **Executive Narrative Summary**
```
┌─────────────────────────────────────────────────┐
│ Understanding Your Signal                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ [3-4 paragraph AI-generated narrative]          │
│                                                 │
│ Your assessment reveals... [personalized story] │
│                                                 │
│ The relationship between your sleep patterns... │
│                                                 │
│ Your energy cycles reflect...                   │
│                                                 │
│ Together, these dimensions form...              │
│                                                 │
│ [Subtle gradient accent line beneath]           │
└─────────────────────────────────────────────────┘
```

**Content Generation Logic:**
- Synthesize all 4 dimension scores
- Identify dominant patterns (strengths/concerns)
- Create cohesive narrative connecting dimensions
- Balanced tone: scientific yet empathetic
- 3-4 paragraphs, ~200-300 words total
- Use "Human Signal" terminology consistently

**Visual:**
- Wide column (max-width for readability)
- Generous spacing above/below
- Subtle accent line using color gradient (Indigo → Periwinkle → Violet)
- Small geometric icon/illustration on one side (subtle)

---

### 3. **Analysis Summaries (4 Sections)**

Each section follows this structure with progressive disclosure:

#### Section Card (Collapsed State)
```
┌─────────────────────────────────────────────────┐
│ [Color Bar Header]                               │
│ 1. SLEEP RHYTHMS                      [75%] [▼] │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Mini radar visualization - small inline]      │
│                                                 │
│ [AI-generated summary paragraph]                │
│ Your sleep patterns reveal a foundation of...   │
│                                                 │
│ ✓ Strengths (2-3 items shown)                   │
│ ⚠ Areas for Attention (2-3 items shown)        │
│                                                 │
│ [Expand for full details] [Button/Link]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Section Card (Expanded State)
```
┌─────────────────────────────────────────────────┐
│ [Color Bar Header - Same]                       │
│ 1. SLEEP RHYTHMS                      [75%] [▲] │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Full radar visualization - larger]             │
│                                                 │
│ [Complete AI-generated analysis - 2-3 paras]    │
│                                                 │
│ ✓ Strengths:                                   │
│   • [Full list from analysis]                   │
│   • [Each with brief explanation]               │
│                                                 │
│ ⚠ Areas for Attention:                         │
│   • [Full list from analysis]                   │
│   • [Each with context]                         │
│                                                 │
│ Key Metrics:                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │Duration│ │Quality│ │Consist.│ │Feeling│   │
│ │ 7.5hr │ │ Good │ │Moderate│ │ Fair │       │
│ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                 │
│ [Collapse] [Button/Link]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Section Configuration:**
| Section | Color | Header Color |
|---------|-------|--------------|
| Sleep Rhythms | #4b6fa8 (Indigo) | Indigo gradient |
| Stress Patterns | #7a8cc4 (Periwinkle) | Periwinkle gradient |
| Energy Cycles | #8a6fa3 (Violet) | Violet gradient |
| Body Systems | #d95e40 (Red-Orange) | Red-Orange gradient |

**Progressive Disclosure Logic:**
- All sections start collapsed
- User can expand/collapse individually
- Smooth accordion animation (height transition)
- Icon rotates (▼ → ▲)
- Expanded state loads full visualization and complete text

---

### 4. **Recommendations Section**

**Structure: Priority-Based Layout**

```
┌─────────────────────────────────────────────────┐
│ Your Personalized Recommendations               │
├─────────────────────────────────────────────────┤
│                                                 │
│ Showing 8 recommendations                      │
│ [Show 4 More] [Button - Red-Orange]            │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ HIGH PRIORITY                                │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│ │ │ [Card 1] │ │ [Card 2] │ │ [Card 3] │    │ │
│ │ └──────────┘ └──────────┘ └──────────┘    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ MODERATE PRIORITY                            │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│ │ │ [Card 4] │ │ [Card 5] │ │ [Card 6] │    │ │
│ │ └──────────┘ └──────────┘ └──────────┘    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ ONGOING LIFESTYLE SUPPORT                    │ │
│ │ ┌──────────┐ ┌──────────┐                   │ │
│ │ │ [Card 7] │ │ [Card 8] │                   │ │
│ │ └──────────┘ └──────────┘                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Recommendation Card Design (Collapsed)**
```
┌─────────────────────────────────────────────────┐
│ [Category Badge]                      [Priority] │
│ OTC REMEDIES                           [HIGH]    │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Geometric Icon/Illustration]                    │
│                                                 │
│ Magnesium Supplement                            │
│ [Bold, uppercase, letter-spaced]                │
│                                                 │
│ [Summary paragraph - 2-3 sentences]             │
│ Consider adding a magnesium supplement to...     │
│                                                 │
│ Why this matters:                                │
│ Your sleep interruptions and moderate stress... │
│                                                 │
│ [Show details] [Link/Button]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Recommendation Card Design (Expanded)**
```
┌─────────────────────────────────────────────────┐
│ [Category Badge]                      [Priority] │
│ OTC REMEDIES                           [HIGH]    │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Geometric Icon/Illustration - Larger]          │
│                                                 │
│ Magnesium Supplement                            │
│                                                 │
│ [Full description - 1-2 paragraphs]             │
│                                                 │
│ Why this matters: [Full context paragraph]      │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Dosage & Frequency                          │  │
│ │ • Dosage: 200-400mg magnesium glycinate   │  │
│ │ • Timing: 30 minutes before bedtime        │  │
│ │ • Duration: Start with 3 weeks, assess      │  │
│ │ • Considerations: Take with food            │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Expected Benefits                            │  │
│ │ • Improved sleep quality in 2-3 weeks       │  │
│ │ • Reduced stress recovery time              │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ [Hide details] [Link/Button]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Card Categories & Visual Design:**
- **OTC Remedies**: Geometric capsule shape pattern
- **Exercise**: Simple geometric movement pattern
- **Diet**: Geometric plate/utensil pattern
- **Meditation**: Geometric wave/breath pattern
- **Wellness**: Geometric leaf/nature pattern
- **Medical**: Geometric plus/cross pattern (only if referral)
- **NO EMOJIS OR ICONS** - Use geometric shapes and patterns only

**Priority Calculation Algorithm:**
```
Priority Score = (
  (Assessment Score Impact * 0.4) +
  (Urgency Multiplier * 0.3) +
  (Overall Score Deficiency * 0.3)
)

Where:
- Assessment Score Impact = 100 - sectionScore (lower score = higher impact)
- Urgency Multiplier = based on concern severity (1.0-2.0)
- Overall Score Deficiency = if overallScore < 50, add multiplier

Priority Levels:
- HIGH: Priority Score > 70
- MODERATE: Priority Score 40-70
- ONGOING: Priority Score < 40 (maintenance/lifestyle)
```

**"Show More" Functionality:**
- Initially show 8 recommendations
- "Show 4 More" button loads next batch
- Button text updates: "Show 4 More" → "Show 4 More (12 of 16)" → etc.
- Smooth scroll animation when new cards appear
- Fade-in animation for new cards

**Recommendation Generation Rules:**
- Minimum 2 recommendations per dimension (if score < 80)
- Maximum 4 recommendations per dimension
- At least 1 recommendation from each category (if applicable)
- OTC remedies: Only if sleep < 70 OR stress < 65
- Exercise: Always include (personalized to energy patterns)
- Diet: Always include (personalized to body systems/energy)
- Meditation: If stress < 70 OR sleep < 65
- Wellness: Always include 1-2 general wellness tips
- Medical referral: If any section score < 50

---

### 5. **Medical Referral Section (Conditional)**

**Only shows if:**
- Any section score < 50, OR
- Specific concerns flagged (e.g., persistent digestive issues, high stress with physical symptoms)

```
┌─────────────────────────────────────────────────┐
│ [Warning Border - Subtle Red-Orange]             │
│                                                 │
│ Healthcare Provider Consultation                │
│ Recommended                                     │
│                                                 │
│ Based on your assessment, we recommend           │
│ consulting with a healthcare provider about:    │
│                                                 │
│ • [Specific concern 1 from assessment]          │
│   Context: [Why this matters based on data]    │
│                                                 │
│ • [Specific concern 2 if applicable]           │
│   Context: [Why this matters based on data]     │
│                                                 │
│ Next Steps:                                     │
│ [CTA: Find a Healthcare Provider]               │
│ [Red-Orange button]                             │
│                                                 │
│ Note: This report is not a substitute for...    │
│ [Small disclaimer text]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design:**
- Subtle red-orange border (not overwhelming)
- Clear, professional tone
- Specific concerns linked to assessment data
- CTA button uses Red-Orange (#d95e40)
- Small disclaimer about report limitations

---

### 6. **Footer/Appendix Section**

```
┌─────────────────────────────────────────────────┐
│ Report Information                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Assessment Date: [Date]                         │
│ Report Generated: [Timestamp]                   │
│                                                 │
│ Your Human Signal reflects your responses to    │
│ 22 questions across 4 health dimensions.       │
│                                                 │
│ [Human Signal Logo]                             │
│ Personal patterns, clearly visualized.         │
│                                                 │
│ [Print Report] [Download PDF] [Share Link]     │
│ [Buttons - Red-Orange for primary actions]     │
│                                                 │
│ Note: PDF includes full color visualization    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Recommendation Data Model

```typescript
interface Recommendation {
  id: string;
  category: 'otc' | 'exercise' | 'diet' | 'meditation' | 'wellness' | 'medical';
  title: string;
  priority: 'high' | 'moderate' | 'ongoing';
  priorityScore: number; // Calculated score
  
  // Content
  summary: string; // 2-3 sentence summary (collapsed state)
  description: string; // Full 1-2 paragraph description (expanded)
  rationale: string; // "Why this matters" - links to assessment data
  
  // Actionable details
  dosage?: string; // For OTC/diet recommendations
  frequency?: string; // How often
  timing?: string; // When to do/take
  duration?: string; // How long to try
  considerations?: string[]; // Important notes
  
  // Expected benefits
  expectedBenefits: string[]; // 2-3 bullet points
  
  // Data linkage
  relatedDimension: 'sleep' | 'stress' | 'energy' | 'body';
  relatedConcerns: string[]; // Which concerns this addresses
  relatedScore: number; // Score that triggered this
  
  // Generation metadata
  generatedByAI: boolean;
}
```

---

## AI Prompt Structure

### Executive Summary Prompt
```
Generate a personalized 3-4 paragraph narrative summary synthesizing this health assessment:

[Insert all assessment data and analysis]

Tone: Balanced - scientific yet empathetic
Requirements:
- Use "Human Signal" terminology
- Connect the 4 dimensions (sleep, stress, energy, body systems)
- Identify dominant patterns
- Be personal and relevant
- 200-300 words total
```

### Section Analysis Prompts (4 separate)
```
Generate personalized analysis for [Dimension]:

Score: [X]/100
Strengths: [List]
Concerns: [List]
Assessment Responses: [Data]

Requirements:
- 2-3 paragraphs synthesizing findings
- Use "Human Signal" terminology
- Balanced tone (scientific + empathetic)
- Connect patterns to real-world implications
```

### Recommendation Generation Prompt
```
Generate [N] personalized recommendations for:

[Dimension] Score: [X]/100
Concerns: [List]
Assessment Context: [Relevant responses]

Requirements for each recommendation:
1. Category: [otc/exercise/diet/meditation/wellness/medical]
2. Title: Clear, action-oriented
3. Summary: 2-3 sentences
4. Full description: 1-2 paragraphs
5. Rationale: Why this matters based on assessment
6. Dosage/Frequency/Timing (if applicable): Specific, actionable
7. Expected benefits: 2-3 clear benefits
8. Priority rationale: Why this priority level

Format as JSON array.
```

---

## Interaction Design

### Progressive Disclosure States

**Initial Load:**
- All sections collapsed
- 8 recommendations visible (collapsed)
- Smooth fade-in animations (staggered)
- Executive summary fully visible

**User Interactions:**
- Click section header → Expand/collapse with smooth animation
- Click "Show details" on recommendation → Expand card
- Click "Show 4 More" → Load next batch with fade-in
- All interactions feel smooth and responsive

### Animations & Fluid Interactions
- Section expansion: Height transition, 300ms ease-in-out with cubic-bezier easing
- Card expansion: Height transition + slight scale, 250ms with smooth acceleration
- New recommendations: Fade in from bottom with slight upward motion, 400ms
- Hover states: Subtle shadow lift + slight scale, 150ms
- Scroll-triggered animations: Smooth reveal as sections come into view
- Loading progress: Smooth progress bar with percentage indicator
- Micro-interactions: Subtle feedback on all clickable elements
- Smooth page transitions: Fade-in for entire page content

### Mobile Considerations
- Stack sections vertically
- Cards full-width (no grid on mobile)
- Touch-optimized tap targets (min 44px)
- Sticky section navigation on scroll (optional)
- Print-friendly layout adjusts automatically

---

## Visual Design Details

### Typography Hierarchy
```
Page Title: Inter 300, 48px, letter-spacing 0.05em
Section Headers: Inter 400, 24px, uppercase, letter-spacing 0.1em
Card Titles: Inter 600, 18px, letter-spacing 0.02em
Body Text: Inter 400, 16px, line-height 1.6
Small Text: Inter 400, 14px, line-height 1.5
```

### Spacing System
- Section spacing: 64px (desktop), 48px (mobile)
- Card spacing: 24px (desktop), 16px (mobile)
- Internal card padding: 32px (desktop), 24px (mobile)
- Grid gaps: 24px

### Color Usage
- Background: Cream (#f8f6f2) with paper texture
- Text: Charcoal (#3a3a3a) for body, White (#ffffff) on colored backgrounds
- Section headers: Dimension-specific colors (see table above)
- Accents: Subtle gradients using palette colors
- CTAs: Red-Orange (#d95e40)
- Priority badges: Color-coded (High = Red-Orange, Moderate = Violet, Ongoing = Periwinkle)

### Geometric Elements
- Section dividers: Subtle lines with geometric accents
- Card borders: Minimal (1px) or shadow-based
- Background patterns: Very subtle, mid-century grid/pattern overlays
- Icons: Simple geometric shapes matching mid-century aesthetic

---

## Technical Implementation Notes

### State Management
```typescript
interface ReportState {
  // Section visibility
  expandedSections: Set<'sleep' | 'stress' | 'energy' | 'body'>;
  
  // Recommendation visibility
  visibleRecommendations: number; // Starts at 8
  expandedRecommendations: Set<string>; // Recommendation IDs
  
  // Content
  executiveSummary: string | null;
  sectionAnalyses: Record<string, string>; // Dimension → analysis text
  recommendations: Recommendation[];
  
  // Loading states
  isGenerating: boolean;
  hasError: boolean;
}
```

### Data Flow
1. Load assessment data from localStorage
2. Calculate scores using existing analysis functions
3. Generate executive summary (AI)
4. Generate section analyses (AI - 4 calls, can be parallel)
5. Calculate recommendation priorities
6. Generate recommendations (AI - batch request)
7. Render with progressive disclosure

### Performance Considerations
- Cache AI-generated content (avoid regenerating on revisit)
- Lazy load full section content when expanded
- Batch recommendation generation (one API call for all)
- Progressive enhancement: Show structure first, enhance with AI

---

## PDF Generation Specifications

### PDF Export Requirements
- **Full color support**: All colors from brand palette rendered correctly
- **Human Signal Chart**: Static snapshot of LayeredRadarChart (all layers visible)
- **Print-optimized layout**: Adjusted spacing, page breaks at logical points
- **Cover page**: Includes report title, generation date, overall score, and signal chart
- **All sections**: Executive summary, all 4 analysis sections (expanded), all recommendations (expanded), medical referral if applicable
- **Footer**: Report metadata on final page
- **File naming**: `human-signal-report-[date].pdf`

### PDF Generation Technical Approach
- Use library like `jsPDF` with `html2canvas` for full-page capture
- OR use `react-pdf` for programmatic PDF generation
- Ensure canvas elements (radar chart) are properly rendered in PDF
- Maintain color fidelity throughout
- Include all expanded content (sections + recommendations) in final PDF

### Sharing Functionality

**Share Link:**
- Generate unique shareable link (could use URL params with encoded assessment data)
- Link copies to clipboard
- Shows confirmation toast/notification

**Share Image:**
- Capture report as image (cover page + key sections)
- Use `html2canvas` to capture specific sections
- Provide download option
- Image should be high-resolution (for social sharing)

**Download PDF:**
- Triggers PDF generation
- Shows progress indicator during generation
- Downloads automatically when ready

---

## Fluid Interaction Design Details

### Page Load Experience
1. **Initial State**: Page structure visible immediately (skeleton without content)
2. **Progress Indicator**: Shows percentage (0-100%) with smooth animation
3. **Progressive Content Loading**:
   - Executive summary appears first (20-30% progress)
   - Section analyses load in sequence (30-60% progress)
   - Recommendations load last (60-100% progress)
4. **Smooth Transitions**: Each content block fades in with slight stagger

### Interactive Elements

**Section Expansion:**
- Click anywhere on section header → smooth expand
- Icon rotates smoothly (180deg transition)
- Content reveals with easing
- Scroll position adjusts smoothly if needed

**Recommendation Cards:**
- Hover: Subtle lift (translateY -2px) + shadow increase
- Click "Show details": Expand with smooth height transition
- New cards: Fade in from opacity 0, translate from bottom
- "Show 4 More": Button shows loading state briefly, then new cards animate in

**Progress Indicator:**
- Located at top of page (sticky during generation)
- Shows percentage text + animated progress bar
- Uses Red-Orange gradient
- Fades out smoothly when complete (after brief delay)

**Scroll Interactions:**
- Subtle parallax effect on hero section (optional)
- Sections fade in slightly as they approach viewport
- Back button becomes visible on scroll (fade in)

**Micro-interactions:**
- All buttons have active press state (slight scale down)
- Links have hover underline animation
- Form inputs (if any) have focus animations
- Smooth transitions on all state changes

### Animation Timing
- Fast interactions: 150-200ms (hover, press)
- Moderate transitions: 250-300ms (expand, fade)
- Slow transitions: 400-500ms (page transitions, scroll reveals)
- Easing: Use cubic-bezier curves for natural feeling motion

---

## Finalized Decisions

1. **Page Routing**: `/report`
2. **Navigation**: Yes, include back button to findings page
3. **Print/PDF**: Full PDF generation with color support
4. **Sharing**: Link, image, and PDF options (all)
5. **Save State**: Regenerate each time (no caching)
6. **Loading States**: Progress indicator during AI generation
7. **Additional Requirements**:
   - Fluid interactions to keep experience engaging
   - No emojis or icons (use geometric shapes/patterns only)
   - Include final human signal chart (LayeredRadarChart) in report

