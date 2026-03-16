import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { KanbanColumnDef } from '@/types'
import { toast } from '@/hooks/use-toast'
import useLeadStore from './useLeadStore'

interface KanbanStore {
  columns: KanbanColumnDef[]
  isLoading: boolean
  fetchColumns: () => Promise<void>
  addColumn: (title: string, color: string) => Promise<void>
  updateColumn: (id: string, title: string, color: string) => Promise<void>
  deleteColumn: (id: string) => Promise<void>
  reorderColumns: (sourceId: string, targetIndex: number) => Promise<void>
}

const KanbanContext = createContext<KanbanStore | undefined>(undefined)

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { fetchLeads } = useLeadStore()
  const [columns, setColumns] = useState<KanbanColumnDef[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchColumns = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        const defaults = [
          { user_id: user.id, title: 'Novo Contato', color: '#3b82f6', position: 0 },
          { user_id: user.id, title: 'Agendado', color: '#a855f7', position: 1 },
          { user_id: user.id, title: 'Em Atendimento', color: '#f97316', position: 2 },
          { user_id: user.id, title: 'Convertido', color: '#10b981', position: 3 },
          { user_id: user.id, title: 'Perdido', color: '#ef4444', position: 4 },
        ]
        const { data: inserted, error: insertError } = await supabase
          .from('kanban_columns')
          .insert(defaults)
          .select()

        if (insertError) throw insertError

        if (inserted) {
          setColumns(inserted)
          await Promise.all([
            supabase
              .from('leads')
              .update({ status: 'Novo Contato' })
              .eq('status', 'novo_contato')
              .eq('user_id', user.id),
            supabase
              .from('leads')
              .update({ status: 'Agendado' })
              .eq('status', 'agendado')
              .eq('user_id', user.id),
            supabase
              .from('leads')
              .update({ status: 'Em Atendimento' })
              .eq('status', 'em_atendimento')
              .eq('user_id', user.id),
            supabase
              .from('leads')
              .update({ status: 'Convertido' })
              .eq('status', 'convertido')
              .eq('user_id', user.id),
            supabase
              .from('leads')
              .update({ status: 'Perdido' })
              .eq('status', 'perdido')
              .eq('user_id', user.id),
          ])
          fetchLeads()
        }
      } else {
        const uniqueData = data.filter(
          (col, index, self) =>
            index === self.findIndex((t) => t.title.toLowerCase() === col.title.toLowerCase()),
        )
        setColumns(uniqueData)
      }
    } catch (err) {
      console.error('Failed to load kanban columns, applying safe fallbacks:', err)
      // Provide robust fallback so the Kanban board tabs are always visible
      const fallbackDefaults: KanbanColumnDef[] = [
        {
          id: 'fallback-1',
          user_id: user.id,
          title: 'Novo Contato',
          color: '#3b82f6',
          position: 0,
        },
        { id: 'fallback-2', user_id: user.id, title: 'Agendado', color: '#a855f7', position: 1 },
        {
          id: 'fallback-3',
          user_id: user.id,
          title: 'Em Atendimento',
          color: '#f97316',
          position: 2,
        },
        { id: 'fallback-4', user_id: user.id, title: 'Convertido', color: '#10b981', position: 3 },
        { id: 'fallback-5', user_id: user.id, title: 'Perdido', color: '#ef4444', position: 4 },
      ]
      setColumns(fallbackDefaults)
    } finally {
      setIsLoading(false)
    }
  }, [user, fetchLeads])

  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  const addColumn = async (title: string, color: string) => {
    if (!user) return
    const cleanTitle = title.trim()

    if (columns.some((c) => c.title.toLowerCase() === cleanTitle.toLowerCase())) {
      toast({
        title: 'Erro',
        description: 'Já existe uma coluna com este nome',
        variant: 'destructive',
      })
      return
    }

    const position = columns.length > 0 ? Math.max(...columns.map((c) => c.position)) + 1 : 0
    const { data, error } = await supabase
      .from('kanban_columns')
      .insert([{ title: cleanTitle, color, position, user_id: user.id }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Erro',
          description: 'Já existe uma coluna com este nome',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Erro', description: 'Erro ao criar coluna', variant: 'destructive' })
      }
      return
    }
    setColumns((prev) => [...prev, data])
    toast({ title: 'Sucesso', description: 'Coluna adicionada com sucesso!' })
  }

  const updateColumn = async (id: string, title: string, color: string) => {
    const col = columns.find((c) => c.id === id)
    if (!col || !user) return

    const cleanTitle = title.trim()
    const isDuplicate = columns.some(
      (c) => c.id !== id && c.title.toLowerCase() === cleanTitle.toLowerCase(),
    )

    if (isDuplicate) {
      toast({
        title: 'Erro',
        description: 'Já existe outra coluna com este nome',
        variant: 'destructive',
      })
      return
    }

    const oldTitle = col.title

    const { error } = await supabase
      .from('kanban_columns')
      .update({ title: cleanTitle, color })
      .eq('id', id)

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Erro',
          description: 'Já existe uma coluna com este nome',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Erro', description: 'Erro ao atualizar coluna', variant: 'destructive' })
      }
      return
    }

    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title: cleanTitle, color } : c)))

    if (oldTitle !== cleanTitle) {
      await supabase
        .from('leads')
        .update({ status: cleanTitle })
        .eq('status', oldTitle)
        .eq('user_id', user.id)
      fetchLeads()
    }
    toast({ title: 'Sucesso', description: 'Coluna atualizada com sucesso!' })
  }

  const deleteColumn = async (id: string) => {
    const colToDelete = columns.find((c) => c.id === id)
    const fallbackCol = columns.find((c) => c.id !== id)
    if (!colToDelete || !fallbackCol || !user) return

    const { error } = await supabase.from('kanban_columns').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao deletar coluna', variant: 'destructive' })
      return
    }

    await supabase
      .from('leads')
      .update({ status: fallbackCol.title })
      .eq('status', colToDelete.title)
      .eq('user_id', user.id)
    setColumns((prev) => prev.filter((c) => c.id !== id))
    fetchLeads()
    toast({ title: 'Sucesso', description: 'Coluna excluída e leads movidos' })
  }

  const reorderColumns = async (sourceId: string, targetIndex: number) => {
    const newCols = [...columns]
    const srcIdx = newCols.findIndex((c) => c.id === sourceId)
    if (srcIdx === -1 || targetIndex < 0 || targetIndex >= newCols.length) return

    const [moved] = newCols.splice(srcIdx, 1)
    newCols.splice(targetIndex, 0, moved)

    const updated = newCols.map((c, idx) => ({ ...c, position: idx }))
    setColumns(updated)

    Promise.all(
      updated.map((col) =>
        supabase.from('kanban_columns').update({ position: col.position }).eq('id', col.id),
      ),
    )
      .then((results) => {
        const hasError = results.some((r) => r.error)
        if (hasError) {
          toast({
            title: 'Erro',
            description: 'Erro ao salvar a ordem das etapas',
            variant: 'destructive',
          })
        } else {
          toast({ title: 'Sucesso', description: 'Etapas do funil reorganizadas com sucesso' })
        }
      })
      .catch(() => {
        toast({
          title: 'Erro',
          description: 'Erro ao salvar a ordem das etapas',
          variant: 'destructive',
        })
      })
  }

  return (
    <KanbanContext.Provider
      value={{
        columns,
        isLoading,
        fetchColumns,
        addColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}

export function useKanbanStore() {
  const context = useContext(KanbanContext)
  if (!context) throw new Error('useKanbanStore must be used within KanbanProvider')
  return context
}
