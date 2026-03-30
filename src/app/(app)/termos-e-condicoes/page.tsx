import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const metadata: Metadata = {
  title: "Hub LN - Termos & Condições",
  description:
    "Página de Termos e Condições - Leia atentamente os termos e condições de uso da plataforma Hub LN.",
};

const TERMS_SECTIONS = [
  {
    id: "01",
    title: "1. Aceitação dos Termos",
    content:
      "Ao acessar e utilizar esta plataforma, você concorda em cumprir e ficar vinculado aos seguintes Termos e Condições de Uso. Se você não concordar com qualquer parte destes termos, você não deve utilizar nossos serviços. Estes termos aplicam-se a todos os visitantes, usuários e outras pessoas que acessam ou usam o serviço.",
  },
  {
    id: "02",
    title: "2. Uso do Serviço",
    content: (
      <div className="space-y-4">
        <p>
          Você concorda em usar o serviço apenas para fins legais e de acordo
          com estes Termos. Você é responsável por garantir que o uso do serviço
          não viole nenhuma lei, regulamento ou direito de terceiros.
        </p>
        <div>
          <span className="font-semibold block mb-2">
            É estritamente proibido:
          </span>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Utilizar o serviço para qualquer finalidade fraudulenta ou ilegal.</li>
            <li>Interferir ou interromper a integridade ou o desempenho do serviço.</li>
            <li>Tentar obter acesso não autorizado a qualquer parte do serviço ou seus sistemas relacionados.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "03",
    title: "3. Cadastro e Segurança da Conta",
    content:
      "Para acessar determinados recursos do serviço, você pode ser obrigado a criar uma conta. Você concorda em fornecer informações precisas, completas e atualizadas durante o processo de registro. Você é o único responsável por manter a confidencialidade de sua senha e conta, e por todas as atividades que ocorram sob sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.",
  },
  {
    id: "04",
    title: "4. Propriedade Intelectual",
    content:
      "O serviço e seu conteúdo original (excluindo conteúdo fornecido pelos usuários), recursos e funcionalidades são e permanecerão de propriedade exclusiva da plataforma e de seus licenciadores. O serviço é protegido por direitos autorais, marcas registradas e outras leis de propriedade intelectual.",
  },
  {
    id: "05",
    title: "5. Privacidade",
    content:
      "Sua privacidade é importante para nós. Nossa Política de Privacidade explica como coletamos, usamos e divulgamos informações sobre você. Ao usar o serviço, você concorda que podemos usar suas informações de acordo com nossa Política de Privacidade.",
  },
  {
    id: "06",
    title: "6. Limitação de Responsabilidade",
    content:
      "Em nenhuma circunstância a plataforma, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes do seu acesso ou uso ou incapacidade de acessar ou usar o serviço.",
  },
  {
    id: "07",
    title: "7. Alterações nos Termos",
    content:
      "Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor. O que constitui uma alteração material será determinado a nosso exclusivo critério.",
  },
  {
    id: "08",
    title: "8. Contato",
    content:
      "Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através dos canais de suporte disponíveis na plataforma.",
  },
  {
    id: "09",
    title: "9. Sistema de Indicações e Comissões",
    content: (
      <div className="space-y-6">
        <p>
          Para participar do programa de indicações e receber comissões, o usuário deverá cumprir os seguintes requisitos:
        </p>

        <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/50">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            9.1 Requisitos para Indicações
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Para participar do programa de indicações e começar a receber comissões, o usuário deverá efetivar o pagamento da primeira mensalidade. Após isso, o usuário já estará habilitado a compartilhar seu link de indicação.</li>
            <li>O usuário que permanecer inativo por <strong>2 (dois) meses consecutivos</strong> (sem realizar o pagamento das mensalidades) perderá automaticamente o direito de indicar novos usuários e de receber comissões.</li>
            <li>A regularização da conta (mediante o pagamento das mensalidades em atraso) restaurará o acesso ao programa de indicações e aos benefícios relacionados.</li>
          </ul>
        </div>

        <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/50">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            9.2 Configuração de Preços de Revenda
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Para que o sistema de comissões funcione corretamente, o usuário indicador deverá configurar o preço de revenda dos serviços destinados aos seus indicados. Este preço determinará o valor da comissão a ser recebida a cada novo parceiro cadastrado através do link de indicação.</li>
          </ul>
        </div>

        <div className="space-y-3 bg-red-500/5 p-4 rounded-lg border border-red-500/10">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            9.3 Inatividade Prolongada e Penalidades
          </h3>
          <p className="text-sm text-muted-foreground/90">
            Caso o usuário permaneça inativo por <strong>3 (três) meses consecutivos</strong> (sem realizar o pagamento da mensalidade), as seguintes medidas serão automaticamente aplicadas:
          </p>
          <ul className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li><strong>Perda dos Indicados:</strong> Todos os usuários indicados por meio do link de indicação do usuário inativo serão realocados como parceiros diretos da plataforma, perdendo qualquer vínculo com o indicador original.</li>
            <li><strong>Perda de Comissões:</strong> O usuário inativo perderá o direito a qualquer comissão pendente ou futura relacionada aos usuários indicados.</li>
            <li><strong>Remoção da Conta:</strong> A conta do usuário inativo será removida da plataforma, sendo necessário realizar um novo cadastro caso deseje utilizar os serviços novamente.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "10",
    title: "10. Garantias de Serviços",
    content: (
      <div className="space-y-4">
        <p>
          A plataforma oferece garantias exclusivas sobre os serviços prestados, desde que os seguintes critérios de qualificação sejam rigorosamente cumpridos pelo usuário:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Perfil Ativo:</strong> O usuário deve manter o status de sua conta como ativo, respeitando os pagamentos de mensalidade e outras obrigações financeiras.</li>
          <li><strong>Recorrência de Solicitações:</strong> É necessário realizar <strong>no mínimo 1 (uma) solicitação de serviço por semana</strong> pela plataforma. Contas que não atenderem a este volume não estarão cobertas pelas garantias oferecidas.</li>
        </ul>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8 flex justify-center selection:bg-primary/20">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full shadow-sm hover:scale-105 transition-transform"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Termos e Condições
              </h1>
              <p className="text-sm text-muted-foreground">
                Última atualização: 30 de Março de 2026
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center sm:text-left mb-6">
            <p className="text-muted-foreground text-sm sm:text-base">
              Bem-vindo à HUB-LN. Ao utilizar nossa plataforma, você concorda com
              as condições descritas abaixo. Por favor, leia-as atentamente.
            </p>
          </div>

          <div className="grid gap-6">
            {TERMS_SECTIONS.map((section) => (
              <Card
                key={section.id}
                className="border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative"
              >
                {/* Decorative side border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                
                <CardHeader className="pb-3 px-6 sm:px-8 pt-6">
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold shadow-inner">
                      {section.id}
                    </span>
                    {section.title.replace(/^\d+\.\s*/, "")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 sm:px-8 pb-6 mt-1 text-base sm:leading-relaxed text-muted-foreground">
                  {typeof section.content === "string" ? (
                    <p className="text-justify sm:text-left">
                      {section.content}
                    </p>
                  ) : (
                    section.content
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
