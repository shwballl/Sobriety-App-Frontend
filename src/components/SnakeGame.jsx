import { useEffect, useRef, useState } from "react";

const GRID_SIZE = 20;
const CELL = 16;
const CANVAS_SIZE = GRID_SIZE * CELL;

export default function SnakeGame({ onClose, duration = 120 }) {
  const canvasRef = useRef(null);
  const dirRef = useRef({ x: 1, y: 0 });
  const [timeLeft, setTimeLeft] = useState(duration);
  const [finished, setFinished] = useState(false);

  const setDirection = (x, y) => {
    if (dirRef.current.x === -x && dirRef.current.y === -y) return;
    if (dirRef.current.x === x && dirRef.current.y === y) return;
    dirRef.current = { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let snake = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    let food = { x: 14, y: 8 };

    const placeFood = () => {
      let pos;
      do {
        pos = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
      food = pos;
    };

    const handleKey = (e) => {
      if (e.key === "ArrowUp") setDirection(0, -1);
      if (e.key === "ArrowDown") setDirection(0, 1);
      if (e.key === "ArrowLeft") setDirection(-1, 0);
      if (e.key === "ArrowRight") setDirection(1, 0);
    };
    window.addEventListener("keydown", handleKey);

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const MIN_SWIPE = 20;

      if (Math.max(absX, absY) < MIN_SWIPE) return;

      if (absX > absY) {
        setDirection(dx > 0 ? 1 : -1, 0);
      } else {
        setDirection(0, dy > 0 ? 1 : -1);
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

    const draw = () => {
      ctx.fillStyle = "#1f2530";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.arc(
        food.x * CELL + CELL / 2,
        food.y * CELL + CELL / 2,
        CELL / 2.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#4d8eff" : "#3a6fd6";
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });
    };

    const tick = () => {
      const head = {
        x: snake[0].x + dirRef.current.x,
        y: snake[0].y + dirRef.current.y,
      };
      head.x = (head.x + GRID_SIZE) % GRID_SIZE;
      head.y = (head.y + GRID_SIZE) % GRID_SIZE;

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        placeFood();
      } else {
        snake.pop();
      }

      draw();
    };

    draw();
    const gameInterval = setInterval(tick, 150);

    const timerInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(gameInterval);
          clearInterval(timerInterval);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(timerInterval);
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="snake-wrapper">
      {finished ? (
        <p className="game-over-msg">Время вышло — отлично, ты отвлёкся 👏</p>
      ) : (
        <p className="timer">
          Осталось {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
      )}

      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />

      <button className="close-btn" onClick={onClose}>
        Закрыть
      </button>
    </div>
  );
}
