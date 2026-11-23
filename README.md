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
- Canal público de atendimento em `/suporte`, com protocolo para o usuário e fila privada em `/admin`, inclusive solicitações de privacidade.
- Política de Privacidade em `/privacidade` e Termos de Uso em `/termos`, exibidos no cadastro.
- Novos cadastros exigem aceite dos Termos e senha com pelo menos 10 caracteres, letras e números; senhas antigas ainda podem entrar.
- Cadastro profissional sem área de atuação leva à página de perfil para selecionar especialidades antes de aparecer nas buscas.
- O administrador real preenche nome/razão social, e-mail de contato e CNPJ (se houver) pela aba **Configurações**; esses dados aparecem publicamente nos documentos legais.


Pagamentos e comissões foram intencionalmente adiados. Notificações push com o navegador fechado **não** estão configuradas, e o primeiro administrador precisa ser autorizado manualmente pelo proprietário do banco.

## Administração — somente a conta autorizada
- A primeira conta proprietária foi ativada; há **exatamente um** registro em `admin_members` e seu perfil tem `account_type='admin'`.
- O endereço `/admin` não aparece em menus, cadastros, busca ou na interface pública.
- Uma pessoa sem sessão ou com conta comum recebe **404**, inclusive quando tenta acessar o link diretamente. Só uma sessão autenticada do proprietário, com perfil e associação válidos, recebe o painel real.
- Para entrar no próprio celular, o proprietário autentica-se na página normal `/acesso` com sua conta administrativa exclusiva e abre `/admin`; `/painel` também o redireciona quando autenticado.
- As rotas antigas de demonstração e convite `/admin/teste` e `/admin/ativar` foram removidas. A migration `close_owner_admin_registration_after_activation` revogou a permissão de autoconcessão administrativa para usuários comuns.
- Moderar denúncias, conferir profissionais, responder solicitações e editar informações legais também depende de verificações de autorização no Supabase. Não basta conhecer um endereço.
- O selo **Perfil conferido pela equipe** representa análise manual e não equivale a uma verificação governamental de identidade.

## Validação de homologação
O código tem lint/build e verificações automatizadas de rotas. **Os testes com duas contas reais ainda são manuais.** Consulte `docs/HOMOLOGACAO.md` para o roteiro completo.


## Condições para abertura ao público
- Ativar o **administrador real** pelo convite único recebido pelo proprietário; a demonstração não pode moderar dados reais.
- Preencher a identificação legal do responsável e o contato público pela aba Configurações do painel.
- Fazer os profissionais selecionarem suas categorias de atuação; não atribuir categorias fictícias a contas existentes.
- Conferir no Supabase Auth os ajustes de e-mail e a proteção contra senhas comprometidas. A configuração **Confirm email** não é controlada por migrations do GitHub.
- O suporte pode ser registrado e atendido no painel, mas o retorno por e-mail ainda é manual.
- O código e a interface passam por CI, mas isso não substitui a verificação operacional de acesso administrativo e configurações de Auth.

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
