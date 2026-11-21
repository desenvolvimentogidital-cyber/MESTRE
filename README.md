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
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Execute:

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Deploy na Vercel
1. Importe este repositório no painel da Vercel.
2. Mantenha o framework como Next.js e a raiz como `./`.
3. Configure as duas variáveis de ambiente acima em Production, Preview e Development.
4. Faça o deploy.

## Segurança
- Nunca adicione `.env.local`, service role key ou secret key ao Git.
- A chave publishable pode ser usada no navegador; a proteção dos dados é feita pelas políticas RLS do Supabase.
- Não use dados de `user_metadata` para decisões de autorização.

## ConectaServ — módulos implementados
- Identidade visual responsiva com temas claro e escuro.
- Cadastro de clientes e profissionais e seleção de categorias.
- Publicação de pedidos com localização; profissionais da categoria podem enviar propostas.
- Aceite ou recusa de proposta, chat privado e conclusão de contratação.
- Avaliações com 1 a 5 estrelas após serviço concluído; média real no perfil público.
- Notificações automáticas **dentro do aplicativo** para novas oportunidades, propostas, contratações, mensagens, encerramentos e moderação.
- Solicitação de conferência do perfil e aprovação/rejeição pela equipe.
- Denúncias, fila administrativa e ações de moderação, restritas a administradores.

Pagamentos e comissões foram intencionalmente adiados. Notificações push com o navegador fechado **não** estão configuradas, e o primeiro administrador precisa ser autorizado manualmente pelo proprietário do banco.

## Administração — ativação segura
A tabela `public.admin_members` inicia vazia; nenhum cadastro recebe poderes de administração automaticamente.

1. Crie sua própria conta no app e confirme o e-mail.
2. No SQL Editor do **seu** Supabase, identifique o usuário pelo endereço de e-mail confirmado:
```sql
select id,email,email_confirmed_at from auth.users where email='<seu email>';
```
3. Confira se a conta é a sua e, somente no editor administrativo do banco, autorize o UUID correspondente:
```sql
insert into public.admin_members(user_id) values ('<uuid confirmado>');
```
4. Abra `/admin`. Nenhum usuário comum consegue conceder essa permissão pelo navegador.

O selo **Perfil conferido pela equipe** representa análise manual de informações profissionais. Não equivale à validação oficial de identidade nem substitui análise documental especializada.

## Validação de homologação
O código tem lint/build e verificações automatizadas de rotas. **Os testes com duas contas reais ainda são manuais.** Consulte `docs/HOMOLOGACAO.md` para o roteiro completo.


## Instalação no Android
Abra `https://mestre-rho.vercel.app/instalar` no Google Chrome e escolha **Instalar aplicativo** ou **Adicionar à tela inicial** no menu de três pontos. O ConectaServ terá um ícone e será aberto em uma janela sem a barra do navegador.

O aplicativo instalado utiliza a versão online do mesmo domínio. Alterações aprovadas no GitHub `main` acionam o deploy configurado na Vercel, e os usuários recebem a versão atualizada ao abrir ou recarregar o aplicativo. **A conversa no ChatGPT, por si só, não publica nem altera o software**; só commits efetivamente publicados o fazem. Não há modo offline nem push com o aplicativo fechado nesta etapa.



## Busca pública com contato protegido
- `/profissionais`: visitantes sem conta podem pesquisar prestadores por especialidade, inclusive "pedreiro" em reformas, categoria e cidade.
- `/oportunidades`: visitantes sem conta podem consultar resumos de pedidos abertos de clientes, pesquisar e filtrar.
- Nenhum identificador do cliente, anexo privado ou endereço de residência é retornado pela busca pública. Resumos textuais ocultam padrões comuns de telefone, e-mail e links; quem publica é avisado para não colocar dados pessoais no anúncio.
- Ao clicar em **Conversar**, o visitante é encaminhado ao login/cadastro; depois de autenticado como cliente, a plataforma cria ou reutiliza uma conversa privada com o profissional ativo.
- Para enviar um orçamento em um pedido público, é preciso entrar com conta profissional e acessar a área autenticada.
- Conversas diretas têm limitação de novas solicitações por dia, acesso restrito aos participantes e não permitem contato com prestadores suspensos.

