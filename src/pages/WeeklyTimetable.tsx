import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyWeekSchedule, getUpcomingScheduleDate, type ScheduleItem } from "../services/scheduleService";
import "../styles/WeeklyTimetable.css";

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

export default function WeeklyTimetable() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [upcomingDate, setUpcomingDate] = useState<string | null>(null);

  useEffect(() => {
    getUpcomingScheduleDate()
      .then(date => setUpcomingDate(date))
      .catch(console.error);
  }, []);

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
        setError("Không thể tải thời khóa biểu (cần đăng nhập học viên).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, filter]);

  const grid = useMemo(() => {
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
    <div className="page-shell ttb-page">
      <section className="hero-banner ttb-hero">
        <div className="ttb-hero-copy">
          <button className="ttb-back" onClick={() => navigate('/lop-cua-toi')}>
            ← Quay lại lớp của tôi
          </button>
          <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Thời khóa biểu tuần</div>
          <h1 className="ttb-title">Theo dõi lịch học và lịch thi trong tuần</h1>
          <p className="ttb-subtitle">Chọn mốc ngày, lọc theo loại lịch và xem các buổi học được sắp xếp theo ca để dễ kiểm tra.</p>
        </div>

        <div className="ttb-hero-summary">
          <div className="ttb-summary-card">
            <div className="ttb-summary-value">{items.length}</div>
            <div className="ttb-summary-label">Mục lịch trong tuần</div>
          </div>
          <div className="ttb-summary-card">
            <div className="ttb-summary-value">{weekDays.length}</div>
            <div className="ttb-summary-label">Ngày hiển thị</div>
          </div>
        </div>
      </section>

      <section className="surface-card ttb-panel">
        <div className="ttb-toolbar">
          <div className="ttb-filters">
            <label className="ttb-radio">
              <input type="radio" checked={filter === "all"} onChange={() => setFilter("all")} />
              <span>Tất cả</span>
            </label>
            <label className="ttb-radio">
              <input type="radio" checked={filter === "study"} onChange={() => setFilter("study")} />
              <span>Lịch học</span>
            </label>
            <label className="ttb-radio">
              <input type="radio" checked={filter === "exam"} onChange={() => setFilter("exam")} />
              <span>Lịch thi</span>
            </label>
          </div>

          <div className="ttb-actions">
            <input
              className="ttb-date"
              type="date"
              value={selectedDate.toISOString().slice(0, 10)}
              onChange={(e) => {
                const v = e.target.value; // expected YYYY-MM-DD
                const parts = v.split("-");
                if (parts.length === 3) {
                  const y = Number(parts[0]);
                  const m = Number(parts[1]);
                  const d = Number(parts[2]);
                  setSelectedDate(new Date(y, m - 1, d));
                } else {
                  // fallback parse
                  const nd = new Date(e.target.value);
                  if (!isNaN(nd.getTime())) setSelectedDate(nd);
                }
              }}
            />
            <button className="ttb-btn" type="button" onClick={() => setSelectedDate(new Date())}>
              Hiện tại
            </button>
            <button className="ttb-btn" type="button" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
              &lt; Trở về
            </button>
            <button className="ttb-btn" type="button" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
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
                <p>Tuần này chưa có lịch học/lịch thi.</p>
                {upcomingDate && new Date(upcomingDate) > weekDays[6] && (
                  <button 
                    className="ttb-btn" 
                    style={{ marginTop: '1rem', background: 'var(--primary-color)', color: '#fff' }}
                    onClick={() => setSelectedDate(new Date(upcomingDate))}
                  >
                    Chuyển đến tuần bắt đầu từ {new Date(upcomingDate).toLocaleDateString("vi-VN")}
                  </button>
                )}
              </div>
            )}

            <div className="ttb-grid">
              <div className="ttb-head-left">Ca học</div>
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
                                  }${it.tenGiangVien ? `\nGiảng viên: ${it.tenGiangVien}` : ""}`}
                              >
                                <div className="ttb-event-title">
                                  {it.title ?? it.tenLop ?? (it.kind === "Exam" ? "Lịch thi" : "Lịch học")}
                                  {it.loaiLop ? ` [${it.loaiLop}]` : ""}
                                </div>
                                <div className="ttb-event-meta">
                                  {new Date(it.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}-
                                  {new Date(it.end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                  {it.location ? ` • ${it.location}` : ""}
                                  {it.tenGiangVien ? ` • ${it.tenGiangVien}` : ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ttb-legend">
          <span className="ttb-badge study">Lịch học</span>
          <span className="ttb-badge exam">Lịch thi</span>
        </div>
      </section>
    </div>
  );
}

