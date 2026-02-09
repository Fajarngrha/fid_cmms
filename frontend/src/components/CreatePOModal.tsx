import { useState, useMemo } from 'react'

interface CreatePOModalProps {
  onClose: () => void
  onSuccess: () => void
}

const KATEGORI_OPTIONS: { value: 'Preventive' | 'Sparepart' | 'Breakdown/Repair'; label: string }[] = [
  { value: 'Preventive', label: 'Preventive' },
  { value: 'Sparepart', label: 'Sparepart' },
  { value: 'Breakdown/Repair', label: 'Breakdown/Repair' },
]
import { PO_STATUS_OPTIONS, type POStatusValue } from '../utils/poStatus'

export function CreatePOModal({ onClose, onSuccess }: CreatePOModalProps) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [itemDeskripsi, setItemDeskripsi] = useState('')
  const [model, setModel] = useState('')
  const [hargaPerUnit, setHargaPerUnit] = useState<number | ''>('')
  const [qty, setQty] = useState<number | ''>('')
  const [noPO, setNoPO] = useState('')
  const [mesin, setMesin] = useState('')
  const [noQuotation, setNoQuotation] = useState('')
  const [supplier, setSupplier] = useState('')
  const [kategori, setKategori] = useState<'Preventive' | 'Sparepart' | 'Breakdown/Repair'>('Sparepart')
  const [status, setStatus] = useState<POStatusValue>('Tahap 1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalHarga = useMemo(() => {
    const h = typeof hargaPerUnit === 'number' ? hargaPerUnit : Number(hargaPerUnit) || 0
    const q = typeof qty === 'number' ? qty : Number(qty) || 0
    return h * q
  }, [hargaPerUnit, qty])

  const formatIdr = (n: number) =>
    'Rp. ' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!itemDeskripsi.trim()) {
      setError('Item Deskripsi wajib diisi.')
      return
    }
    setSubmitting(true)
    fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tanggal,
        itemDeskripsi: itemDeskripsi.trim(),
        model: model.trim(),
        hargaPerUnit: typeof hargaPerUnit === 'number' ? hargaPerUnit : Number(hargaPerUnit) || 0,
        qty: typeof qty === 'number' ? qty : Number(qty) || 0,
        noPO: noPO.trim(),
        mesin: mesin.trim(),
        noQuotation: noQuotation.trim(),
        supplier: supplier.trim(),
        kategori,
        status,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((e) => { throw new Error(e.error || 'Gagal menambah PO') })
        return r.json()
      })
      .then(() => onSuccess())
      .catch((err) => setError(err.message || 'Gagal menambah PO. Silakan coba lagi.'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-po-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 id="create-po-title">Tambah Purchase Order (Tracking PO)</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p style={{ padding: '0 1.25rem', fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
          No Registrasi akan digenerate otomatis dengan format MTC/SPB/MM/YY/XXXX.
        </p>

        <form onSubmit={handleSubmit} style={{ padding: '0 1.25rem 1.25rem' }}>
          <div className="form-group">
            <label className="label" htmlFor="po-tanggal">Tanggal *</label>
            <input
              id="po-tanggal"
              className="input"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="po-item">Item Deskripsi *</label>
            <input
              id="po-item"
              className="input"
              type="text"
              value={itemDeskripsi}
              onChange={(e) => setItemDeskripsi(e.target.value)}
              placeholder="e.g. Ball Bearing 6205"
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="po-model">Model</label>
            <input
              id="po-model"
              className="input"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. SKF 6205-2RS"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="po-harga">Harga / Unit (Rp)</label>
              <input
                id="po-harga"
                className="input"
                type="number"
                min={0}
                value={hargaPerUnit}
                onChange={(e) => setHargaPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="po-qty">Qty</label>
              <input
                id="po-qty"
                className="input"
                type="number"
                min={0}
                value={qty}
                onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
            <strong>Total Harga:</strong> {formatIdr(totalHarga)}
          </div>
          <div className="form-group">
            <label className="label">No Registrasi</label>
            <input className="input" type="text" value="Auto (MTC/SPB/MM/YY/XXXX)" readOnly disabled style={{ opacity: 0.8 }} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="po-nopo">No PO</label>
            <input
              id="po-nopo"
              className="input"
              type="text"
              value={noPO}
              onChange={(e) => setNoPO(e.target.value)}
              placeholder="e.g. PO-2024-001"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="po-mesin">Mesin</label>
            <input
              id="po-mesin"
              className="input"
              type="text"
              value={mesin}
              onChange={(e) => setMesin(e.target.value)}
              placeholder="e.g. Conveyor Belt A"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="po-quotation">No Quotation</label>
            <input
              id="po-quotation"
              className="input"
              type="text"
              value={noQuotation}
              onChange={(e) => setNoQuotation(e.target.value)}
              placeholder="e.g. QUO-2024-015"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="po-supplier">Supplier</label>
            <input
              id="po-supplier"
              className="input"
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. PT Teknik Jaya"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="po-kategori">Kategori</label>
              <select
                id="po-kategori"
                className="select"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as 'Preventive' | 'Sparepart' | 'Breakdown/Repair')}
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="po-status">Status</label>
              <select
                id="po-status"
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as POStatusValue)}
              >
                {PO_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.5rem', background: '#fee2e2', borderRadius: 6, marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tambah PO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
