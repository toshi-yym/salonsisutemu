import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';


export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  async function fetchCustomer() {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (!error) setCustomer(data);
  }

  async function handleDelete() {
    if (!window.confirm('削除してよろしいですか？')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) {
      alert('削除しました');
      navigate('/customers');
    }
  }

  if (!customer) return <p>読み込み中…</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{customer.name}</h2>
      <p>電話: {customer.phone}</p>
      <p>メール: {customer.email}</p>
      <p>性別: {customer.gender}</p>
      <p>生年月日: {customer.birthday}</p>
      <p>メモ: {customer.note}</p>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => navigate(`/customer/edit/${id}`)}>編集</button>{' '}
        <button onClick={handleDelete}>削除</button>
      </div>
    </div>
  );
}
