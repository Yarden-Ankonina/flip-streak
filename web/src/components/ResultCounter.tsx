import { useState, useEffect } from "react";
import "./ResultCounter.css";
import headsIcon from "../assets/coins/heads-corgi.png";
import tailsIcon from "../assets/coins/tails-corgi.png";

type Result = "heads" | "tails" | null;

interface ResultCounterProps {
  result: Result;
  onResultChange?: (result: Result) => void;
}

export default function ResultCounter({ result, onResultChange }: ResultCounterProps) {
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [currentResult, setCurrentResult] = useState<Result>(null);

  useEffect(() => {
    // Update when we get a new result
    if (result === "heads") {
      setHeadsCount((prev) => prev + 1);
      setTailsCount(0); // Reset tails count when heads is selected
      setCurrentResult("heads");
      if (onResultChange) {
        onResultChange("heads");
      }
    } else if (result === "tails") {
      setTailsCount((prev) => prev + 1);
      setHeadsCount(0); // Reset heads count when tails is selected
      setCurrentResult("tails");
      if (onResultChange) {
        onResultChange("tails");
      }
    }
  }, [result, onResultChange]);

  // Don't show anything if no result yet
  if (!currentResult) {
    return null;
  }

  // Show current result with count
  const count = currentResult === "heads" ? headsCount : tailsCount;
  const label = currentResult === "heads" ? "Heads" : "Tails";
  const icon = currentResult === "heads" ? headsIcon : tailsIcon;

  return (
    <div className="result-counter">
      <div className="result-display">
        <img src={icon} alt={label} className="result-icon" />
        <span className="result-label">{label}</span>
        <span className="result-count">x{count}</span>
      </div>
    </div>
  );
}

