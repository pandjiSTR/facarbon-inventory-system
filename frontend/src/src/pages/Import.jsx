import { useState } from 'react'
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import ImportFinanceTab from '../components/import/ImportFinanceTab'
import ImportStockInTab from '../components/import/ImportStockInTab'
import ImportStockOutTab from '../components/import/ImportStockOutTab'

const TABS = [
  { key: 'finance',   label: 'Keuangan',      icon: Wallet },
  { key: 'stock-in',  label: 'Barang Masuk',  icon: ArrowDownToLine },
  { key: 'stock-out', label: 'Barang Keluar', icon: ArrowUpFromLine },
]

export default function Import() {
  const [activeTab, setActiveTab] = useState('finance')

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Import Data
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Import data historis dari file Excel — keuangan, barang masuk, dan barang keluar
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
      }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                fontWeight: active ? 600 : 400,
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'finance' && <ImportFinanceTab />}
      {activeTab === 'stock-in' && <ImportStockInTab />}
      {activeTab === 'stock-out' && <ImportStockOutTab />}
    </div>
  )
}
