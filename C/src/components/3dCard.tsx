import React, { useCallback, useEffect, useRef } from "react";

export function Card({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseMoveHandler = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = e;
    const rect = cardRef.current.getBoundingClientRect();
    const x = getRotation(range, clientY - rect.y, rect.height);
    const y = -getRotation(range, clientX - rect.x, rect.width);
    cardRef.current.style.setProperty("--rx", `${x}deg`);
    cardRef.current.style.setProperty("--ry", `${y}deg`);
  }, []);

  const mouseLeaveHandler = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--rx", "0deg");
    cardRef.current.style.setProperty("--ry", "0deg");
  }, []);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.addEventListener("mousemove", mouseMoveHandler);
      cardRef.current.addEventListener("mouseleave", mouseLeaveHandler);
    }

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener("mousemove", mouseMoveHandler);
        cardRef.current.removeEventListener("mouseleave", mouseLeaveHandler);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="aspect-[3/4] lg:h-48 lg:rounded-xl 2xl:h-60 2xl:rounded-2xl cursor-pointer bg-white shadow-xl overflow-hidden"
      style={
        {
          "--rx": "0deg",
          "--ry": "0deg",
          transform: "perspective(500px) rotateX(var(--rx)) rotateY(var(--ry))",
        } as any
      }
    >
      {children}
    </div>
  );
}

const range = [-20, 20];

const getRotation = (range: number[], mousePos: number, length: number) => {
  return (mousePos / length) * (range[1] - range[0]) + range[0];
};
