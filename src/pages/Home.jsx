import { useState, useEffect } from "react";
import CheckinButton from "../components/CheckinButton";

const API = "https://sobriety-app-backend.onrender.com/api";

export default function Home() {
  const [progress, setProgress] = useState(null);
  const [now, setNow] = useState(new Date());
  const [checkinState, setCheckinState] = useState({
    available: false,
    done: false,
    period: null,
  });

  // 1. Запрашиваем несгораемую дату старта с бэкенда
  // Плюс запускаем локальный таймер для красивого "тиканья"
  useEffect(() => {
    fetch(`${API}/progress`)
      .then((r) => r.json())
      .then(setProgress)
      .catch((err) => console.error("Ошибка загрузки:", err));

    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Оптимизация: определяем текущий период вне useEffect
  const currentHour = now.getHours();
  let activePeriod = null;
  if (currentHour >= 12 && currentHour < 13) activePeriod = "day";
  if (currentHour >= 20 && currentHour < 21) activePeriod = "evening";

  // 2. Проверяем чекин ТОЛЬКО когда меняется период (чтобы не спамить бэкенд каждую секунду)
  useEffect(() => {
    if (activePeriod) {
      fetch(`${API}/checkin/today?period=${activePeriod}`)
        .then((r) => r.json())
        .then((data) =>
          setCheckinState({
            available: !data.done,
            done: data.done,
            period: activePeriod,
          }),
        )
        .catch(console.error);
    } else {
      setCheckinState({ available: false, done: false, period: null });
    }
  }, [activePeriod]);

  // Пока данные с бэкенда не пришли
  if (!progress) return <div className="loading">Загрузка...</div>;

  const startDate = new Date(progress.start_date);
  const dailySaving = progress.daily_saving || 500; // На случай если с бэка не придет цифра

  // 3. Расчет времени (с миллисекундами)
  const diffMs = Math.max(0, now - startDate);
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  // Точный расчет экономии, чтобы деньги капали каждую секунду
  const exactDays = diffMs / 86400000;
  const saved = exactDays * dailySaving;

  const handleCheckin = async () => {
    try {
      await fetch(`${API}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: checkinState.period }),
      });
      setCheckinState((s) => ({ ...s, available: false, done: true }));
    } catch (error) {
      console.error("Ошибка при чекине:", error);
    }
  };

  const dayProgress = (now.getHours() * 60 + now.getMinutes()) / 1440;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - dayProgress);

  return (
    <div className="page">
      <h1 className="page-title">
        Твой <span>путь</span>
      </h1>

      <div className="streak-card">
        <div className="streak-ring">
          <svg width="84" height="84">
            <circle
              className="bg"
              cx="42"
              cy="42"
              r={radius}
              strokeWidth="6"
              fill="none"
            />
            <circle
              className="progress"
              cx="42"
              cy="42"
              r={radius}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="days-count">
            <span className="num">{days}</span>
            <span className="unit">дней</span>
          </div>
        </div>
        <div className="streak-info">
          <p className="start-date">
            С {startDate.toLocaleDateString("ru-RU")}
          </p>
          <p className="elapsed">
            {days} дн {hours} ч {minutes} мин {seconds} сек
          </p>
        </div>
      </div>

      <div className="card accent-green">
        <p className="label">Сэкономлено</p>
        <p className="value">
          {saved.toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          грн
        </p>
      </div>

      <CheckinButton
        available={checkinState.available}
        done={checkinState.done}
        period={checkinState.period}
        onCheckin={handleCheckin}
      />
    </div>
  );
}
