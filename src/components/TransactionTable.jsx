export default function TransactionTable({ transactions = [] }) {
  const formatAmount = (amount) => {
    if (typeof amount === 'number') {
      return `Rs.${amount.toLocaleString('en-IN')}`
    }
    return amount // already formatted string (fallback)
  }

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
          {transactions.map((txn) => {
            const isPending = !txn.status
            return (
              <tr key={txn.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 12 }}>{txn.id}</td>
                <td style={{ fontWeight: 600 }}>{formatAmount(txn.amount)}</td>
                <td>{txn.merchant}</td>
                <td style={{ color: '#64748b' }}>{txn.location}</td>
                <td>
                  {isPending ? (
                    <span style={{
                      background: 'rgba(100,116,139,0.1)',
                      color: '#64748b',
                      border: '1px solid rgba(100,116,139,0.2)',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#64748b', display: 'inline-block',
                        animation: 'pulse-ring 1.5s ease-out infinite',
                      }} />
                      Analyzing...
                    </span>
                  ) : (
                    <span className={txn.status === 'FRAUD' ? 'badge-fraud' : 'badge-safe'}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: txn.status === 'FRAUD' ? '#ef4444' : '#10b981',
                        display: 'inline-block', marginRight: 5,
                      }} />
                      {txn.status}
                    </span>
                  )}
                </td>
                <td>
                  {isPending ? (
                    <span style={{ fontSize: 12, color: '#374151' }}>—</span>
                  ) : (
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
                  )}
                </td>
              </tr>
            )
          })}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#374151', padding: '32px', fontSize: 13 }}>
                No transactions yet. Use the analyzer above to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
