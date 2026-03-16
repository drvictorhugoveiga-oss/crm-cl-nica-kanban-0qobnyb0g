import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  Save,
  FolderOpen,
  Download,
  Trash,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import useLeadStore from '@/stores/useLeadStore'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { cn } from '@/lib/utils'
import { SaveFilterDialog } from './SaveFilterDialog'
import { exportToCSV, exportToExcel } from '@/lib/export'

export function KanbanFilters() {
  const {
    searchQuery,
    setSearchQuery,
    sourceFilter,
    setSourceFilter,
    origins,
    dateRange,
    setDateRange,
    selectedStages,
    setSelectedStages,
    clearFilters,
    savedFilters,
    deleteSavedFilter,
    applySavedFilter,
    getFilteredLeads,
  } = useLeadStore()

  const { columns } = useKanbanStore()
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const hasActiveFilters =
    searchQuery !== '' ||
    sourceFilter !== 'all' ||
    selectedStages.length > 0 ||
    dateRange !== undefined

  const handleExportCSV = async () => {
    setIsExporting(true)
    await new Promise((r) => setTimeout(r, 100))
    exportToCSV('leads_export', getFilteredLeads())
    setIsExporting(false)
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    await new Promise((r) => setTimeout(r, 100))
    exportToExcel('leads_export', getFilteredLeads())
    setIsExporting(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card border-b border-border shadow-sm animate-fade-in z-10 relative shrink-0">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nome, telefone, email..."
            className="pl-9 h-10 w-full rounded-xl focus-visible:ring-primary/50 transition-all duration-300 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px] h-10 rounded-xl focus:ring-primary/50 transition-all duration-300 bg-background hover:bg-accent">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg border-border">
            <SelectItem value="all">Todas Origens</SelectItem>
            {origins.map((origin) => (
              <SelectItem key={origin.id} value={origin.name} className="cursor-pointer">
                {origin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-10 justify-start text-left font-normal w-[240px] rounded-xl transition-all duration-300 bg-background hover:bg-accent',
                !dateRange && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yy', { locale: ptBR })} -{' '}
                    {format(dateRange.to, 'dd/MM/yy', { locale: ptBR })}
                  </>
                ) : (
                  format(dateRange.from, 'dd/MM/yy', { locale: ptBR })
                )
              ) : (
                <span>Filtrar por data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-border" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              locale={ptBR}
              className="bg-card text-foreground"
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 w-[160px] justify-between rounded-xl transition-all duration-300 bg-background hover:bg-accent"
            >
              Etapas ({selectedStages.length > 0 ? selectedStages.length : 'Todas'})
              <Filter className="h-4 w-4 ml-2 opacity-50 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-border">
            <DropdownMenuLabel>Filtrar Colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={selectedStages.includes(col.title)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStages([...selectedStages, col.title])
                  } else {
                    setSelectedStages(selectedStages.filter((s) => s !== col.title))
                  }
                }}
                className="py-2.5 cursor-pointer rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  {col.title}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0 justify-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              title="Limpar Filtros"
              className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all duration-300"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl bg-background hover:bg-accent transition-all duration-300"
              >
                <FolderOpen className="h-4 w-4 mr-2" /> Salvos ({savedFilters.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-xl shadow-lg border-border" align="end">
              {savedFilters.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Nenhum filtro salvo
                </div>
              ) : (
                savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between group px-1 py-1 rounded-md hover:bg-accent"
                  >
                    <div
                      className="flex-1 cursor-pointer truncate text-sm px-2 py-1.5"
                      onClick={() => applySavedFilter(filter.filters)}
                    >
                      {filter.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSavedFilter(filter.id)
                      }}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="secondary"
            size="sm"
            className="h-10 rounded-xl hover:shadow-md transition-all duration-300"
            onClick={() => setIsSaveDialogOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" /> Salvar Filtro
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl bg-background hover:bg-accent transition-all duration-300"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-border">
              <DropdownMenuItem
                onClick={handleExportCSV}
                className="cursor-pointer py-2.5 rounded-lg hover:bg-accent"
              >
                Exportar para CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportExcel}
                className="cursor-pointer py-2.5 rounded-lg hover:bg-accent"
              >
                Exportar para Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SaveFilterDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen} />
    </>
  )
}
