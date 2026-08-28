"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  className?: string;
  children: ReactNode;
};

export default function Reveal({ className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={(className ? className + " " : "") + "reveal"}>
      {children}
    </section>
  );
}
