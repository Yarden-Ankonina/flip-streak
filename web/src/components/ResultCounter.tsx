import { useState, useEffect } from "react";
import "./ResultCounter.css";

type Result = "heads" | "tails" | null;

interface ResultCounterProps {
  result: Result;
  onResultChange?: (result: Result) => void;
}

export default function ResultCounter({ result, onResultChange }: ResultCounterProps) {
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [currentResult, setCurrentResult] = useState<Result>("heads"); // Start with heads (coin shows heads initially)

  useEffect(() => {
    // Only update when we get a new result
    if (result === "heads" && result !== currentResult) {
      setHeadsCount((prev) => prev + 1);
      setCurrentResult("heads");
      if (onResultChange) {
        onResultChange("heads");
      }
    } else if (result === "tails" && result !== currentResult) {
      setTailsCount((prev) => prev + 1);
      setCurrentResult("tails");
      if (onResultChange) {
        onResultChange("tails");
      }
    }
  }, [result, currentResult, onResultChange]);

  // Show current result with count (starts at 0, shows heads initially)
  const count = currentResult === "heads" ? headsCount : tailsCount;
  const label = currentResult === "heads" ? "Heads" : "Tails";
  const icon = currentResult === "heads" ? "🪙" : "🪙"; // You can replace with actual icons later

  return (
    <div className="result-counter">
      <div className="result-display">
        <span className="result-icon">{icon}</span>
        <span className="result-label">{label}</span>
        <span className="result-count">x{count}</span>
      </div>
    </div>
  );
}

