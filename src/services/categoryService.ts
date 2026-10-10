import { useSyncExternalStore } from 'react'
import { categories as fixtures } from '../data/mockData'
import type { Category } from '../types'
import { safeRoutePart } from './safeContent'

export type CategoryInput = Omit<Category, 'id'>
type Snapshot = { categories: Category[]; error: string }

const storageKey = 'griha-mart:categories:v1'
const accents = ['mint', 'coral', 'amber', 'blue', 'cream', 'pink']
const listeners = new Set<() => void>()

function validate(category: Category) {
  if (!safeRoutePart(category.id)) throw new Error('Category ID is invalid.')
  if (!category.name.trim() || category.name.length > 60) throw new Error('Enter a category name up to 60 characters.')
  if (!category.mood.trim() || category.mood.length > 80) throw new Error('Enter a shopping label up to 80 characters.')
  if (!accents.includes(category.accent)) throw new Error('Choose a category colour.')
}

function read(): Snapshot {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { categories: fixtures, error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Invalid categories')
    parsed.forEach(validate)
    const saved = parsed as Category[]
    const merged = [...fixtures, ...saved.filter(category => !fixtures.some(fixture => fixture.id === category.id))]
    return { categories: merged, error: '' }
  } catch {
    return { categories: fixtures, error: 'We couldn’t load your saved categories. Please check browser storage and try again.' }
  }
}

let snapshot = read()
function publish() { snapshot = read(); listeners.forEach(listener => listener()) }
function customCategories() { return snapshot.categories.filter(category => !fixtures.some(fixture => fixture.id === category.id)) }

export const categoryService = {
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
  getSnapshot: () => snapshot,
  list: () => snapshot.categories,
  async create(input: CategoryInput): Promise<Category> {
    const name = input.name.trim()
    const mood = input.mood.trim()
    const current = read()
    if (current.error) throw new Error(current.error)
    if (current.categories.some(category => category.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('A category with this name already exists.')
    const base = name.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) || 'category'
    const suffix = crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
    const category: Category = { id: `${base}-${suffix}`, name, mood, accent: input.accent }
    validate(category)
    try { localStorage.setItem(storageKey, JSON.stringify([...customCategories(), category])) }
    catch { throw new Error('Could not save the category. Check browser storage and try again.') }
    publish()
    return category
  },
}

window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) publish() })

export function useCategories() {
  return useSyncExternalStore(categoryService.subscribe, categoryService.getSnapshot)
}
