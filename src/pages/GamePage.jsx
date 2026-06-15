import { useState } from "react";
import SnakeGame from "../components/SnakeGame";

export default function GamePage() {
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="page game-page">
      {!showGame ? (
        <>
          <h1 className="page-title">
            Подожди <span>минуту</span>
          </h1>
          <p className="subtitle">
            Желание пройдёт. Нажми кнопку и отвлекись на пару минут — это снизит
            импульс.
          </p>
          <button className="panic-btn" onClick={() => setShowGame(true)}>
            Не хочу сорваться
          </button>
        </>
      ) : (
        <SnakeGame onClose={() => setShowGame(false)} duration={120} />
      )}
    </div>
  );
}
