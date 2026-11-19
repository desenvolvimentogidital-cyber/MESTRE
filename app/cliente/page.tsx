import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default async function ClientHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acesso");

  const { data: requests, error } = await supabase
    .from("service_requests")
    .select("id, title, description, city, state, status, created_at, service_categories(name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="dashboard">
      <header className="dash-header">
        <Link className="brand" href="/"><span className="brand-mark">M</span>Mestre</Link>
        <form action="/auth/signout" method="post"><button className="logout" type="submit">Sair</button></form>
      </header>
      <section className="client-content">
        <div className="client-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> ÁREA DO CLIENTE</div>
          <h1>Meus pedidos</h1><p>Acompanhe seus pedidos e encontre profissionais para o que precisa.</p></div>
          <Link className="btn btn-primary" href="/cliente/novo">＋ Publicar pedido</Link>
        </div>
        {error && <div className="client-empty">Não foi possível carregar seus pedidos. Atualize a página para tentar novamente.</div>}
        {!error && (!requests || requests.length === 0) && (
          <div className="client-empty">
            <div className="client-empty-icon">⌂</div>
            <h2>Você ainda não publicou nenhum pedido</h2>
            <p>Conte o que precisa e receba propostas de profissionais.</p>
            <Link className="btn btn-primary" href="/cliente/novo">Criar meu primeiro pedido</Link>
          </div>
        )}
        {!!requests?.length && (
          <div className="request-list">
            {requests.map((request) => {
              const category = request.service_categories;
              const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;
              return (
                <article className="request-card" key={request.id}>
                  <div className="request-card-top"><span className="request-category">{categoryName ?? "Serviço"}</span><span className={`request-status status-${request.status}`}>{statusLabels[request.status] ?? request.status}</span></div>
                  <h2>{request.title}</h2>
                  <p>{request.description}</p>
                  <div className="request-meta"><span>⌖ {request.city}, {request.state}</span><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(request.created_at))}</span></div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
