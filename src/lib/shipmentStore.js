const STORAGE_KEY = 'aegischain.shipment_runs.v1'

function readAll() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function listShipmentRuns() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getShipmentRun(runId) {
  return readAll().find((record) => record.runId === runId) || null
}

export function getLatestShipmentRun() {
  return listShipmentRuns()[0] || null
}

export function upsertShipmentRun(nextRecord) {
  if (!nextRecord?.runId) {
    return null
  }

  const records = readAll()
  const index = records.findIndex((record) => record.runId === nextRecord.runId)
  if (index >= 0) {
    records[index] = { ...records[index], ...nextRecord }
  } else {
    records.push(nextRecord)
  }

  writeAll(records)
  return nextRecord
}
