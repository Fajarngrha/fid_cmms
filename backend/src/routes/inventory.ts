import { Router } from 'express'
import { mock } from '../data/mock.js'
import type { SparePart } from '../data/mock.js'

export const inventoryRouter = Router()

inventoryRouter.get('/inventory/spare-parts', (_, res) => {
  res.json(mock.spareParts)
})

// Tambah spare part baru
inventoryRouter.post('/inventory/spare-parts', (req, res) => {
  const body = req.body as {
    partCode?: string
    name?: string
    category?: string
    stock?: number
    minStock?: number
    unit?: string
    location?: string
    spec?: string
    forMachine?: string
  }
  if (!body.name?.trim()) {
    return res.status(400).json({ error: 'Nama spare part wajib diisi.' })
  }
  if (!body.category?.trim()) {
    return res.status(400).json({ error: 'Kategori wajib diisi.' })
  }
  const partCode = body.partCode?.trim() || `PRT-${String(mock.spareParts.length + 1).padStart(3, '0')}`
  const existing = mock.spareParts.find((p) => p.partCode.toLowerCase() === partCode.toLowerCase())
  if (existing) {
    return res.status(400).json({ error: 'Part code sudah digunakan.' })
  }
  const stock = typeof body.stock === 'number' ? body.stock : Number(body.stock) || 0
  const minStock = typeof body.minStock === 'number' ? body.minStock : Number(body.minStock) || 0
  const id = String(mock.spareParts.length + 1)
  const newPart: SparePart = {
    id,
    partCode,
    name: body.name.trim(),
    category: body.category.trim(),
    stock: stock >= 0 ? stock : 0,
    minStock: minStock >= 0 ? minStock : 0,
    unit: body.unit?.trim() || 'pcs',
    location: body.location?.trim() || '',
    spec: body.spec?.trim() || undefined,
    forMachine: body.forMachine?.trim() || undefined,
  }
  mock.spareParts.push(newPart)
  res.status(201).json(newPart)
})

// Keluar spare part (kurangi stock)
inventoryRouter.patch('/inventory/spare-parts/:id/issue', (req, res) => {
  const id = req.params.id
  const body = req.body as { qty?: number; reason?: string }
  const qty = typeof body.qty === 'number' ? body.qty : Number(body.qty)
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Jumlah keluar (qty) harus bilangan bulat positif.' })
  }
  const part = mock.spareParts.find((p) => p.id === id)
  if (!part) {
    return res.status(404).json({ error: 'Spare part tidak ditemukan.' })
  }
  if (part.stock < qty) {
    return res.status(400).json({ error: `Stock tidak cukup. Tersedia: ${part.stock} ${part.unit}.` })
  }
  part.stock -= qty
  res.json(part)
})
