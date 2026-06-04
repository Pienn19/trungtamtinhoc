import { useEffect, useMemo, useState } from "react";
import { getMyWeekSchedule, type ScheduleItem } from "../../services/scheduleService";
import "../../styles/WeeklyTimetable.css";

type Filter = "all" | "study" | "exam";

const days = [
  { key: 0, label: "Thứ 2" },
  { key: 1, label: "Thứ 3" },
  { key: 2, label: "Thứ 4" },
  { key: 3, label: "Thứ 5" },
  { key: 4, label: "Thứ 6" },
  { key: 5, label: "Thứ 7" },
  { key: 6, label: "Chủ nhật" },
];

const slots: Array<{ key: ScheduleItem["slot"]; label: string }> = [
  { key: "Morning", label: "Sáng" },
  { key: "Afternoon", label: "Chiều" },
  { key: "Evening", label: "Tối" },
];

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return new Date();
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // Monday=0
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fmtVN(d: Date) {
  return d.toLocaleDateString("vi-VN");
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function InstructorTimetable() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);

  const weekStart = useMemo(() => startOfWeekMonday(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => days.map((_, i) => addDays(weekStart, i)), [weekStart]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getMyWeekSchedule(selectedDate, filter);
        if (cancelled) return;
        setItems(data.items ?? []);
        setError(null);
      } catch (e) {
        console.error(e);
        if (cancelled) return;
        setError("Không thể tải lịch giảng dạy (cần đăng nhập giảng viên).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, filter]);

  const grid = useMemo(() => {
    // slot -> dateKey -> items[]
    const map: Record<string, Record<string, ScheduleItem[]>> = {};
    for (const s of slots) map[s.key] = {};
    for (const d of weekDays) for (const s of slots) map[s.key][dateKey(d)] = [];

    for (const it of items) {
      const dt = new Date(it.start);
      const key = dateKey(dt);
      if (!map[it.slot]?.[key]) continue;
      map[it.slot][key].push(it);
    }

    for (const s of slots) {
      for (const d of weekDays) {
        const key = dateKey(d);
        map[s.key][key].sort((a, b) => a.start.localeCompare(b.start));
      }
    }
    return map;
  }, [items, weekDays]);

  return (
    <div className="ttb-container">
      <div className="ttb-toolbar">
        <div className="ttb-filters">
          <label className="ttb-radio">
            <input type="radio" checked={filter === "all"} onChange={() => setFilter("all")} />
            <span>Tất cả</span>
          </label>
          <label className="ttb-radio">
            <input type="radio" checked={filter === "study"} onChange={() => setFilter("study")} />
            <span>Lịch dạy</span>
          </label>
          <label className="ttb-radio">
            <input type="radio" checked={filter === "exam"} onChange={() => setFilter("exam")} />
            <span>Gác thi</span>
          </label>
        </div>

        <div className="ttb-actions">
          <input
            className="ttb-date"
            type="date"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={(e) => {
              const v = e.target.value;
              const parts = v.split("-");
              if (parts.length === 3) {
                const y = Number(parts[0]);
                const m = Number(parts[1]);
                const d = Number(parts[2]);
                setSelectedDate(new Date(y, m - 1, d));
              } else {
                const nd = new Date(e.target.value);
                if (!isNaN(nd.getTime())) setSelectedDate(nd);
              }
            }}
          />
          <button className="ttb-btn" onClick={() => setSelectedDate(new Date())}>
            Hiện tại
          </button>
          <button className="ttb-btn" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
            &lt; Trở về
          </button>
          <button className="ttb-btn" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
            Tiếp &gt;
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ttb-state">Đang tải...</div>
      ) : error ? (
        <div className="ttb-state ttb-error">{error}</div>
      ) : (
        <>
          {items.length === 0 && (
            <div className="ttb-state">
              Tuần này chưa có lịch giảng dạy/gác thi.
            </div>
          )}

          <div className="ttb-grid">
            <div className="ttb-head-left">Ca dạy</div>
            {weekDays.map((d, idx) => (
              <div key={dateKey(d)} className="ttb-head">
                <div className="ttb-head-day">{days[idx].label}</div>
                <div className="ttb-head-date">{fmtVN(d)}</div>
              </div>
            ))}

            {slots.map((s) => (
              <div key={s.key} className="ttb-row">
                <div className="ttb-slot">{s.label}</div>
                {weekDays.map((d) => {
                  const key = dateKey(d);
                  const cell = grid[s.key][key] ?? [];
                  return (
                    <div key={`${s.key}-${key}`} className="ttb-cell">
                      {cell.length === 0 ? null : (
                        <div className="ttb-events">
                          {cell.map((it, i) => (
                            <div
                              key={`${it.kind}-${it.start}-${i}`}
                              className={`ttb-event ${it.kind === "Exam" ? "exam" : "study"}`}
                              title={`${it.title ?? it.tenLop ?? ""}\n${new Date(it.start).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} - ${new Date(it.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}\n${it.location ? `Phòng: ${it.location}` : ""
                                }`}
                            >
                              <div className="ttb-event-title">
                                {it.title ?? it.tenLop ?? (it.kind === "Exam" ? "Gác thi" : "Lịch dạy")}
                              </div>
                              <div className="ttb-event-meta">
                                {new Date(it.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}-
                                {new Date(it.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                {it.location ? ` • ${it.location}` : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="ttb-legend">
        <span className="ttb-badge study">Lịch dạy</span>
        <span className="ttb-badge exam">Gác thi</span>
      </div>
    </div>
  );
}