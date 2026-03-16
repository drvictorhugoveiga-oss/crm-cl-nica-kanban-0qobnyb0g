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
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Search, Calendar as CalendarIcon, Filter, Save, Download, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import useLeadStore from '@/stores/useLeadStore'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { cn } from '@/lib/utils'

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
    saveFilters,
    loadFilters,
    clearFilters,
  } = useLeadStore()

  const { columns } = useKanbanStore()

  const hasActiveFilters =
    searchQuery !== '' ||
    sourceFilter !== 'all' ||
    selectedStages.length > 0 ||
    dateRange !== undefined

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border-b border-slate-200 shadow-sm animate-fade-in z-10 relative shrink-0">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar nome, telefone, email..."
          className="pl-9 h-10 w-full rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Select value={sourceFilter} onValueChange={setSourceFilter}>
        <SelectTrigger className="w-[160px] h-10 rounded-xl">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Origens</SelectItem>
          {origins.map((origin) => (
            <SelectItem key={origin.id} value={origin.name}>
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
              'h-10 justify-start text-left font-normal w-[240px] rounded-xl',
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
        <PopoverContent className="w-auto p-0 rounded-xl shadow-lg" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 w-[160px] justify-between rounded-xl">
            Etapas ({selectedStages.length > 0 ? selectedStages.length : 'Todas'})
            <Filter className="h-4 w-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl">
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
              className="py-2.5 cursor-pointer"
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
            className="h-10 w-10 text-slate-500 hover:text-slate-800 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button variant="secondary" size="sm" className="h-10 rounded-xl" onClick={saveFilters}>
          <Save className="h-4 w-4 mr-2" /> Salvar
        </Button>
        <Button variant="outline" size="sm" className="h-10 rounded-xl" onClick={loadFilters}>
          <Download className="h-4 w-4 mr-2" /> Carregar
        </Button>
      </div>
    </div>
  )
}
