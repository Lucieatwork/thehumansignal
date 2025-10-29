import { AI_CONFIG } from "../config/ai";

type AssessmentData = {
  sleep: any; stress: any; energy: any; body: any;
};

async function callServerless(path: string, body: any) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), AI_CONFIG.TIMEOUT_MS);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Lazy import mocks so they don't ship in prod
async function mocks() { return import("./mocks"); }

export async function generateAnalysis(data: AssessmentData) {
  if (AI_CONFIG.USE_MOCK) { const M = await mocks(); return M.analysis(); }
  return callServerless("/api/hf-generate", { kind: "analysis", data });
}

export async function generateTimeline(data: AssessmentData, lifeEvents: any) {
  if (AI_CONFIG.USE_MOCK) { const M = await mocks(); return M.timeline(); }
  return callServerless("/api/hf-generate", { kind: "timeline", data, lifeEvents });
}

export async function generateRecommendations(data: AssessmentData, focusAreas: string[]) {
  if (AI_CONFIG.USE_MOCK) { const M = await mocks(); return M.recommendations(); }
  return callServerless("/api/hf-generate", { kind: "recommendations", data, focusAreas });
}

export async function generateReportExecutiveSummary(data: AssessmentData, analyses: any) {
  if (AI_CONFIG.USE_MOCK) { const M = await mocks(); return M.reportExecutiveSummary(); }
  return callServerless("/api/hf-generate", { kind: "report_executive_summary", data, analyses });
}

export async function generateReportSectionAnalysis(dimension: string, data: AssessmentData, analysis: any) {
  if (AI_CONFIG.USE_MOCK) { const M = await mocks(); return M.reportSectionAnalysis(); }
  return callServerless("/api/hf-generate", { kind: "report_section_analysis", dimension, data, analysis });
}

export async function generateReportRecommendations(data: AssessmentData, analyses: any) {
  if (AI_CONFIG.USE_MOCK) { const M = await mocks(); return M.reportRecommendations(); }
  return callServerless("/api/hf-generate", { kind: "report_recommendations", data, analyses });
}
