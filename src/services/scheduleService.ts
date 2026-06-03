import axiosClient from "./axiosClient";
import type { CreateLichHocDTO, LichHocDTO } from "../types/GiangVien";

export type ScheduleItem = {
  kind: "Study" | "Exam";
  idLop?: number | null;
  tenLop?: string | null;
  start: string; // ISO
  end: string; // ISO
  slot: "Morning" | "Afternoon" | "Evening";
  title?: string | null;
  location?: string | null;
  note?: string | null;
  status?: string | null;
  tenGiangVien?: string | null;
};

export type ScheduleWeekResponse = {
  weekStart: string;
  weekEnd: string;
  items: ScheduleItem[];
};

export async function getMyWeekSchedule(date: Date, type: "all" | "study" | "exam" = "all") {
  const iso = date.toISOString().slice(0, 10);
  const res = await axiosClient.get<ScheduleWeekResponse>(`/schedule/my-week?date=${iso}&type=${type}`);
  return res.data;
}

export async function getClassSchedules(idLop: number) {
  const res = await axiosClient.get<LichHocDTO[]>(`/schedule/class/${idLop}`);
  return res.data;
}

export async function createClassSchedule(data: CreateLichHocDTO) {
  const res = await axiosClient.post<LichHocDTO>("/schedule", data);
  return res.data;
}

export async function deleteClassSchedule(idLichHoc: number) {
  const res = await axiosClient.delete(`/schedule/${idLichHoc}`);
  return res.data;
}

