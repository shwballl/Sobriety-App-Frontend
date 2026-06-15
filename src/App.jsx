import { useState } from "react";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import "./styles/theme.css";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      {page === "home" ? <Home /> : <GamePage />}
      <nav className="bottom-nav">
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => setPage("home")}
        >
          🏠 Главная
        </button>
        <button
          className={page === "game" ? "active" : ""}
          onClick={() => setPage("game")}
        >
          🛡️ Поддержка
        </button>
      </nav>
    </div>
  );
}
