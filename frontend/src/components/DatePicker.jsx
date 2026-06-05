import { useEffect, useMemo, useRef, useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDisplay(dateString) {
  if (!dateString) return 'Pick a date';
  const date = new Date(dateString);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function createCalendarCells(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay }, () => null);

  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(day);
  }

  return cells;
}

function buildIsoDate(year, month, day) {
  const paddedMonth = String(month + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function DatePicker({ selectedDate, onDateChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });
  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthLabel = `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
  const cells = useMemo(() => createCalendarCells(viewDate), [viewDate]);

  const selected = selectedDate ? new Date(selectedDate) : null;

  return (
    <div className="date-picker" ref={containerRef}>
      <button
        type="button"
        className="date-picker-toggle"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{formatDisplay(selectedDate)}</span>
        <span className="date-picker-chevron">▾</span>
      </button>

      {open && (
        <div className="calendar-popup">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              ‹
            </button>
            <div className="calendar-title">{monthLabel}</div>
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              ›
            </button>
          </div>
          <div className="calendar-grid week-labels">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-cell label-cell">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="calendar-cell empty-cell" />;
              }

              const isoDate = buildIsoDate(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isSelected = selected && selected.toISOString().slice(0, 10) === isoDate;

              return (
                <button
                  type="button"
                  key={isoDate}
                  className={`calendar-cell day-cell ${isSelected ? 'selected-day' : ''}`}
                  onClick={() => {
                    onDateChange(isoDate);
                    setOpen(false);
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
