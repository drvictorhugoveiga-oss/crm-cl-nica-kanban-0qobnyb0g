export default function PrivacyPolicy() {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="p-8 max-w-4xl mx-auto prose prose-slate animate-fade-in bg-card shadow-sm border border-border rounded-2xl my-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8 pb-4 border-b border-border/50">
          Última atualização: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Introdução</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          O ClinicFlow valoriza a privacidade de seus usuários e dos pacientes de nossas clínicas
          parceiras. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e
          protegemos os seus dados pessoais, em estrita conformidade com a Lei Geral de Proteção de
          Dados Pessoais (LGPD - Lei nº 13.709/2018).
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Coleta de Dados</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Coletamos os dados necessários para o pleno funcionamento do CRM, incluindo informações de
          contato (e-mail, telefone) e histórico de interações. Dados sensíveis dos pacientes são
          processados de forma segura e ética mediante consentimento explícito.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">3. Uso dos Dados</h2>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Os dados coletados são utilizados exclusivamente para:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1 ml-4">
          <li>Fornecer os serviços de gestão de relacionamento com o paciente (CRM).</li>
          <li>Aprimorar a experiência do usuário em nossa plataforma.</li>
          <li>Cumprir obrigações legais e regulatórias vigentes.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
          4. Segurança e Criptografia
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Implementamos rigorosas medidas de segurança técnicas e administrativas para proteger os
          dados. Isso inclui o uso de Edge Functions dedicadas para criptografia (AES-GCM) de campos
          sensíveis como E-mail e Telefone, bem como um sistema de Auditoria (Audit Logs) para
          rastrear de maneira segura todos os acessos e modificações.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
          5. Direitos do Titular (LGPD)
        </h2>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Conforme a legislação aplicável, você possui os seguintes direitos em relação aos seus
          dados:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1 ml-4">
          <li>Direito de acessar seus dados a qualquer momento.</li>
          <li>Solicitar a correção de dados incompletos ou inexatos.</li>
          <li>Solicitar a exclusão definitiva dos seus dados ("Direito ao Esquecimento").</li>
          <li>Revogar o seu consentimento prévio para tratamento de dados.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">
          6. Contato e Solicitações
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Para exercer seus direitos ou caso tenha dúvidas sobre esta política, pedimos que acesse a
          aba de{' '}
          <a href="/configuracoes-privacidade" className="text-primary hover:underline font-medium">
            Configurações de Privacidade
          </a>{' '}
          da sua conta ou entre em contato com nosso Encarregado pelo Tratamento de Dados Pessoais
          (DPO).
        </p>
      </div>
    </div>
  )
}
