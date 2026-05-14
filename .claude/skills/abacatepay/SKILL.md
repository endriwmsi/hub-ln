---
name: abacatepay
description: Integrate or modify AbacatePay code in the HUB LN project. Covers two flows only — Checkout Transparente (PIX QR Code rendered in-app via base64) and Assinaturas recorrentes (mensal, semestral, anual). Use when working with payment code that mentions AbacatePay, PIX QR/brCode/base64, or recurring subscriptions tied to this provider.
---

# AbacatePay (HUB LN)

Escopo desta skill: apenas o que o HUB LN usa hoje.

- **Checkout Transparente** — PIX gerado direto na API, renderizado em-app via base64. Sem página hospedada.
- **Assinaturas recorrentes** — ciclos `MONTHLY`, `SEMIANNUALLY`, `ANNUALLY`.

Tudo o que está fora disso (checkout hospedado, links de pagamento, payouts, transferências PIX, cupons, trustMRR) foi deliberadamente omitido. Se precisar, consulte a doc oficial em `https://docs.abacatepay.com/pages/...`.

## Convenções globais

- **Base URL:** `https://api.abacatepay.com/v2`
- **Auth:** `Authorization: Bearer <ABACATEPAY_API_KEY>` em toda requisição.
- **Valores:** sempre em **centavos** (inteiro). `R$ 100,00` → `10000`. Nunca envie float.
- **Moeda:** sempre `"BRL"`.
- **Envelope de resposta:** `{ "data": ..., "success": boolean, "error": string | null }`. Trate `success === false` ou `error !== null` como falha mesmo com HTTP 200.
- **API key é server-side.** O browser só deve receber `brCodeBase64`, `brCode` ou `url` — nunca o bearer token.

---

## Checkout Transparente (PIX em-app)

Usado quando o usuário paga sem sair do app. Retorna `brCode` (copia-e-cola) e `brCodeBase64` (PNG em base64).

### Criar PIX

```jsonc
POST /transparents/create
{
  "data": {
    "amount": 10000,                                     // obrigatório, centavos
    "description": "...",                                // opcional
    "expiresIn": 3600,                                   // opcional, segundos
    "customer": {                                        // opcional
      "name": "Fulano",
      "email": "fulano@example.com",
      "taxId": "12345678900",
      "cellphone": "+5511999999999"
    },
    "metadata": { "orderId": "..." }                     // opcional
  }
}
```

Resposta entrega `id`, `brCode`, `brCodeBase64`, `expiresAt`. Renderize com:

```tsx
<img src={`data:image/png;base64,${brCodeBase64}`} alt="PIX QR Code" />
```

Persista o `id` para correlacionar com webhook ou polling.

### Confirmar pagamento

- **Webhook (preferido):** evento `transparent.completed`.
- **Polling (fallback enquanto o usuário olha o QR):** `GET /transparents/check?id=<id>`.

### Sandbox

`POST /transparents/simulate-payment` simula pagamento — só funciona com API key de teste. Proteja a chamada com checagem de env.

---

## Assinaturas recorrentes

Fluxo:

1. **Criar um produto com `cycle`** — um produto por plano × ciclo.
2. **Criar o checkout de assinatura** apontando para o produto.
3. **Receber eventos via webhook** para tracking de status.

### 1. Criar produto de assinatura

```jsonc
POST /products/create
{
  "externalId": "plan-pro-monthly",     // sua referência interna
  "name": "Plano Pro - Mensal",
  "price": 4990,                         // centavos
  "currency": "BRL",
  "cycle": "MONTHLY",                    // MONTHLY | SEMIANNUALLY | ANNUALLY
  "description": "...",                  // opcional
  "imageUrl": "https://..."              // opcional
}
```

No HUB LN cria-se um produto por combinação plano × ciclo (ex.: `plan-pro-monthly`, `plan-pro-semiannual`, `plan-pro-annual`).

### 2. Criar checkout de assinatura

```jsonc
POST /subscriptions/create
{
  "items": [{ "id": "<product_id>", "quantity": 1 }],   // EXATAMENTE 1 item
  "methods": ["CARD"],                                   // default já é CARD
  "customerId": "<customer_id>",                         // opcional, pré-preenche
  "returnUrl": "https://app.hubln.com/billing",
  "completionUrl": "https://app.hubln.com/billing/success",
  "externalId": "<seu-id-de-assinatura>",
  "metadata": { "userId": "...", "planId": "..." }
}
```

Retorna `url` para redirecionar o cliente ao fluxo de cadastro do cartão. Após confirmação, a renovação é automática conforme o `cycle` do produto.

### Status possíveis

`PENDING | EXPIRED | CANCELLED | PAID | REFUNDED`.

### Cancelar assinatura

```jsonc
POST /subscriptions/cancel
{ "id": "<subscription_id>" }
```

---

## Clientes (opcional, mas útil)

Único por `taxId` (CPF/CNPJ). Criar com `taxId` existente **retorna o cliente existente** — não erra. Use isso em vez de implementar find-or-create no app.

```jsonc
POST /customers/create
{
  "email": "fulano@example.com",         // obrigatório
  "taxId": "12345678900",
  "name": "Fulano",
  "cellphone": "+5511999999999",
  "metadata": { "userId": "..." }
}
```

Armazene o `id` retornado e reutilize via `customerId` em PIX e assinaturas.

---

## Webhooks

Endpoint HTTPS público obrigatório. Payload assinado via HMAC com o `secret` informado na criação — **sempre verifique a assinatura** antes de confiar no payload.

```jsonc
POST /webhooks/create
{
  "name": "hub-ln-main",
  "endpoint": "https://api.hubln.com/webhooks/abacatepay",
  "secret": "<segredo-forte>",
  "events": [
    "transparent.completed",
    "transparent.refunded",
    "subscription.completed",
    "subscription.renewed",
    "subscription.cancelled"
  ]
}
```

Eventos relevantes para esta skill:

- **PIX (transparente):** `transparent.completed`, `transparent.refunded`
- **Assinaturas:** `subscription.completed`, `subscription.renewed`, `subscription.cancelled`, `subscription.trial_started`

Em dev, exponha o endpoint via tunnel HTTPS (ngrok/cloudflared) — URL não-HTTPS é rejeitada.

---

## Pitfalls

- **Float em dinheiro.** `price: 49.90` é bug. Mantenha centavos como inteiro desde o início.
- **Assinatura sem `cycle`.** Se o produto não tem `cycle`, `subscriptions/create` não vai funcionar como assinatura. Sempre confirme o produto antes.
- **Mais de 1 item em assinatura.** Checkout de assinatura aceita exatamente 1 item. Para combos, crie um produto "combo" único.
- **Polling em vez de webhook.** Polling em `GET /transparents/check` é ok enquanto o usuário olha o QR. Para confirmação no servidor, use webhook.
- **API key no client.** Toda chamada é server-side.
- **Simulate em produção.** `transparents/simulate-payment` só roda com sandbox key.

## Quando precisar de algo fora do escopo

Se o usuário pedir checkout hospedado, link de pagamento, payouts, transferência PIX, cupons ou trustMRR, busque a doc em `https://docs.abacatepay.com/pages/<area>/<action>` antes de implementar — não está coberto aqui.
