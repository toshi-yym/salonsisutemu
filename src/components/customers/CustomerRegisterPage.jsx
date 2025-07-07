import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerFormModal from './CustomerFormModal.jsx';

export default function CustomerRegisterPage() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  function handleClose() {
    setOpen(false);
    navigate('/customers');
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>新規顧客登録</h2>
      {open && <CustomerFormModal onClose={handleClose} onSaved={handleClose} />}
    </div>
  );
}
