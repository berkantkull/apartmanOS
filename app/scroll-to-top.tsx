"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 480);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      type="button"
      className={`scroll-to-top${visible ? " is-visible" : ""}`}
      aria-label="Sayfanın başına dön"
      title="Yukarı çık"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp aria-hidden="true" />
      <span>Yukarı çık</span>
    </button>
  );
}
