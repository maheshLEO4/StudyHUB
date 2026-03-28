import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file')
}

import { useAuth } from './auth.jsx'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Generic helpers ────────────────────────────────────────────────────────

export async function dbList(table, { eq, order = 'created_at', asc = false, limit } = {}) {
  let query = supabase.from(table).select('*')
  if (eq) Object.entries(eq).forEach(([k, v]) => (query = query.eq(k, v)))
  query = query.order(order, { ascending: asc })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function dbInsert(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data
}

export async function dbUpdate(table, id, values) {
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

// ─── Subjects ───────────────────────────────────────────────────────────────

export const SubjectAPI = {
  list: () => dbList('subjects'),
  create: (values) => dbInsert('subjects', values),
  update: (id, values) => dbUpdate('subjects', id, values),
  delete: (id) => dbDelete('subjects', id),
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export const NoteAPI = {
  list: (subjectId) => dbList('notes', { eq: { subject_id: subjectId }, order: 'created_at' }),
  listAll: () => dbList('notes', { order: 'updated_at' }),
  create: (values) => dbInsert('notes', { ...values, updated_at: new Date().toISOString() }),
  update: (id, values) => dbUpdate('notes', id, { ...values, updated_at: new Date().toISOString() }),
  delete: (id) => dbDelete('notes', id),
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const TaskAPI = {
  list: () => dbList('tasks'),
  create: (values) => dbInsert('tasks', { ...values, completed: false }),
  update: (id, values) => dbUpdate('tasks', id, values),
  delete: (id) => dbDelete('tasks', id),
  toggleComplete: async (task) => dbUpdate('tasks', task.id, { completed: !task.completed }),
}

// ─── DSA Problems ────────────────────────────────────────────────────────────

export const DSAApi = {
  list: () => dbList('dsa_problems'),
  create: (values) => dbInsert('dsa_problems', values),
  update: (id, values) => dbUpdate('dsa_problems', id, values),
  delete: (id) => dbDelete('dsa_problems', id),
  updateStatus: (id, status) => dbUpdate('dsa_problems', id, { status }),
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

export const CalendarAPI = {
  list: () => dbList('calendar_events', { order: 'date', asc: true }),
  create: (values) => dbInsert('calendar_events', values),
  delete: (id) => dbDelete('calendar_events', id),
}

// ─── Links ───────────────────────────────────────────────────────────────────

export const LinkAPI = {
  list: () => dbList('links'),
  create: (values) => dbInsert('links', values),
  update: (id, values) => dbUpdate('links', id, values),
  delete: (id) => dbDelete('links', id),
}

// ─── Daily Tasks (localStorage only — resets daily) ─────────────────────────

const DAILY_KEY = 'studyhub_daily_tasks_v1'
const todayKey = new Date().toISOString().slice(0, 10)

function loadDailyFromStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}')
    const tasks = raw.tasks ?? []
    if (raw.lastReset !== todayKey && tasks.length > 0) {
      const reset = tasks.map((t) => ({ ...t, done: false }))
      saveDailyToStorage(reset)
      return reset
    }
    if (!raw.lastReset) saveDailyToStorage(tasks)
    return tasks
  } catch {
    return []
  }
}

function saveDailyToStorage(tasks) {
  const existing = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}')
  localStorage.setItem(
    DAILY_KEY,
    JSON.stringify({ tasks, lastReset: existing.lastReset ?? todayKey })
  )
}

export const DailyTaskAPI = {
  load: loadDailyFromStorage,
  save: saveDailyToStorage,
}
