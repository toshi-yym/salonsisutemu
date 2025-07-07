import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from '../../supabaseClient.js';
import './CustomerFormPage.css';
import { gregorianToWareki, warekiToGregorian } from './dateUtils.js';

const eras = [
  { label: '令和', value: '令和', start: 2019 },
  { label: '平成', value: '平成', start: 1989 },
  { label: '昭和', value: '昭和', start: 1926 },
];

function eraYearToGregorian(era, year) {
  const e = eras.find((er) => er.value === era);
  if (!e || !year) return '';
  return e.start + Number(year) - 1;
}

const initial = {
  member_code: '',
  family_name: '',
  given_name: '',
  kana_family: '',
  kana_given: '',
  birthday: '',
  era: '',
  era_year: '',
  gender: '',
  address: '',
  question1: '',
  question2: '',
  question3: '',
  question4: '',
  question5: '',
  birth_year: '',
  birth_month: '',
  birth_day: '',
  phone: '',
  phone_mobile: '',
  email: '',
  intro: '',
  staff_in_charge: '',
  age_group: '',
  job: '',
  married: '',
  hobby: '',
  minor_dependents: '',
  character: '',
  member_level: '',
  research_group: '',
  engagement: '',
  marketing_email: false,
  marketing_post: false,
  alert_flag: false,
  alert_note: '',
};

async function fetchAddressByZip(zip) {
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
    const json = await res.json();
    if (json.status === 200 && json.results && json.results.length) {
      const r = json.results[0];
      return `${r.address1}${r.address2}${r.address3}`;
    }
  } catch(e) {}
  return '';
}
async function fetchZipByAddress(addr) {
  try {
    const res = await fetch(`https://geoapi.heartrails.com/api/json?method=suggest&keyword=${encodeURIComponent(addr)}`);
    const json = await res.json();
    if (json && json.response && json.response.location && json.response.location.length) {
      return json.response.location[0].zipcode.replace('-','');
    }
  } catch(e) {}
  return '';
}

