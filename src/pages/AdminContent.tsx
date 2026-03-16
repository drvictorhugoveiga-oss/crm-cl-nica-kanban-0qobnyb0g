import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Database } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface ContentItem {
  id: string
  title: string
  description: string | null
  video_url: string | null
  category: string
}

export default function AdminContent() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    category: 'tutorial',
  })

  const fetchItems = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('tutorial_links')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setItems(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openDialog = (item?: ContentItem) => {
    setEditingItem(item || null)
    setFormData(
      item
        ? {
            title: item.title,
            description: item.description || '',
            video_url: item.video_url || '',
            category: item.category,
          }
        : { title: '', description: '', video_url: '', category: 'tutorial' },
    )
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title) return toast.error('Título é obrigatório.')
    if (formData.category === 'tutorial' && !formData.video_url)
      return toast.error('URL do vídeo é obrigatória para tutoriais.')
    if (formData.category === 'faq' && !formData.description)
      return toast.error('Resposta (conteúdo) é obrigatória para FAQs.')

    const payload = {
      title: formData.title,
      description: formData.description || null,
      video_url: formData.category === 'tutorial' ? formData.video_url : null,
      category: formData.category,
    }

    const { error } = editingItem
      ? await supabase.from('tutorial_links').update(payload).eq('id', editingItem.id)
      : await supabase.from('tutorial_links').insert([payload])

    if (error) return toast.error('Erro ao salvar item.')
    toast.success('Item salvo com sucesso!')
    setIsDialogOpen(false)
    fetchItems()
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const { error } = await supabase.from('tutorial_links').delete().eq('id', deletingId)
    if (error) return toast.error('Erro ao excluir item.')
    toast.success('Item excluído com sucesso!')
    setIsAlertOpen(false)
    fetchItems()
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                <Database className="h-6 w-6 text-primary" />
              </div>
              Admin Conteúdo
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Gerencie os tutoriais e FAQs do sistema.
            </p>
          </div>
          <Button onClick={() => openDialog()} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Novo Item
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant={item.category === 'tutorial' ? 'default' : 'secondary'}>
                          {item.category === 'tutorial' ? 'Vídeo' : 'FAQ'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(item.id)
                            setIsAlertOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutorial">Tutorial em Vídeo</SelectItem>
                  <SelectItem value="faq">Pergunta Frequente (FAQ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            {formData.category === 'tutorial' && (
              <div className="space-y-2">
                <Label>URL do Vídeo</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{formData.category === 'faq' ? 'Resposta (Conteúdo)' : 'Descrição'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
