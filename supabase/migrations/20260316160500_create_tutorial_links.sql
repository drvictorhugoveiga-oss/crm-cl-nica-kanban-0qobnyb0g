CREATE TABLE public.tutorial_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tutorial_links ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Enable read access for all authenticated users" 
    ON public.tutorial_links FOR SELECT TO authenticated 
    USING (true);

-- Insert Seed Data
INSERT INTO public.tutorial_links (title, description, video_url, category) VALUES
('Como criar um novo Lead', 'Aprenda o passo a passo para adicionar um paciente na sua etapa de prospecção e mantê-lo organizado no funil Kanban.', 'https://www.youtube.com/embed/jNQXAC9IVRw', 'tutorial'),
('Conectando e usando o WhatsApp', 'Sincronize o seu WhatsApp para gerenciar os bate-papos e interações diretas na mesma plataforma de forma ágil e centralizada.', 'https://www.youtube.com/embed/tgbNymZ7vqY', 'tutorial'),
('Análise de Origem e Relatórios', 'Entenda de onde vêm seus melhores pacientes e como rastrear o retorno sobre o investimento (ROI) com nossos dashboards.', 'https://www.youtube.com/embed/3JZ_D3ELwOQ', 'tutorial'),
('Como alterar a etapa de um paciente?', 'Basta clicar, segurar e arrastar o card do paciente para a coluna desejada na tela de Leads (Kanban). Ele será atualizado automaticamente.', '', 'faq'),
('É possível exportar meus leads?', 'Sim! Na tela principal (Leads Kanban), clique no botão "Exportar Dados" no canto superior direito da tela para gerar um arquivo com as informações.', '', 'faq'),
('Como funciona a criptografia (LGPD)?', 'Todos os dados sensíveis como E-mail e Telefone são criptografados através de nossas Edge Functions de ponta a ponta. Você não precisa configurar nada, a segurança é totalmente automática.', '', 'faq');
