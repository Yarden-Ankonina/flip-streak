import "./Header.css";
import headsLogoImg from "../assets/coins/heads-corgi.png";

export default function Header() {
  return (
    <header className="app-header">
      <img src={headsLogoImg} alt="FlipStreak Logo" className="header-logo" />
      <h1>FlipStreak</h1>
    </header>
  );
}
