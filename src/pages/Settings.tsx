import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/ProfileSettings'
import { KanbanSettings } from '@/components/KanbanSettings'
import { AutomationSettings } from '@/components/AutomationSettings'

export default function Settings() {
  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu perfil, pipeline e automações.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-muted/50 mb-4 h-12 w-full sm:w-auto overflow-x-auto justify-start p-1 flex-nowrap">
            <TabsTrigger value="profile" className="rounded-md shrink-0">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-md shrink-0">
              Configurações do Kanban
            </TabsTrigger>
            <TabsTrigger value="automations" className="rounded-md shrink-0">
              Automações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 outline-none">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 outline-none">
            <KanbanSettings />
          </TabsContent>

          <TabsContent value="automations" className="mt-0 outline-none">
            <AutomationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
