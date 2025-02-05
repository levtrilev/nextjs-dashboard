"use client";
import { useState } from "react";

  export default function HitCounter({
    children,
  }: {
    children: React.ReactNode;
  }) {
  const [counter, setCounter] = useState(14);

  return (
    <div>
      You are visitor number {' '}{counter}{' id: '}
      <button
        onClick={() => setCounter(counter + 1)}
      >
        {children}
      </button>
    </div>
  );
}
