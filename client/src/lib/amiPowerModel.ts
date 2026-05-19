import type { AssetItem } from '@/data/agentAggregation';

export const AMI_LAG_HOURS = 6;

export type MeterKind = 'generation' | 'load';

export type MeterDetail = {
  meterNo: string;
  siteName: string;
  no: string;
  systemKwh: number;
  systemLastAt: Date;
  lagHours: number | null;
  extra?: string;
};

export type DailyPoint = {
  hour: number;
  label: string;
  actual: number | null;
  reference: number;
};

export type IngestionStatus = {
  lastBatchAt: Date;
  lagHours: number;
  genReceived: number;
  genTotal: number;
  loadReceived: number;
  loadTotal: number;
  pipeline: 'normal' | 'delayed';
};

function hashToUnit(key: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function toLocalDateInputValue(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString('zh-TW', { hour12: false, dateStyle: 'short', timeStyle: 'short' });
}

export function formatClock(d: Date): string {
  return d.toLocaleTimeString('zh-TW', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function buildMeterDetail(
  asset: AssetItem,
  kind: MeterKind,
  viewDate: string,
  isViewingToday: boolean,
  now: Date,
  refreshSeq: number
): MeterDetail {
  const meterNo = asset.meterNo ?? asset.no;
  const seed = `${meterNo}:${kind}:${viewDate}:${refreshSeq}`;
  const cap = asset.capacityKw;
  const noise = 0.94 + hashToUnit(seed) * 0.12;

  const intervalKwh =
    kind === 'generation'
      ? Math.round(cap * (0.18 + hashToUnit(`${seed}:iv`, 1) * 0.22) * noise * 10) / 10
      : Math.round(cap * (0.08 + hashToUnit(`${seed}:iv`, 2) * 0.14) * noise * 10) / 10;

  let systemLastAt: Date;
  let lagHours: number | null;

  if (isViewingToday) {
    const lagJitter = Math.round(hashToUnit(`${seed}:lag`, 3) * 2 * 10) / 10;
    lagHours = AMI_LAG_HOURS + lagJitter;
    systemLastAt = new Date(now.getTime() - lagHours * 60 * 60 * 1000);
  } else {
    const day = parseLocalDate(viewDate);
    systemLastAt = new Date(day);
    systemLastAt.setHours(23, 45, 0, 0);
    lagHours = null;
  }

  return {
    meterNo,
    siteName: asset.name,
    no: asset.no,
    systemKwh: intervalKwh,
    systemLastAt,
    lagHours,
    extra:
      kind === 'generation'
        ? (asset.renewableType ?? 'PV')
        : (asset.voltageLevel ?? '—'),
  };
}

export function buildDailySeries(
  kind: MeterKind,
  assets: AssetItem[],
  viewDate: string,
  isViewingToday: boolean,
  now: Date,
  refreshSeq: number
): DailyPoint[] {
  const refDate = parseLocalDate(viewDate);
  const holiday = isWeekend(refDate);
  const cutoffHour = isViewingToday ? now.getHours() + now.getMinutes() / 60 - AMI_LAG_HOURS : 24;
  const capSum = assets.reduce((s, a) => s + a.capacityKw, 0) || 1;

  return Array.from({ length: 24 }, (_, hour) => {
    const label = `${String(hour).padStart(2, '0')}:00`;
    let reference = 0;

    if (kind === 'generation') {
      if (holiday) {
        reference = hour >= 7 && hour <= 17 ? capSum * (0.12 + Math.sin(((hour - 7) / 10) * Math.PI) * 0.28) : capSum * 0.04;
      } else {
        reference = hour >= 6 && hour <= 18 ? capSum * (0.15 + Math.sin(((hour - 6) / 12) * Math.PI) * 0.35) : capSum * 0.03;
      }
    } else if (holiday) {
      reference = capSum * (0.06 + Math.sin((hour / 23) * Math.PI) * 0.05);
    } else {
      reference =
        capSum *
        (0.07 +
          (hour >= 8 && hour <= 11 ? 0.12 : 0) +
          (hour >= 17 && hour <= 21 ? 0.16 : 0) +
          Math.cos(((hour - 13) / 11) * Math.PI) * 0.04);
    }

    reference = Math.round(reference * (0.9 + hashToUnit(`${kind}:ref:${viewDate}:${hour}`, refreshSeq) * 0.2) * 10) / 10;

    let actual: number | null = null;
    if (hour < cutoffHour) {
      const wobble = 0.88 + hashToUnit(`${kind}:act:${viewDate}:${hour}:${refreshSeq}`) * 0.24;
      actual = Math.round(reference * wobble * 10) / 10;
    }

    return { hour, label, actual, reference };
  });
}

export function buildIngestionStatus(genMeters: MeterDetail[], loadMeters: MeterDetail[], now: Date): IngestionStatus {
  const all = [...genMeters, ...loadMeters];
  const withLag = all.filter((m) => m.lagHours !== null);
  const avgLag = withLag.length
    ? withLag.reduce((s, m) => s + (m.lagHours ?? 0), 0) / withLag.length
    : AMI_LAG_HOURS;
  const lastBatchAt = new Date(now.getTime() - avgLag * 60 * 60 * 1000);

  return {
    lastBatchAt,
    lagHours: Math.round(avgLag * 10) / 10,
    genReceived: genMeters.length,
    genTotal: genMeters.length,
    loadReceived: loadMeters.length,
    loadTotal: loadMeters.length,
    pipeline: avgLag > AMI_LAG_HOURS + 1 ? 'delayed' : 'normal',
  };
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { hashToUnit };
