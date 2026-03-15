import { KanbanBoard } from '@/components/KanbanBoard'

const Index = () => {
  return (
    <div className="h-full w-full flex flex-col animate-fade-in bg-[#F8FAFC]">
      <div className="px-6 py-5 hidden sm:block shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Funil de Atendimento</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie a jornada dos seus pacientes arrastando os cards.
        </p>
      </div>
      <KanbanBoard />
    </div>
  )
}

export default Index
