# 🔐 Sistema de Autenticação Hub LN

Este documento explica como funciona o sistema de autenticação com separação de responsabilidades entre confirmação de conta e recuperação de senha.

## 📋 Visão Geral

### Separação de Serviços

O sistema mantém **dois serviços de email separados**:

1. **Confirmação de Conta** (Manual pelo Admin)

   - Usado para verificação de email de novas contas
   - Admin aprova cadastros manualmente
   - Design com acento dourado

2. **Recuperação de Senha** (Automático)
   - Enviado automaticamente quando usuário esquece senha
   - Sem necessidade de intervenção manual
   - Design com acento vermelho

## 🔄 Fluxos de Autenticação

### Cadastro de Nova Conta (Manual)

```
Usuário → Preenche formulário → Conta criada
                              → Email de confirmação NÃO enviado
                              → Admin aprova manualmente
                              → Email de confirmação enviado
```

### Recuperação de Senha (Automático)

```
Usuário → Esqueci minha senha → Insere email
                              → Email enviado AUTOMATICAMENTE
                              → Usuário recebe link
                              → Redefine senha
```

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── auth.ts                              # Configuração Better Auth
│   └── mailer.ts                            # Configuração Nodemailer
│
├── features/auth/actions/
│   ├── send-email.ts                        # ✉️ Confirmação de conta (manual)
│   ├── send-password-reset-email.ts         # 🔒 Recuperação de senha (automático)
│   └── admin-password-reset.ts              # 👤 Ações admin (opcional)
│
└── features/auth/components/
    ├── forgot-passoword-form.tsx            # Formulário de recuperação
    └── admin-password-reset-example.tsx     # Interface admin (opcional)
```

## 🎨 Design dos Emails

### Email de Confirmação de Conta

- **Cor**: Acento dourado (`#d4af37`)
- **Tom**: Profissional e elegante
- **Uso**: Verificação de conta (manual pelo admin)
- **Serviço**: `send-email.ts` → `sendEmailAction()`

### Email de Recuperação de Senha

- **Cor**: Acento vermelho (`#dc2626`)
- **Tom**: Alerta e urgência
- **Uso**: Redefinição de senha (automático)
- **Serviço**: `send-password-reset-email.ts` → `sendPasswordResetEmailAction()`

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Nodemailer
NODEMAILER_USER=seu-email@gmail.com
NODEMAILER_PASS=sua-senha-de-app-gmail

# Better Auth
BETTER_AUTH_SECRET=seu-secret-unico
BETTER_AUTH_URL=http://localhost:3000
```

### Instalação de Dependências

```bash
pnpm add nodemailer @types/nodemailer
```

### Como Obter Senha de App do Gmail

1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative **Verificação em duas etapas**
3. Vá em **Senhas de app**
4. Selecione "Outro" e nomeie como "Hub LN Mailer"
5. Copie a senha gerada
6. Cole em `NODEMAILER_PASS` no `.env`

## 🔧 Configuração do Better Auth

### Recuperação de Senha (Automático)

```typescript
// src/lib/auth.ts
emailAndPassword: {
  enabled: true,
  autoSignIn: false,
  requireEmailVerification: true,

  sendResetPassword: async ({ user, url }) => {
    const { sendPasswordResetEmailAction } = await import(
      "@/features/auth/actions/send-password-reset-email"
    );
    await sendPasswordResetEmailAction({
      to: user.email,
      resetLink: url,
      userName: user.name,
    });
  },
}
```

### Confirmação de Conta (Manual)

A confirmação de conta é gerenciada manualmente pelo admin através de um painel administrativo separado.

## 📝 Uso

### Recuperação de Senha (Para Usuários)

1. Usuário acessa `/forgot-password`
2. Insere email cadastrado
3. Sistema envia email automaticamente
4. Usuário recebe email com link válido por 1 hora
5. Usuário clica no link e define nova senha

### Confirmação de Conta (Para Admins)

1. Novo usuário se cadastra
2. Admin recebe notificação
3. Admin aprova cadastro no painel
4. Sistema envia email de confirmação
5. Usuário confirma email e pode fazer login

## 🚀 Arquivos Importantes

### Para Recuperação de Senha

- `send-password-reset-email.ts` - Serviço de envio de email
- `forgot-passoword-form.tsx` - Formulário frontend
- `lib/auth.ts` - Configuração Better Auth

### Para Confirmação de Conta (Admin)

- `send-email.ts` - Serviço de envio de email
- `admin-password-reset.ts` - Ações administrativas
- `admin-password-reset-example.tsx` - Interface exemplo

## 🔐 Segurança

### Token de Recuperação

- Gerado automaticamente pelo Better Auth
- Expira em 1 hora
- Único por solicitação
- Armazenado na tabela `verification`

### Validações

- Email deve existir no sistema
- Token deve ser válido e não expirado
- Uma tentativa por vez por usuário

## 💡 Diferenças Importantes

| Aspecto  | Confirmação de Conta | Recuperação de Senha             |
| -------- | -------------------- | -------------------------------- |
| Envio    | Manual pelo Admin    | Automático                       |
| Design   | Acento Dourado       | Acento Vermelho                  |
| Urgência | Boas-vindas          | Alerta de Segurança              |
| Expira   | Não                  | 1 hora                           |
| Serviço  | `sendEmailAction()`  | `sendPasswordResetEmailAction()` |

## 🐛 Troubleshooting

### Email não enviado

- Verifique variáveis de ambiente
- Confirme senha de app do Gmail
- Veja logs no console do servidor

### Token expirado

- Token expira em 1 hora
- Usuário deve solicitar novo link

### Email vai para spam

- Configure SPF/DKIM no Gmail
- Peça ao usuário verificar pasta de spam

## 📚 Referências

- [Better Auth Documentation](https://better-auth.com)
- [Nodemailer Documentation](https://nodemailer.com)

---

**Hub LN** | Sistema de autenticação seguro e profissional
