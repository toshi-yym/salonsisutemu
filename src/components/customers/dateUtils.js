// 和暦と西暦の相互変換ユーティリティ
const eras = [
  { name: '令和', initial: 'R', start: new Date('2019-05-01') },
  { name: '平成', initial: 'H', start: new Date('1989-01-08') },
  { name: '昭和', initial: 'S', start: new Date('1926-12-25') },
  { name: '大正', initial: 'T', start: new Date('1912-07-30') },
  { name: '明治', initial: 'M', start: new Date('1868-01-25') },
];

export function gregorianToWareki(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d)) return '';
  const era = eras.find((e) => d >= e.start);
  if (!era) return '';
  const year = d.getFullYear() - era.start.getFullYear() + 1;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${era.name}${year}-${mm}-${dd}`;
}

export function warekiToGregorian(str) {
  if (!str) return '';
  const m = str.match(/^(令和|平成|昭和|大正|明治|R|H|S|T|M)(\d{1,2})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const eraKey = m[1];
  const year = parseInt(m[2], 10);
  const mm = m[3];
  const dd = m[4];
  const era = eras.find((e) => e.name === eraKey || e.initial === eraKey);
  if (!era) return '';
  const baseYear = era.start.getFullYear();
  const gYear = baseYear + year - 1;
  return `${gYear}-${mm}-${dd}`;
}
