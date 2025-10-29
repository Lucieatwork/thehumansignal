import React from "react";
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" style={{ display: "grid", gap: 8 }}>
      <div style={{ height: 16, borderRadius: 6, background: "rgba(0,0,0,0.08)", animation: "pulse 1.2s infinite" }} />
      <div style={{ height: 16, borderRadius: 6, background: "rgba(0,0,0,0.08)", animation: "pulse 1.2s infinite 0.2s" }} />
      <div style={{ height: 16, borderRadius: 6, background: "rgba(0,0,0,0.08)", animation: "pulse 1.2s infinite 0.4s" }} />
      <style>{`@keyframes pulse { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }`}</style>
    </div>
  );
}
