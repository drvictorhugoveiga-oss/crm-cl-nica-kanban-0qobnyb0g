import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/ProfileSettings'
import { KanbanSettings } from '@/components/KanbanSettings'

export default function Settings() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#F8FAFC] p-4 sm:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-500 mt-1">Gerencie seu perfil e personalize o Kanban.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-slate-200/50 mb-4 h-12 w-full sm:w-auto overflow-x-auto justify-start p-1 flex-nowrap">
            <TabsTrigger value="profile" className="rounded-md">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-md">
              Configurações do Kanban
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 outline-none">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 outline-none">
            <KanbanSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
