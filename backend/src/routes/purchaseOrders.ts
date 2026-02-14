import { Router } from 'express'
import { mock } from '../data/mock.js'
import type { POKategori, POStatus } from '../data/mock.js'

export const purchaseOrdersRouter = Router()

function nextNoRegistrasi(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(-2)
  const prefix = `MTC/SPB/${mm}/${yy}/`
  const existing = mock.purchaseOrders
    .filter((po) => po.noRegistrasi.startsWith(prefix))
    .map((po) => {
      const num = po.noRegistrasi.slice(prefix.length)
      return parseInt(num, 10) || 0
    })
  const nextNum = existing.length === 0 ? 1 : Math.max(...existing) + 1
  return `${prefix}${String(nextNum).padStart(4, '0')}`
}

purchaseOrdersRouter.get('/purchase-orders', (_, res) => {
  res.json(mock.purchaseOrders)
})

purchaseOrdersRouter.get('/purchase-orders/:id', (req, res) => {
  const id = req.params.id
  const po = mock.purchaseOrders.find((p) => p.id === id)
  if (!po) return res.status(404).json({ error: 'PO tidak ditemukan.' })
  res.json(po)
})

purchaseOrdersRouter.patch('/purchase-orders/:id', (req, res) => {
  const id = req.params.id
  const po = mock.purchaseOrders.find((p) => p.id === id)
  if (!po) return res.status(404).json({ error: 'PO tidak ditemukan.' })
  const body = req.body as {
    noPO?: string
    status?: POStatus
    noQuotation?: string
    [key: string]: unknown
  }
  const statusOptions: POStatus[] = ['Tahap 1', 'Tahap 2', 'Tahap 3', 'Tahap 4', 'Tahap 5', 'Tahap 6', 'Tahap 7']
  if (body.noPO !== undefined) po.noPO = String(body.noPO).trim()
  if (body.noQuotation !== undefined) po.noQuotation = String(body.noQuotation).trim()
  if (body.status && statusOptions.includes(body.status)) po.status = body.status
  res.json(po)
})

purchaseOrdersRouter.post('/purchase-orders', (req, res) => {
  const body = req.body as {
    tanggal?: string
    itemDeskripsi?: string
    model?: string
    hargaPerUnit?: number
    qty?: number
    noPO?: string
    mesin?: string
    noQuotation?: string
    supplier?: string
    kategori?: POKategori
    status?: POStatus
  }
  if (!body.tanggal?.trim()) {
    return res.status(400).json({ error: 'Tanggal wajib diisi.' })
  }
  if (!body.itemDeskripsi?.trim()) {
    return res.status(400).json({ error: 'Item Deskripsi wajib diisi.' })
  }
  const hargaPerUnit = typeof body.hargaPerUnit === 'number' ? body.hargaPerUnit : Number(body.hargaPerUnit) || 0
  const qty = typeof body.qty === 'number' ? body.qty : Number(body.qty) || 0
  const totalHarga = hargaPerUnit * qty
  const kategoriOptions: POKategori[] = ['Preventive', 'Sparepart', 'Breakdown/Repair']
  const statusOptions: POStatus[] = ['Tahap 1', 'Tahap 2', 'Tahap 3', 'Tahap 4', 'Tahap 5', 'Tahap 6', 'Tahap 7']
  const kategori = body.kategori && kategoriOptions.includes(body.kategori) ? body.kategori : 'Sparepart'
  const status = body.status && statusOptions.includes(body.status) ? body.status : 'Tahap 1'

  const noRegistrasi = nextNoRegistrasi()
  const id = String(mock.purchaseOrders.length + 1)
  const newPO = {
    id,
    tanggal: body.tanggal.trim(),
    itemDeskripsi: body.itemDeskripsi.trim(),
    model: (body.model ?? '').trim(),
    hargaPerUnit,
    qty,
    noRegistrasi,
    noPO: (body.noPO ?? '').trim(),
    mesin: (body.mesin ?? '').trim(),
    noQuotation: (body.noQuotation ?? '').trim(),
    supplier: (body.supplier ?? '').trim(),
    kategori,
    totalHarga,
    status,
  }
  mock.purchaseOrders.push(newPO as (typeof mock.purchaseOrders)[0])
  res.status(201).json(newPO)
})

purchaseOrdersRouter.delete('/purchase-orders/:id', (req, res) => {
  const id = req.params.id
  const idx = mock.purchaseOrders.findIndex((p) => p.id === id)
  if (idx === -1) return res.status(404).json({ error: 'PO tidak ditemukan.' })
  mock.purchaseOrders.splice(idx, 1)
  res.status(204).send()
})
