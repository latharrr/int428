import { mockTransactions } from '../utils/mockData.js'

export default function TransactionTable({ transactions = mockTransactions }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>TXN ID</th>
            <th>Amount</th>
            <th>Merchant</th>
            <th>Location</th>
            <th>Status</th>
            <th>Risk %</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 12 }}>{txn.id}</td>
              <td style={{ fontWeight: 600 }}>{txn.amount}</td>
              <td>{txn.merchant}</td>
              <td style={{ color: '#64748b' }}>{txn.location}</td>
              <td>
                <span className={txn.status === 'FRAUD' ? 'badge-fraud' : 'badge-safe'}>
                  {txn.status === 'FRAUD' ? '🔴' : '🟢'} {txn.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, maxWidth: 80 }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 3,
                        width: `${txn.risk}%`,
                        background: txn.risk > 70 ? '#ef4444' : txn.risk > 30 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: txn.risk > 70 ? '#ef4444' : txn.risk > 30 ? '#f59e0b' : '#10b981', fontWeight: 600, minWidth: 35 }}>
                    {txn.risk}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
