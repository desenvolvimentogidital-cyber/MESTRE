# ConectaServ — roteiro de homologação final

## Antes de testar
- Verifique o domínio `https://mestre-rho.vercel.app` no celular e o visual claro/escuro.
- No Supabase, confirme que estão aplicadas as migrações `trust_admin_moderation` e `automatic_app_notifications`.
- Configure o endereço de redirecionamento do Supabase Auth para o domínio de produção.
- **Não** ative cobrança, pagamentos ou comissão. Fora do escopo atual.

## Teste 1 — publicação e aviso
- Crie uma conta de cliente com e-mail e senha, **sem confirmação** durante a homologação (desative Confirm email no Supabase Auth).
- Crie uma conta separada de profissional com outro e-mail e senha, também sem confirmação nesta fase.
- No profissional, salve cidade/UF e selecione uma categoria.
- No cliente, publique um pedido na mesma categoria e UF.
- Confira o pedido em `/prestador` e o aviso automático em `/notificacoes`.
- Em outro pedido publicado, use **Cancelar pedido** no painel do cliente; confirme que não aparece mais para o profissional e que propostas pendentes ficam recusadas. Tente cancelar um serviço já contratado: deve ser recusado.
- Teste categoria diferente: o pedido não deve gerar notificação para quem selecionou outras áreas.

## Teste 2 — orçamento, contratação e mensagens
- Profissional envia uma proposta em `/prestador/pedido/[id]`.
- Cliente recebe aviso, visualiza profissional e aceita uma proposta em `/propostas`.
- Confirme que as demais propostas do mesmo pedido foram recusadas e somente uma ficou aceita.
- Abra a conversa pelo cliente e pelo profissional. Troque mensagens e confira que apenas os participantes conseguem lê-las.
- Cliente encerra o pedido em `/cliente`. A conversa deve ficar disponível apenas para consulta.
- Um usuário não envolvido não pode visualizar a conversa.

## Teste 3 — avaliações e reputação
- Cliente acessa `/avaliar/[id]` após encerrar o serviço.
- Envia de 1 a 5 estrelas com comentário opcional.
- O perfil público `/profissional/[id]` deve mostrar a média real e o número de avaliações.
- Tentar avaliar o mesmo serviço novamente não deve criar segunda avaliação.
- Um profissional não pode avaliar seu próprio serviço.

## Teste 4 — moderação e verificação
- A conta exclusiva do proprietário já foi ativada. Entre em `/acesso` e depois abra `/admin` para conferir sua autorização. O profissional solicita a conferência de perfil.
- Administrador entra em `/admin` e aprova/recusa, com justificativa.
- Profissional recebe um aviso sobre a decisão e apenas o perfil aprovado exibe o selo.
- Usuário denuncia um pedido, perfil, conversa ou avaliação.
- Administrador visualiza o relato e arquiva, suspende ou toma a ação apropriada.
- Confira que visitante, cliente ou profissional recebem **404** em `/admin`, `/admin/teste` e `/admin/ativar`, inclusive com links diretos; os botões administrativos e as ações de banco devem continuar exclusivos do proprietário.

## Liberação operacional
- Conferir a aba **Suporte** do painel administrativo real e o formulário público `/suporte`; guardar o protocolo.
- Conferir a aba **Configurações** e preencher o nome ou razão social do operador e o contato oficial; checar publicação em `/privacidade` e `/termos`.
- Testar cadastro novo com Termos aceitos e senha forte. O servidor deve rejeitar aceite ausente e senha fraca.
- Confirmar configurações de autenticação e proteção de senhas vazadas no Supabase Dashboard.
- Pelo perfil profissional, selecionar especialidades reais. Perfis sem categoria não devem aparecer como fornecedores associados à categoria.
- Não anunciar lançamento público geral antes de completar a identificação do responsável e os ajustes de autenticação.

## Teste 5 — experiência no celular
- Navegação por ícones, upload de foto, rolagem e formulários.
- Alternar tema claro/escuro e atualizar a página.
- Simular conexão lenta; conferir estados de erro e mensagens vazias.
- Conferir fotografias e cortes de imagem em Android.
- Testar links, saída e recuperação de senha.

## Limites explícitos
- Avisos são gerados pelo banco e consultados periodicamente no aplicativo. **Push no Android com o site fechado não está habilitado.**
- A conferência profissional é administrativa; não há integração oficial de KYC/documentos.
- O antigo painel demonstrativo e o convite público de ativação estão **desativados**; a conta administrativa real é única e não aparece nos menus públicos.
- Os testes de banco de dados de pedidos, contratação, chat, avaliação, denúncia, moderação e verificação passaram em transações revertidas. A autorização administrativa única está ativa; acompanhe as configurações de e-mail e o acesso real do proprietário.
- Pagamentos/comissões ficam para uma etapa futura.
