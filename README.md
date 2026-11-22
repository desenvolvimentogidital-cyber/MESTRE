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
- Publicação de pedidos com localização, cancelamento de pedidos ainda não contratados e recusa automática de propostas pendentes; profissionais da categoria podem enviar propostas.
- Aceite ou recusa de proposta, chat privado e conclusão de contratação.
- Avaliações com 1 a 5 estrelas após serviço concluído; média real no perfil público.
- Notificações automáticas **dentro do aplicativo** para novas oportunidades, propostas, contratações, mensagens, encerramentos e moderação.
- Solicitação de conferência do perfil e aprovação/rejeição pela equipe.
- Denúncias, fila administrativa e ações de moderação, restritas a administradores.

Pagamentos e comissões foram intencionalmente adiados. Notificações push com o navegador fechado **não** estão configuradas, e o primeiro administrador precisa ser autorizado manualmente pelo proprietário do banco.

## Administração — ativação por convite único
O painel real em `/admin` exige autenticação Supabase **e** uma linha autorizada em `admin_members`.
A demonstração em `/admin/teste` é independente e nunca acessa registros reais.

A migration `20261122221557_owner_admin_invitation_activation.sql` cria o caminho seguro para ativar o primeiro administrador sem disponibilizar uma tela de cadastro de admin aberta ao público.

1. O operador autorizado gera **um convite aleatório e de uso único** pelo SQL Editor no Supabase, armazenando apenas o SHA-256 na tabela privada `private.admin_activation_codes`, com vencimento. Nunca publique o código no repositório.
2. A pessoa responsável abre `/admin/ativar` com o convite e cria uma **nova conta exclusiva**, sem histórico de cliente ou profissional, com e-mail de sua propriedade e senha forte.
3. Ao inserir o código, a função `activate_admin_with_invite` valida a sessão, o código, seu prazo e a inexistência de outro administrador. Somente então transforma o perfil em `admin` e adiciona `admin_members`.
4. A função bloqueia novas ativações após a primeira, impede que contas com atividade prévia sejam promovidas e roda somente para usuários autenticados.
5. A conta recém-ativada entra pelo `/admin`; acessos normais via `/painel` também redirecionam para a administração.

**Atenção:** o e-mail e a senha públicos `admin@gmail.com` / `123456789` são apenas uma demonstração fictícia. Não são credenciais reais do Supabase e nunca devem receber acesso a dados de produção.

O modo de homologação pode dispensar **confirmação de e-mail**, mas essa opção deve ser desligada em **Supabase Dashboard → Authentication → Providers → Email → Confirm email**. Essa configuração não pode ser controlada pela migration ou pelo código de frontend. A falta de confirmação não equivale a comprovar a posse de um endereço, por isso a conta administrativa precisa usar um e-mail controlado pelo responsável.

O selo **Perfil conferido pela equipe** representa análise manual de informações profissionais; não equivale a uma verificação governamental de identidade.

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



## Cadastro sem confirmação de e-mail (temporário)
O proprietário do projeto escolheu não exigir confirmação de e-mail por enquanto.

**Configuração necessária no Supabase:** abra
https://supabase.com/dashboard/project/iswfypzcjwrjnnuavans/auth/providers
→ **Email** → desative **Confirm email** (Confirmar e-mail) → **Save**.

Essa é uma configuração do Auth do Supabase e **não é controlada por uma migration SQL nem pelo código do GitHub**. Sem essa alteração manual, o Supabase poderá continuar retornando um usuário sem sessão ativa, impedindo o login imediato.

Depois de desligar a confirmação, o fluxo do ConectaServ registra o usuário com `signUp` e redireciona diretamente ao painel, reutilizando a sessão devolvida pelo Supabase. Não são solicitados códigos ou cliques de confirmação.

**Atenção:** sem verificação de e-mail, alguém pode cadastrar um endereço que não lhe pertence. Mantenha senhas fortes, moderação e controles de abuso; para lançamento público amplo, reavalie a confirmação e o SMTP. A recuperação de senha por e-mail ainda requer um provedor de envio configurado.
