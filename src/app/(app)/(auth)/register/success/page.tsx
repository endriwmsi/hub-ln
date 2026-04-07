// import { Icons } from "@/components/icons";

import type { Metadata } from "next";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "Sucesso!",
  description: "Página de sucesso de cadastro.",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SuccessPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const emailParam = params.email;
  const email = typeof emailParam === "string" ? emailParam : "";

  // Adicione o número de WhatsApp desejado aqui (com DDI e DDD sem formatação)
  // Exemplo: 5511999999999
  const whatsappNumber = "5511915486991";
  const message = `Acabei de concluir meu cadastro na Plataforma HUB - LN, segue meu email para aprovação do cadastro: ${email}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
      <div className="flex flex-col items-center space-y-2 text-center">
        {/* <Icons.logo className="h-10 w-10" /> */}
        <p className="text-muted-foreground text-sm">
          Tudo pronto! Você registrou-se com sucesso. Por favor, aguarde a
          aprovação da sua conta por um administrador.
        </p>

        <p className="pt-4 text-sm font-medium">
          Clique no botão abaixo para nos avisar no WhatsApp e prosseguir com a
          aprovação.
        </p>

        <a
          className="mt-4 mb-10 w-full"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="secondary"
            className="w-full text-base font-semibold py-6"
          >
            Chamar no WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
};

export default SuccessPage;
