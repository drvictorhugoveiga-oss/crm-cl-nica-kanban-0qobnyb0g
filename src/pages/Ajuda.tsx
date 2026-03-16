import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PlayCircle, HelpCircle, BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface TutorialLink {
  id: string
  title: string
  description?: string
  video_url?: string
  category: string
}

export default function Ajuda() {
  const [items, setItems] = useState<TutorialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHelpContent = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tutorial_links')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setItems(data)
      }
      setIsLoading(false)
    }

    fetchHelpContent()
  }, [])

  const tutorials = items.filter((item) => item.category === 'tutorial')
  const faqs = items.filter((item) => item.category === 'faq')

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl shrink-0">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            Central de Ajuda
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Aprenda a utilizar o ClinicFlow e tire suas principais dúvidas.
          </p>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <PlayCircle className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-xl font-semibold text-foreground">Tutoriais em Vídeo</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-border/50">
                  <Skeleton className="w-full aspect-video rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : tutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <Card
                  key={tutorial.id}
                  className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-border/50 flex flex-col"
                >
                  {tutorial.video_url && (
                    <div className="w-full aspect-video bg-muted relative">
                      <iframe
                        src={tutorial.video_url}
                        title={tutorial.title}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <CardHeader className="flex-1">
                    <CardTitle className="text-base sm:text-lg leading-tight">
                      {tutorial.title}
                    </CardTitle>
                    {tutorial.description && (
                      <CardDescription className="mt-2 line-clamp-3">
                        {tutorial.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border shadow-sm">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">
                Nenhum tutorial disponível no momento.
              </p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-xl font-semibold text-foreground">Perguntas Frequentes (FAQ)</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : faqs.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="px-6 border-b border-border/50 last:border-0"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 group">
                      <span className="group-hover:text-primary transition-colors">
                        {faq.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-[15px]">
                      {faq.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border shadow-sm">
              <p className="text-muted-foreground font-medium">
                Nenhuma pergunta frequente cadastrada.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
