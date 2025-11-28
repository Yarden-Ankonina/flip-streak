import "./FlipButton.css";

interface FlipButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function FlipButton({ onClick, disabled }: FlipButtonProps) {
  return (
    <button
      className="flip-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Flip coin"
    >
      <span className="flip-button-icon">🪙</span>
      <span className="flip-button-text">Flip</span>
    </button>
  );
}

