/// <reference types="vite/client" />

import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Todo {
  _id: string
  text: string
  done: boolean
  date: string // formato: YYYY-MM-DD
}

interface AppProps {
  user: { username: string, role: string }
  onLogout: () => void
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/todos'
const weekDays = [
  { name: 'Segunda', short: 'Mon' },
  { name: 'Terça', short: 'Tue' },
  { name: 'Quarta', short: 'Wed' },
  { name: 'Quinta', short: 'Thu' },
  { name: 'Sexta', short: 'Fri' },
  { name: 'Sábado', short: 'Sat' },
  { name: 'Domingo', short: 'Sun' },
]

function getWeekByOffset(offset: number) {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatISO(date: Date) {
  return date.toISOString().split('T')[0]
}

function isToday(date: Date) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const d = new Date(date)
  d.setHours(0,0,0,0)
  return d.getTime() === today.getTime()
}

function getWeekType(week: Date[]): 'past' | 'current' | 'future' {
  const today = new Date()
  today.setHours(0,0,0,0)
  if (week[6] < today) return 'past'
  if (week[0] > today) return 'future'
  return 'current'
}

export default function App({ user, onLogout }: AppProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [editing, setEditing] = useState<{ dayIdx: number, lineIdx: number } | null>(null)
  const [newTask, setNewTask] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const week = getWeekByOffset(weekOffset)
  const weekType = getWeekType(week)
  const token = localStorage.getItem('token')
  const [editTask, setEditTask] = useState<{ id: string, value: string } | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Erro ao carregar tarefas')
        }
        return res.json()
      })
      .then(data => {
        setTodos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro:', err)
        setError('Não foi possível carregar as tarefas. Verifique se o servidor está rodando.')
        setLoading(false)
      })
  }, [token])

  useEffect(() => {
    setEditing(null)
    setNewTask('')
  }, [weekOffset])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const addTodo = async (dayIdx: number, lineIdx: number) => {
    if (!newTask.trim()) return
    const date = formatISO(week[dayIdx])
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: newTask, date })
    })
    const newTodo = await res.json()
    setTodos((todos: Todo[]) => {
      // Mantém a nova tarefa na mesma linha onde foi criada
      const dayTodos = todos.filter((todo: Todo) => todo.date === date)
      const otherTodos = todos.filter((todo: Todo) => todo.date !== date)
      // Remove qualquer tarefa "vazia" (caso algum bug)
      const before = dayTodos.slice(0, lineIdx)
      const after = dayTodos.slice(lineIdx)
      // Adiciona a nova tarefa na posição correta
      const newDayTodos = [...before, newTodo, ...after]
      // Junta as tarefas do dia na ordem correta com as dos outros dias
      return [...otherTodos, ...newDayTodos]
    })
    setEditing(null)
    setNewTask('')
  }

  const toggleTodo = async (id: string, done: boolean) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ done: !done })
    })
    const updated = await res.json()
    setTodos((todos: Todo[]) => todos.map((todo: Todo) => todo._id === id ? updated : todo))
  }

  const removeTodo = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setTodos((todos: Todo[]) => todos.filter((todo: Todo) => todo._id !== id))
  }

  const handleEdit = (todo: Todo) => {
    setEditTask({ id: todo._id, value: todo.text })
  }

  const saveEdit = async (todo: Todo) => {
    if (!editTask || !editTask.value.trim()) return setEditTask(null)
    const res = await fetch(`${API_URL}/${todo._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: editTask.value })
    })
    const updated = await res.json()
    setTodos((todos: Todo[]) => todos.map((t: Todo) => t._id === todo._id ? updated : t))
    setEditTask(null)
  }

  // Função para reordenar tarefas do dia
  function reorderDayTodos(dayTodos: Todo[], from: number, to: number) {
    const updated = [...dayTodos]
    const [removed] = updated.splice(from, 1)
    updated.splice(to, 0, removed)
    return updated
  }

  return (
    <div className="week-calendar">
      <div className="menu-bar">
        <span className="menu-title">Minimal Todo</span>
        <div className="menu-bar-spacer" />
        <div className="menu-user-cascata" ref={menuRef}>
          <span className="menu-user" onClick={() => setMenuOpen(v => !v)}>{user.username} &#x25BC;</span>
          {menuOpen && (
            <div className="menu-dropdown">
              <button className="menu-logout" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className="week-pagination">
        <button className="nav-btn" onClick={() => setWeekOffset(weekOffset - 1)}>&lt;</button>
        <span className="week-range">
          {formatDate(week[0])} - {formatDate(week[6])}
        </span>
        <button className="nav-btn" onClick={() => setWeekOffset(weekOffset + 1)}>&gt;</button>
      </div>
      {loading ? (
        <div style={{textAlign: 'center', color: '#bbb', padding: '20px'}}>Carregando...</div>
      ) : error ? (
        <div style={{textAlign: 'center', color: '#ff4444', padding: '20px'}}>{error}</div>
      ) : (
        <div className="week-grid">
          {week.map((date, i) => {
            const dayTodos = todos.filter((todo: Todo) => todo.date === formatISO(date)).slice(0, 15)
            let dayClass = ''
            if (weekType === 'past') dayClass = 'past'
            else if (weekType === 'future') dayClass = 'future'
            else if (weekType === 'current') {
              if (isToday(date)) dayClass = 'today'
              else if (date < new Date()) dayClass = 'past'
              else dayClass = 'future'
            }
            const isInactive = dayClass === 'past'
            return (
              <div key={i} className={`week-column ${dayClass}`}>
                <div className="week-header">
                  <span className={`week-date day-number ${dayClass}`}>{date.getDate().toString().padStart(2, '0')}</span>
                  <span className={`week-day ${dayClass}`}>{weekDays[i].name}</span>
                </div>
                <ul className="todo-list">
                  {[...Array(15)].map((_, idx) => {
                    const todo = dayTodos[idx]
                    const isEditing = editing && editing.dayIdx === i && editing.lineIdx === idx
                    return (
                      <li
                        key={idx}
                        className={`todo-item${todo?.done ? ' done' : ''}${draggedIdx === idx ? ' dragging' : ''}${dragOverIdx === idx ? ' dragover' : ''}`}
                        onMouseLeave={() => !isEditing && setEditing(null)}
                        draggable={!!todo}
                        onDragStart={e => {
                          if (!todo) return
                          setDraggedIdx(idx)
                        }}
                        onDragOver={e => {
                          e.preventDefault()
                          if (draggedIdx !== null && draggedIdx !== idx) setDragOverIdx(idx)
                        }}
                        onDrop={e => {
                          e.preventDefault()
                          if (draggedIdx !== null && draggedIdx !== idx) {
                            // Atualiza a ordem das tarefas do dia
                            const newDayTodos = reorderDayTodos(dayTodos, draggedIdx, idx)
                            // Atualiza o estado global mantendo a ordem dos outros dias
                            setTodos((todos: Todo[]) => {
                              const otherTodos = todos.filter((t: Todo) => t.date !== formatISO(date))
                              return [...otherTodos, ...newDayTodos]
                            })
                          }
                          setDraggedIdx(null)
                          setDragOverIdx(null)
                        }}
                        onDragEnd={() => {
                          setDraggedIdx(null)
                          setDragOverIdx(null)
                        }}
                      >
                        {todo ? (
                          editTask && editTask.id === todo._id ? (
                            <form onSubmit={e => { e.preventDefault(); saveEdit(todo) }} style={{ width: '100%' }}>
                              <input
                                className="inline-input"
                                value={editTask.value}
                                autoFocus
                                maxLength={100}
                                onChange={e => setEditTask({ id: todo._id, value: e.target.value })}
                                onBlur={() => saveEdit(todo)}
                              />
                            </form>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={todo.done}
                                onChange={() => toggleTodo(todo._id, todo.done)}
                                className="custom-checkbox"
                              />
                              <span
                                className="todo-text"
                                style={{ textDecoration: todo.done ? 'line-through' : 'none', cursor: 'grab' }}
                                draggable
                                onMouseDown={e => {
                                  // Só ativa drag se clicar e segurar no nome
                                  e.currentTarget.parentElement?.setAttribute('draggable', 'true')
                                }}
                                onMouseUp={e => {
                                  e.currentTarget.parentElement?.setAttribute('draggable', 'false')
                                }}
                              >
                                {todo.text}
                              </span>
                              {!isInactive && (
                                <>
                                  <button className="edit-btn" onClick={() => handleEdit(todo)} title="Editar">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-3.3.71a1 1 0 0 1-1.18-1.18l.71-3.3 9.3-9.3ZM3 17a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H4a1 1 0 0 0-1 1Z" fill="#888"/></svg>
                                  </button>
                                  <button className="remove-btn" onClick={() => removeTodo(todo._id)}>&times;</button>
                                </>
                              )}
                            </>
                          )
                        ) : isEditing ? (
                          <form onSubmit={e => { e.preventDefault(); addTodo(i, idx) }} style={{ width: '100%' }}>
                            <input
                              className="inline-input"
                              value={newTask}
                              autoFocus
                              maxLength={100}
                              onChange={e => setNewTask(e.target.value)}
                              onBlur={() => setEditing(null)}
                            />
                          </form>
                        ) : !isInactive ? (
                          <button
                            className="add-inline-btn"
                            onClick={() => { setEditing({ dayIdx: i, lineIdx: idx }); setNewTask('') }}
                          >
                            +
                          </button>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
