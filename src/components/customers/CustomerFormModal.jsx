import React, { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import './CustomerFormModal.css';

// 和暦⇔西暦変換ユーティリティ
const eras = [
  { name: '令和', initial: 'R', start: new Date('2019-05-01') },
  { name: '平成', initial: 'H', start: new Date('1989-01-08') },
  { name: '昭和', initial: 'S', start: new Date('1926-12-25') },
  { name: '大正', initial: 'T', start: new Date('1912-07-30') },
  { name: '明治', initial: 'M', start: new Date('1868-01-25') },
];

function gregorianToWareki(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d)) return '';
  const era = eras.find((e) => d >= e.start);
  if (!era) return '';
  const year = d.getFullYear() - era.start.getFullYear() + 1;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${era.name}${year}-${mm}-${dd}`; // 令和5-07-07
}

function warekiToGregorian(str) {
  if (!str) return '';
  // 対応: 令和5-07-07 or R05-07-07
  const m = str.match(/^(令和|平成|昭和|大正|明治|R|H|S|T|M)(\d{1,2})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  let eraKey = m[1];
  const year = parseInt(m[2], 10);
  const mm = m[3];
  const dd = m[4];
  const era = eras.find((e) => e.name === eraKey || e.initial === eraKey);
  if (!era) return '';
  const baseYear = era.start.getFullYear();
  const gYear = baseYear + year - 1;
  return `${gYear}-${mm}-${dd}`;
}

export default function CustomerFormModal({ onClose, onSaved, existing }) {
  const [form, setForm] = useState(
    existing || {
      birthday_jp: '',
      name: '',
      phone: '',
      email: '',
      gender: '',
      birthday: '',
      note: '',
    },
  );
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'birthday') {
      setForm((prev) => ({ ...prev, birthday: value, birthday_jp: gregorianToWareki(value) }));
    } else if (name === 'birthday_jp') {
      const greg = warekiToGregorian(value);
      setForm((prev) => ({ ...prev, birthday_jp: value, birthday: greg }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('名前と電話番号は必須です');
      return;
    }
    if (form.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(form.birthday)) {
      alert('生年月日は YYYY-MM-DD 形式で入力するか和暦欄を使用してください');
      return;
    }
    if (!/^\d+$/.test(form.phone)) {
      alert('電話番号は数字のみです');
      return;
    }
    setSaving(true);
    const payload = { ...form };
    delete payload.birthday_jp;
    if (!payload.birthday) payload.birthday = null;
    let result;
    if (existing) {
      result = await supabase
        .from('customers')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('customers')
        .insert(payload)
        .select()
        .single();
    }
    setSaving(false);
    if (result.error) {
      console.error(result.error);
      alert(`保存に失敗しました: ${result.error.message}`);
    } else {
      onSaved();
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{existing ? '顧客編集' : '新規顧客登録'}</h3>
        <form onSubmit={handleSubmit} className="customer-form">
          <label>
            名前*
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            電話番号*
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            性別
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">-</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </label>
          <label>
            生年月日(西暦)
            <input name="birthday" placeholder="YYYY-MM-DD" value={form.birthday || ''} onChange={handleChange} />
          </label>
          <label>
            生年月日(和暦)
            <input name="birthday_jp" placeholder="例: 令和5-07-07" value={form.birthday_jp || ''} onChange={handleChange} />
          </label>
          <label>
            メールアドレス
            <input name="email" value={form.email || ''} onChange={handleChange} />
          </label>
          <label>
            メモ
            <textarea name="note" value={form.note || ''} onChange={handleChange} />
          </label>
          <div className="actions">
            <button type="button" onClick={onClose}>キャンセル</button>
            <button type="submit" disabled={saving}>{saving ? '保存中…' : '保存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
