import { BRAND } from "../styles/index.js";

export const Mark = ({ size = 36, theme }) => {
  const src = (theme === "light" && BRAND.markLight) || BRAND.mark;
  if (src) return <img className="rq-mark-img" src={src} alt="" width={size} height={size} />;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 34 C14 14, 30 8, 42 10 C34 14, 24 18, 18 34 Z" fill="var(--logo-mark)"/>
      <path d="M14 40 C20 26, 32 20, 42 20 C35 25, 27 29, 23 40 Z" fill="var(--logo-mark2)" opacity=".82"/>
    </svg>
  );
};
