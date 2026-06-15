export default function CheckinButton({ available, done, period, onCheckin }) {
  if (!period) {
    return (
      <div className="checkin-section">
        <button className="checkin-btn unavailable" disabled>
          ⏳ Чекин будет доступен в 12:00 и 20:00
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="checkin-section">
        <p className="checkin-hint">
          {period === "day" ? "Дневной" : "Вечерний"} чекин выполнен ✓
        </p>
        <button className="checkin-btn done" disabled>
          Готово на сегодня
        </button>
      </div>
    );
  }

  if (available) {
    return (
      <div className="checkin-section">
        <p className="checkin-hint">
          {period === "day" ? "Дневной" : "Вечерний"} чекин открыт
        </p>
        <button className="checkin-btn" onClick={onCheckin}>
          ✓ Отметить день
        </button>
      </div>
    );
  }

  return null;
}
