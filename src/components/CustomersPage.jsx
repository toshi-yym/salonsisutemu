import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerFormModal from './customers/CustomerFormModal.jsx';
import { supabase } from '../supabaseClient.js';
import './CustomersPage.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const query = supabase.from('customers').select('*');
    const { data, error } = await query;
    if (error) {
      console.error(error);
      return;
    }
    setCustomers(data);
  }

  const filtered = customers.filter((c) => {
    const keyword = search.toLowerCase();
    return c.name.toLowerCase().includes(keyword) || c.phone?.includes(keyword);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'last') return (b.last_visit || '').localeCompare(a.last_visit || '');
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="customers-page">
      <div className="top-bar">
        <button onClick={() => setModalOpen(true)}>新規登録</button>
        <div className="search-bar">
        <input
          placeholder="名前・電話番号検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
        <div className="sort-bar">
          <label>
            並び替え:
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">名前順</option>
              <option value="last">来店日順</option>
            </select>
          </label>
        </div>
      </div>
      <table className="customers-table">
        <thead>
          <tr>
            <th>名前</th>
            <th>電話</th>
            <th>誕生日</th>
            <th>最終来店</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((c) => (
            <tr key={c.id}>
              <td><Link to={`/customers/${c.id}`}>{c.name}</Link></td>
              <td>{c.phone}</td>
              <td>{c.birthday}</td>
              <td>{c.last_visit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>前</button>
        <span>{page}/{totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>次</button>
      </div>
      {modalOpen && (
        <CustomerFormModal onClose={() => setModalOpen(false)} onSaved={fetchCustomers} />
      )}
    </div>
  );
}