export default function CustomerFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(initial);
  const [loadingCode, setLoadingCode] = useState(false);
  useEffect(() => {
    if (!id) {
      (async () => {
        setLoadingCode(true);
        const { data } = await supabase.from('customers').select('member_code').order('member_code', {ascending:false}).limit(1);
        let next = '1';
        if (data && data.length && data[0].member_code) {
          const num = parseInt(data[0].member_code, 10);
          if (!Number.isNaN(num)) next = String(num + 1);
        }
        setForm((p)=>({...p, member_code: next}));
        setLoadingCode(false);
      })();
    }
    if (id) {
      (async () => {
        const { data } = await supabase.from('customers').select('*').eq('id', id).single();
        if (data) {
          // derive era fields from birthday
          let era = '';
          let era_year = '';
          if (data.birthday) {
            const d = new Date(data.birthday);
            const e = eras.find((er) => d.getFullYear() >= er.start);
            if (e) {
              era = e.value;
              era_year = d.getFullYear() - e.start + 1;
            }
          }
          const cleaned = Object.fromEntries(Object.entries(data).map(([k,v])=>[k, v == null ? '' : v]));
          setForm({ ...initial, ...cleaned, era, era_year });
        }
      })();
    }
  }, [id]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((p) => ({ ...p, [name]: checked }));
      return;
    }
    if (name === 'birth_year' || name === 'birth_month' || name === 'birth_day') {
      const updated = { ...form, [name]: value };
      const { birth_year, birth_month, birth_day } = { ...updated };
      if (birth_year && birth_month && birth_day) {
        updated.birthday = `${birth_year}-${String(birth_month).padStart(2,'0')}-${String(birth_day).padStart(2,'0')}`;
      }
      setForm(updated);
      return;
    }
    if (name === 'birthday') {
      // When user edits Gregorian date, clear era inputs and sync
      setForm((p) => ({ ...p, era: '', era_year: '', birthday: value }));
      return;
    }
    if (name === 'era' || name === 'era_year') {
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
    if(name==='postcode'){
      const digits=value.replace(/[^0-9]/g,'');
      if(digits.length===7){
        fetchAddressByZip(digits).then(addr=>{if(addr){setForm(p=>({...p,address:addr}));}});
      }
    }
    
  }

  function handleAddressBlur(){
    if(form.address && form.address.length>4 && !form.postcode){
      fetchZipByAddress(form.address).then(zip=>{if(zip){setForm(p=>({...p, postcode: zip}));}});
    }
  }

  function handleEraBlur() {
    const { era, era_year } = form;
    const gYear = eraYearToGregorian(era, era_year);
    if (gYear) {
      setForm((p) => {
        let restStr = '';
        if (typeof p.birthday === 'string' && p.birthday.includes('-')) {
          const m = p.birthday.match(/-(\d{2})-(\d{2})$/);
          if (m) restStr = m[0];
        }
        if (!restStr && p.birth_month && p.birth_day) {
          restStr = `-${String(p.birth_month).padStart(2,'0')}-${String(p.birth_day).padStart(2,'0')}`;
        }
        return { ...p, birth_year: String(gYear), birthday: `${gYear}${restStr}` };
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.family_name || !form.phone) {
      alert('姓と電話番号は必須です');
      return;
    }
    const payload = { ...form };
    payload.name = `${form.family_name} ${form.given_name}`.trim();
    delete payload.era;
    delete payload.era_year;
    delete payload.birth_year;
    delete payload.birth_month;
    delete payload.birth_day;
    if (!payload.birthday) payload.birthday = null;
    setSaving(true);
    let error;
    if (id) {
      ({ error } = await supabase.from('customers').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('customers').insert(payload));
    }
    setSaving(false);
    if (error) {
      alert(`保存失敗: ${error.message}`);
    } else {
      alert('保存しました');
      navigate('/customers');
    }
  }

  return (
    <div className="customer-page">
      <h2>{id ? '顧客情報の編集' : '新しい顧客の登録'}</h2>
      <form onSubmit={handleSubmit} className="customer-grid">
        <section className="left">
          <h3>基本情報</h3>
          <label>顧客ID<input name="member_code" value={form.member_code} onChange={handleChange} /></label>
          <div className="field-pair">
            <label>姓*<input name="family_name" value={form.family_name} onChange={handleChange} /></label>
            <label>名<input name="given_name" value={form.given_name} onChange={handleChange} /></label>
          </div>
          <div className="field-pair">
            <label>姓(ひらがな)<input name="kana_family" value={form.kana_family} onChange={handleChange} /></label>
            <label>名(ひらがな)<input name="kana_given" value={form.kana_given} onChange={handleChange} /></label>
          </div>
          <div className="field-row">
            <label>生年月日(西暦 年)
              <input name="birth_year" placeholder="YYYY" value={form.birth_year} onChange={handleChange} style={{width:'5rem'}} />
            </label>
            <label>月
              <input name="birth_month" placeholder="MM" value={form.birth_month} onChange={handleChange} style={{width:'3rem'}} />
            </label>
            <label>日
              <input name="birth_day" placeholder="DD" value={form.birth_day} onChange={handleChange} style={{width:'3rem'}} />
            </label>
          </div>
          <div className="field-row">
            <label>和暦
              <select name="era" value={form.era} onChange={handleChange} onBlur={handleEraBlur}>
                <option value="">-</option>
                {eras.map((er) => <option key={er.value} value={er.value}>{er.label}</option>)}
              </select>
            </label>
            <label>年
              <input type="text" inputMode="numeric" name="era_year" value={form.era_year} onChange={handleChange} onBlur={handleEraBlur} style={{width:'4rem'}} />
            </label>
          </div>
          <label>性別
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">-</option>
              <option value="female">女</option>
              <option value="male">男</option>
              <option value="other">不明</option>
            </select>
          </label>
          <h4>住所</h4>
          <label>郵便番号<input name="postcode" value={form.postcode} onChange={handleChange} /></label>
          <label>住所<input name="address" value={form.address} onChange={handleChange} onBlur={handleAddressBlur} style={{width:'100%'}} /></label>
          <label>電話番号*<input name="phone" value={form.phone} onChange={handleChange} /></label>
          <label>携帯番号<input name="phone_mobile" value={form.phone_mobile} onChange={handleChange} /></label>
          <label>Email<input name="email" value={form.email} onChange={handleChange} /></label>
          <label>紹介者<input name="intro" value={form.intro} onChange={handleChange} /></label>
        </section>
        <section className="right">
          <h3>その他情報</h3>
          {[1,2,3,4,5].map(i=> (
            <label key={i}>質問{i}
              <select name={`question${i}`} value={form[`question${i}`]} onChange={handleChange}>
                <option value="">-</option>
                {['A','B','C','D','E'].map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <div className="field-row">
            <label><input type="checkbox" name="marketing_email" checked={form.marketing_email} onChange={handleChange}/> 販促メール不可</label>
            <label><input type="checkbox" name="marketing_post" checked={form.marketing_post} onChange={handleChange}/> 販促郵便不可</label>
          </div>
          <div className="field-row">
            <label>注意フラグ
              <select name="alert_flag" value={form.alert_flag ? '1' : '0'} onChange={(e)=> handleChange({target:{name:'alert_flag', value:e.target.value==='1'}})}>
                <option value="0">なし</option>
                <option value="1">あり</option>
              </select>
            </label>
          </div>
          <label>注意事項<textarea name="alert_note" value={form.alert_note} onChange={handleChange}/></label>
        </section>
        <div className="actions">
          <button type="button" onClick={()=>navigate('/customers')}>キャンセル</button>
          <button type="submit" disabled={saving}>{saving?'保存中…':'保存'}</button>
        </div>
      </form>
    </div>
  );
}
