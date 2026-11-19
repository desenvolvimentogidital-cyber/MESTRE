# Mestre

Marketplace de serviços que conecta clientes e profissionais. Aplicação web responsiva, preparada para instalação como PWA.

## Tecnologias
- Next.js (App Router) + React + TypeScript
- Supabase Auth e Postgres
- Deploy preparado para Vercel

## Rodar localmente
1. Instale Node.js 20.9 ou superior.
2. Copie `.env.example` para `.env.local`.
3. Preencha as variáveis do Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (use a chave publishable do projeto)
4. Execute:

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Deploy na Vercel
1. Importe este repositório no painel da Vercel.
2. Mantenha o framework como Next.js.
3. Configure as duas variáveis de ambiente acima em Production, Preview e Development.
4. Faça o deploy.

## Segurança
- Nunca adicione `.env.local`, service role key ou secret key ao Git.
- A chave publishable/anon pode ser usada no navegador; a proteção dos dados é feita pelas políticas RLS do Supabase.
- Não use dados de `user_metadata` para decisões de autorização.

## Estado atual
A base visual, rotas de acesso e integração inicial de autenticação estão implementadas. Os fluxos de perfil, pedidos, propostas, chat, avaliações e administração ainda serão desenvolvidos e testados antes de considerar o produto pronto.
