import React from "react";
export default function ErrorInline({ text = "Something went wrong. Showing a safe fallback." }) {
  return (
    <div role="status" style={{
      padding: 12, borderRadius: 8,
      background: "rgba(215, 178, 119, 0.15)",
      border: "1px solid rgba(215,178,119,0.5)"
    }}>
      <strong style={{ display: "block", marginBottom: 4 }}>Heads up</strong>
      <span>{text}</span>
    </div>
  );
}
