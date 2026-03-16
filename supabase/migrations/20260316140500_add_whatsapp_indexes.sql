-- Adiciona índices para otimizar as consultas de mensagens do WhatsApp
CREATE INDEX IF NOT EXISTS idx_messages_phone ON public.messages (phone);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages ("timestamp");
