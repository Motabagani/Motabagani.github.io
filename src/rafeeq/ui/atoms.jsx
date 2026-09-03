import { useMemo, useId, cloneElement, isValidElement } from "react";
export const Field = ({ label, required, error, hint, children }) => {
  const autoId = useId();
  const single = isValidElement(children);
  const inputId = single ? (children.props.id || autoId) : undefined;
  const hintId = hint ? `${autoId}-hint` : undefined;
  // Programmatically link the label to the control, and (only while invalid)
  // describe the control with its error hint so screen readers announce it.
  const control = single
    ? cloneElement(children, {
        id: inputId,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
        "aria-describedby": [children.props["aria-describedby"], error ? hintId : null]
          .filter(Boolean).join(" ") || undefined,
      })
    : children;
  return (
    <div className={"rq-field" + (error ? " err" : "")}>
      <label htmlFor={inputId}>{label}{required && <span className="req"> *</span>}</label>
      <div className="rq-ib">{control}</div>
      <div className="hint" id={hintId} role={error ? "alert" : undefined}>{hint}</div>
    </div>
  );
};

export const Pill = ({ tone, children }) => (
  <span className={"rq-pill " + tone}><span className="led" />{children}</span>
);

export function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100, size: 6 + Math.random() * 7,
    color: ["#2FD6B0", "#C2A24A", "#E7998A", "#8FF0D6"][i % 4],
    dur: 2 + Math.random() * 1.6, rot: Math.random() * 720,
  })), []);
  return (
    <div className="rq-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ insetInlineStart: p.left + "%", width: p.size, height: p.size, background: p.color, "--dur": p.dur + "s", "--rot": p.rot + "deg" }} />
      ))}
    </div>
  );
}

/* financial guarantee letter — English by design (handoff §6) */
