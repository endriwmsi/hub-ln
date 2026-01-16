"use server";

import transporter from "@/lib/mailer";

const passwordResetEmailTemplate = {
  wrapper: `
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    margin: 0;
    padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
    line-height: 1.6;
  `,

  container: `
    max-width: 560px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08);
  `,

  header: `
    background: #ffffff;
    padding: 0;
    border-top: 3px solid #dc2626;
    position: relative;
  `,

  logoSection: `
    padding: 48px 48px 24px 48px;
    text-align: center;
    border-bottom: 1px solid #f5f5f5;
  `,

  brand: `
    font-size: 24px;
    font-weight: 300;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  `,

  tagline: `
    font-size: 12px;
    color: #8a8a8a;
    margin: 8px 0 0 0;
    font-weight: 400;
    letter-spacing: 1px;
    text-transform: uppercase;
  `,

  content: `
    padding: 48px 48px 40px 48px;
    background: #ffffff;
  `,

  title: `
    font-size: 28px;
    color: #1a1a1a;
    margin: 0 0 32px 0;
    font-weight: 300;
    line-height: 1.3;
    text-align: center;
    letter-spacing: -0.5px;
  `,

  description: `
    font-size: 16px;
    color: #4a4a4a;
    line-height: 1.7;
    margin: 0 0 40px 0;
    text-align: center;
    font-weight: 400;
  `,

  buttonWrapper: `
    text-align: center;
    margin: 40px 0;
  `,

  button: `
    display: inline-block;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 16px 40px;
    border-radius: 1px;
    font-weight: 500;
    font-size: 14px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    border: none;
  `,

  divider: `
    width: 60px;
    height: 1px;
    background: #dc2626;
    margin: 40px auto;
    border: none;
  `,

  warningBox: `
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 24px;
    margin: 32px 0;
    border-radius: 1px;
    border-left: 2px solid #dc2626;
  `,

  warningTitle: `
    margin: 0 0 8px 0;
    color: #991b1b;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,

  warningText: `
    margin: 0;
    color: #7f1d1d;
    font-size: 14px;
    line-height: 1.6;
    font-weight: 400;
  `,

  infoBox: `
    background: #fafafa;
    border: 1px solid #f0f0f0;
    padding: 24px;
    margin: 32px 0;
    border-radius: 1px;
    border-left: 2px solid #6b7280;
  `,

  infoText: `
    margin: 0;
    color: #6a6a6a;
    font-size: 14px;
    line-height: 1.6;
    font-weight: 400;
  `,

  footer: `
    background: #f8f8f8;
    padding: 32px 48px;
    text-align: center;
    border-top: 1px solid #f0f0f0;
  `,

  footerBrand: `
    font-size: 16px;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    font-weight: 300;
    letter-spacing: 1px;
  `,

  footerDesc: `
    font-size: 13px;
    color: #8a8a8a;
    margin: 0 0 24px 0;
    font-weight: 400;
    line-height: 1.5;
  `,

  copyright: `
    font-size: 11px;
    color: #b0b0b0;
    margin: 0;
    font-weight: 400;
    letter-spacing: 0.5px;
  `,

  accentLine: `
    width: 40px;
    height: 1px;
    background: #dc2626;
    margin: 16px auto 24px auto;
    border: none;
  `,
};

/**
 * Serviço manual de envio de email de recuperação de senha.
 * Este serviço é destinado para uso exclusivo do administrador.
 *
 * @param to - Email do destinatário
 * @param resetLink - Link de redefinição de senha gerado pelo Better Auth
 * @param userName - Nome do usuário (opcional)
 */
export async function sendPasswordResetEmailAction({
  to,
  resetLink,
  userName,
}: {
  to: string;
  resetLink: string;
  userName?: string;
}) {
  const currentYear = new Date().getFullYear();
  const greeting = userName ? `Olá, ${userName}` : "Olá";

  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to,
    subject: "HUB-LN • Redefinição de Senha",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="${passwordResetEmailTemplate.wrapper}">
        
        <!-- Email Container -->
        <div style="${passwordResetEmailTemplate.container}">
          
          <!-- Header with Red Accent -->
          <div style="${passwordResetEmailTemplate.header}">
            <div style="${passwordResetEmailTemplate.logoSection}">
              <h1 style="${passwordResetEmailTemplate.brand}">HUB-LN</h1>
              <p style="${passwordResetEmailTemplate.tagline}">Excellence in Development</p>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="${passwordResetEmailTemplate.content}">
            <h2 style="${passwordResetEmailTemplate.title}">Redefinição de Senha</h2>
            
            <hr style="${passwordResetEmailTemplate.divider}">
            
            <p style="${passwordResetEmailTemplate.description}">
              ${greeting},<br><br>
              Recebemos uma solicitação para redefinir a senha da sua conta. 
              Clique no botão abaixo para criar uma nova senha.
            </p>
            
            <!-- Call to Action -->
            <div style="${passwordResetEmailTemplate.buttonWrapper}">
              <a href="${resetLink}" style="${passwordResetEmailTemplate.button}">
                Redefinir Senha
              </a>
            </div>
            
            <hr style="${passwordResetEmailTemplate.divider}">
            
            <!-- Warning Box -->
            <div style="${passwordResetEmailTemplate.warningBox}">
              <p style="${passwordResetEmailTemplate.warningTitle}">⚠️ Atenção</p>
              <p style="${passwordResetEmailTemplate.warningText}">
                Este link de redefinição expira em 1 hora por motivos de segurança. 
                Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.
              </p>
            </div>
            
            <!-- Info Box -->
            <div style="${passwordResetEmailTemplate.infoBox}">
              <p style="${passwordResetEmailTemplate.infoText}">
                <strong>Precisa de ajuda?</strong> Se você não solicitou esta redefinição ou tem dúvidas sobre a segurança da sua conta, entre em contato com nosso suporte imediatamente.
              </p>
            </div>
          </div>
          
          <!-- Elegant Footer -->
          <div style="${passwordResetEmailTemplate.footer}">
            <h3 style="${passwordResetEmailTemplate.footerBrand}">Hub LN</h3>
            <hr style="${passwordResetEmailTemplate.accentLine}">
            <p style="${passwordResetEmailTemplate.footerDesc}">
              Transformando ideias em soluções digitais excepcionais.<br>
              Tecnologia de ponta com design sofisticado.
            </p>
            <p style="${passwordResetEmailTemplate.copyright}">
              © ${currentYear} Hub LN. Todos os direitos reservados.
            </p>
          </div>
          
        </div>
        
        <!-- Responsive Styles -->
        <style>
          @media only screen and (max-width: 600px) {
            .email-container {
              margin: 20px 10px !important;
            }
            .content-mobile {
              padding: 32px 24px !important;
            }
            .logo-mobile {
              padding: 32px 24px 16px 24px !important;
            }
            .footer-mobile {
              padding: 24px !important;
            }
            .title-mobile {
              font-size: 22px !important;
              line-height: 1.4 !important;
            }
            .description-mobile {
              font-size: 15px !important;
            }
            .button-mobile {
              padding: 14px 32px !important;
              font-size: 13px !important;
            }
            .brand-mobile {
              font-size: 20px !important;
            }
          }
          
          /* Button hover effect */
          .cta-button:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4) !important;
          }
          
          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .accent-red {
              background: #7f1d1d !important;
            }
          }
        </style>
        
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Email de redefinição de senha enviado com sucesso!",
    };
  } catch (error) {
    console.error("sendPasswordResetEmailAction error", error);
    return {
      success: false,
      message:
        "Erro ao enviar email de redefinição de senha. Tente novamente mais tarde.",
    };
  }
}
