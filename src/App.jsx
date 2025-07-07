import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import CalendarView from './components/CalendarView.jsx';
import Placeholder from './components/Placeholder.jsx';
import CustomerDetail from './components/customers/CustomerDetail.jsx';
import CustomerFormPage from './components/customers/CustomerFormPage.jsx';
import CustomersPage from './components/CustomersPage.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1 className="logo">Salon Manager</h1>
        <nav>
          <ul>
            <li><NavLink to="/" end>予約カレンダー</NavLink></li>
            <li>
              <details>
                <summary>顧客</summary>
                <ul>
                  <li><NavLink to="/customers">顧客一覧</NavLink></li>
                  <li><NavLink to="/customer/register">顧客登録</NavLink></li>
                  <li><NavLink to="/reservation/new">新しい予約</NavLink></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>売上げ</summary>
                <ul>
                  <li><NavLink to="/sales/new">新しい売上げ</NavLink></li>
                  <li><NavLink to="/sales/status">売り上げ状況</NavLink></li>
                  <li><NavLink to="/sales/summary">売り上げ集計</NavLink></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>スタッフ</summary>
                <ul>
                  <li><NavLink to="/staff/new">新しいスタッフ</NavLink></li>
                  <li><NavLink to="/staff/edit">スタッフの編集</NavLink></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>店舗</summary>
                <ul>
                  <li><NavLink to="/store/info">店舗情報</NavLink></li>
                  <li><NavLink to="/store/tech-menu">技術メニューの編集</NavLink></li>
                  <li><NavLink to="/store/product-menu">商品メニューの編集</NavLink></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>設定</summary>
                <ul>
                  <li><NavLink to="/settings/karte">カルテ設定</NavLink></li>
                  <li><NavLink to="/settings/schedule">スケジュール設定</NavLink></li>
                  <li><NavLink to="/settings/reservation-menu">予約メニューの設定</NavLink></li>
                </ul>
              </details>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          {/* 顧客 */}
          <Route path="/customer/register" element={<CustomerFormPage />} />
          <Route path="/customer/edit/:id" element={<CustomerFormPage />} />
          
          <Route path="/reservation/new" element={<Placeholder title="新しい予約" />} />

          {/* 売上げ */}
          <Route path="/sales/new" element={<Placeholder title="新しい売上げ" />} />
          <Route path="/sales/status" element={<Placeholder title="売り上げ状況" />} />
          <Route path="/sales/summary" element={<Placeholder title="売り上げ集計" />} />

          {/* スタッフ */}
          <Route path="/staff/new" element={<Placeholder title="新しいスタッフ" />} />
          <Route path="/staff/edit" element={<Placeholder title="スタッフの編集" />} />

          {/* 店舗 */}
          <Route path="/store/info" element={<Placeholder title="店舗情報" />} />
          <Route path="/store/tech-menu" element={<Placeholder title="技術メニューの編集" />} />
          <Route path="/store/product-menu" element={<Placeholder title="商品メニューの編集" />} />

          {/* 設定 */}
          <Route path="/settings/karte" element={<Placeholder title="カルテ設定" />} />
          <Route path="/settings/schedule" element={<Placeholder title="スケジュール設定" />} />
          <Route path="/settings/reservation-menu" element={<Placeholder title="予約メニューの設定" />} />
        </Routes>
      </main>
    </div>
  );
}
