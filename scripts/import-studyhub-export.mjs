import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {}
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  const out = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function normalizeText(v) {
  return String(v ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function nonEmpty(value) {
  const v = value == null ? null : String(value).trim()
  return v ? v : null
}

async function main() {
  const workspace = process.cwd()
  const env = parseEnvFile(path.join(workspace, '.env'))

  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  }

  const defaultJsonPath = 'C:/Users/MAHESH/Downloads/studyhub-export-2026-03-28.json'
  const inputPath = process.argv[2] || defaultJsonPath

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Export file not found: ${inputPath}`)
  }

  const raw = fs.readFileSync(inputPath, 'utf8')
  const data = JSON.parse(raw)

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const summary = {
    subjects: { inserted: 0, skipped: 0 },
    notes: { inserted: 0, skipped: 0, skippedMissingSubject: 0 },
    tasks: { inserted: 0, skipped: 0 },
    links: { inserted: 0, skipped: 0 },
    dsaProblems: { inserted: 0, skipped: 0 },
    calendarEvents: { inserted: 0, skipped: 0 },
  }

  const subjectIdMap = new Map()

  // Subjects
  const { data: existingSubjects, error: existingSubjectsError } = await supabase
    .from('subjects')
    .select('id, name')

  if (existingSubjectsError) throw existingSubjectsError

  const subjectNameToId = new Map()
  for (const s of existingSubjects ?? []) {
    subjectNameToId.set(normalizeText(s.name), s.id)
  }

  for (const s of data.subjects ?? []) {
    const key = normalizeText(s.name)
    const foundId = subjectNameToId.get(key)

    if (foundId) {
      subjectIdMap.set(s.id, foundId)
      summary.subjects.skipped += 1
      continue
    }

    const payload = {
      name: nonEmpty(s.name) || 'Untitled Subject',
      description: nonEmpty(s.description),
      color: nonEmpty(s.color) || '#6c63ff',
      icon: nonEmpty(s.icon) || '📚',
    }

    const { data: inserted, error } = await supabase
      .from('subjects')
      .insert(payload)
      .select('id, name')
      .single()

    if (error) throw error

    subjectIdMap.set(s.id, inserted.id)
    subjectNameToId.set(normalizeText(inserted.name), inserted.id)
    summary.subjects.inserted += 1
  }

  // Notes
  const { data: existingNotes, error: existingNotesError } = await supabase
    .from('notes')
    .select('subject_id, title')

  if (existingNotesError) throw existingNotesError

  const noteKeySet = new Set(
    (existingNotes ?? []).map((n) => `${n.subject_id}::${normalizeText(n.title)}`)
  )

  for (const n of data.notes ?? []) {
    const mappedSubjectId = subjectIdMap.get(n.subject_id)
    if (!mappedSubjectId) {
      summary.notes.skippedMissingSubject += 1
      continue
    }

    const key = `${mappedSubjectId}::${normalizeText(n.title)}`
    if (noteKeySet.has(key)) {
      summary.notes.skipped += 1
      continue
    }

    const payload = {
      subject_id: mappedSubjectId,
      title: nonEmpty(n.title) || 'Untitled Note',
      content: nonEmpty(n.content),
      is_important: Boolean(n.is_important),
      tags: Array.isArray(n.tags) ? n.tags : [],
      updated_at: n.updated_date || new Date().toISOString(),
    }

    const { error } = await supabase.from('notes').insert(payload)
    if (error) throw error

    noteKeySet.add(key)
    summary.notes.inserted += 1
  }

  // Tasks
  const { data: existingTasks, error: existingTasksError } = await supabase
    .from('tasks')
    .select('title, checklist_name, due_date')

  if (existingTasksError) throw existingTasksError

  const taskKeySet = new Set(
    (existingTasks ?? []).map((t) => {
      const checklist = normalizeText(t.checklist_name)
      const due = t.due_date || ''
      return `${normalizeText(t.title)}::${checklist}::${due}`
    })
  )

  for (const t of data.tasks ?? []) {
    const dueDate = nonEmpty(t.due_date)
    const key = `${normalizeText(t.title)}::${normalizeText(t.checklist_name)}::${dueDate || ''}`

    if (taskKeySet.has(key)) {
      summary.tasks.skipped += 1
      continue
    }

    const payload = {
      title: nonEmpty(t.title) || 'Untitled Task',
      checklist_name: nonEmpty(t.checklist_name),
      completed: Boolean(t.completed),
      due_date: dueDate,
      priority: ['Low', 'Medium', 'High'].includes(t.priority) ? t.priority : 'Medium',
    }

    const { error } = await supabase.from('tasks').insert(payload)
    if (error) throw error

    taskKeySet.add(key)
    summary.tasks.inserted += 1
  }

  // Links
  const { data: existingLinks, error: existingLinksError } = await supabase
    .from('links')
    .select('url')

  if (existingLinksError) throw existingLinksError

  const linkUrlSet = new Set((existingLinks ?? []).map((l) => normalizeText(l.url)))

  for (const l of data.links ?? []) {
    const normalizedUrl = normalizeText(l.url)
    if (!normalizedUrl || linkUrlSet.has(normalizedUrl)) {
      summary.links.skipped += 1
      continue
    }

    const payload = {
      title: nonEmpty(l.title) || 'Untitled Link',
      url: nonEmpty(l.url),
      description: nonEmpty(l.description),
      category: ['DSA Problems', 'YouTube', 'Articles', 'Coding Platforms', 'Other'].includes(l.category)
        ? l.category
        : 'Other',
      tags: Array.isArray(l.tags) ? l.tags : [],
    }

    const { error } = await supabase.from('links').insert(payload)
    if (error) throw error

    linkUrlSet.add(normalizedUrl)
    summary.links.inserted += 1
  }

  // DSA Problems
  const { data: existingProblems, error: existingProblemsError } = await supabase
    .from('dsa_problems')
    .select('title, url')

  if (existingProblemsError) throw existingProblemsError

  const dsaKeySet = new Set(
    (existingProblems ?? []).map((p) => `${normalizeText(p.title)}::${normalizeText(p.url)}`)
  )

  for (const p of data.dsaProblems ?? []) {
    const key = `${normalizeText(p.title)}::${normalizeText(p.url)}`
    if (dsaKeySet.has(key)) {
      summary.dsaProblems.skipped += 1
      continue
    }

    const payload = {
      title: nonEmpty(p.title) || 'Untitled Problem',
      url: nonEmpty(p.url),
      status: ['Not Started', 'In Progress', 'Completed'].includes(p.status) ? p.status : 'Not Started',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(p.difficulty) ? p.difficulty : 'Medium',
      topic: nonEmpty(p.topic),
      notes: nonEmpty(p.notes),
    }

    const { error } = await supabase.from('dsa_problems').insert(payload)
    if (error) throw error

    dsaKeySet.add(key)
    summary.dsaProblems.inserted += 1
  }

  // Calendar Events
  const { data: existingEvents, error: existingEventsError } = await supabase
    .from('calendar_events')
    .select('title, date, time')

  if (existingEventsError) throw existingEventsError

  const eventKeySet = new Set(
    (existingEvents ?? []).map((e) => `${normalizeText(e.title)}::${e.date || ''}::${e.time || ''}`)
  )

  for (const e of data.calendarEvents ?? []) {
    const key = `${normalizeText(e.title)}::${e.date || ''}::${e.time || ''}`
    if (eventKeySet.has(key)) {
      summary.calendarEvents.skipped += 1
      continue
    }

    const payload = {
      title: nonEmpty(e.title) || 'Untitled Event',
      date: e.date,
      time: nonEmpty(e.time),
      type: ['Study', 'Assignment', 'Exam', 'Reminder', 'Other'].includes(e.type) ? e.type : 'Other',
      description: nonEmpty(e.description),
    }

    const { error } = await supabase.from('calendar_events').insert(payload)
    if (error) throw error

    eventKeySet.add(key)
    summary.calendarEvents.inserted += 1
  }

  console.log('Import complete.')
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((err) => {
  console.error('Import failed:')
  console.error(err)
  process.exit(1)
})
