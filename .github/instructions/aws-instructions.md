# Configuração AWS S3 para Upload de Imagens

Este projeto utiliza AWS S3 para armazenamento de imagens (avatars de usuários e outros uploads futuros).

## Pré-requisitos

1. Conta AWS ativa
2. Bucket S3 criado
3. Credenciais de acesso (Access Key ID e Secret Access Key)

## Instalação

Instale o pacote AWS SDK:

```bash
pnpm add @aws-sdk/client-s3
```

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_S3_BUCKET_NAME=nome-do-seu-bucket
```

### 2. Configurar Bucket S3

No console da AWS:

1. Acesse **S3** → **Buckets** → Selecione seu bucket
2. Vá em **Permissions** → **Block public access**
3. Desmarque "Block all public access" (apenas se quiser URLs públicas)
4. Configure **Bucket Policy** para permitir leitura pública:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nome-do-seu-bucket/*"
    }
  ]
}
```

5. Em **CORS configuration**, adicione:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 3. Criar IAM User com Permissões

1. Acesse **IAM** → **Users** → **Create user**
2. Anexe a política **AmazonS3FullAccess** ou crie uma customizada:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::nome-do-seu-bucket/*"
    }
  ]
}
```

3. Gere as credenciais (Access Key) e adicione ao `.env`

## Funcionalidades Implementadas

### Upload de Avatar

- Localização: `/configuracoes/perfil`
- Formatos aceitos: JPEG, PNG, WebP
- Tamanho máximo: 5MB
- Preview em tempo real
- Substitui automaticamente avatar anterior

### Arquivos Criados

1. **`src/lib/s3.ts`**: Serviço de integração com S3
   - `uploadToS3()`: Upload de arquivos
   - `deleteFromS3()`: Exclusão de arquivos
   - `validateImageFile()`: Validação de imagens

2. **`src/features/settings/actions/upload-avatar.ts`**: Server Actions
   - `uploadAvatar()`: Upload e atualização no banco
   - `deleteAvatar()`: Remoção de avatar

3. **`src/features/settings/components/avatar-upload.tsx`**: Componente UI
   - Preview de imagem
   - Validação client-side
   - Feedback visual de upload

## Uso em Outras Features

Para usar o serviço S3 em outras partes do projeto:

```typescript
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

// Upload
const imageUrl = await uploadToS3({
  file: buffer,
  fileName: "exemplo.jpg",
  contentType: "image/jpeg",
  folder: "minha-pasta", // opcional, padrão: "uploads"
});

// Delete
await deleteFromS3(imageUrl);
```

## Segurança

- ✅ Validação de tipo de arquivo (client e server)
- ✅ Validação de tamanho (5MB máximo)
- ✅ Nomes de arquivo únicos (timestamp + random string)
- ✅ Organização em pastas (avatars, uploads, etc.)
- ✅ Exclusão automática de arquivos antigos
- ✅ Autenticação obrigatória para uploads

## Custos AWS

O S3 cobra por:

- Armazenamento (GB/mês)
- Requisições (PUT, GET, DELETE)
- Transferência de dados

Para uso pessoal/pequeno, os custos são mínimos (centavos por mês).

## Troubleshooting

### Erro: "AWS S3 environment variables are not configured"

- Verifique se todas as variáveis estão no `.env`
- Reinicie o servidor de desenvolvimento

### Erro de permissão ao fazer upload

- Verifique as permissões do IAM user
- Confirme que o bucket policy permite PutObject

### Imagens não carregam

- Verifique se o bucket está configurado para acesso público
- Confirme a CORS configuration
- Verifique se a região está correta no `.env`
