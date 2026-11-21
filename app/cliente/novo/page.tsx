"use client";

import { AppFrame } from "@/components/conectaserv-ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string };

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const maxFileSize = 15 * 1024 * 1024;

export default function NewClientRequestPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const [neighborhood, setNeighborhood] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("service_categories").select("id,name").eq("is_active", true).order("name")
      .then(({ data, error }) => {
        if (error) setMessage("Não foi possível carregar as categorias.");
        else setCategories(data ?? []);
      });
  }, []);

  function validateFiles(selected: File[]) {
    if (selected.some(file => !allowedTypes.includes(file.type))) return "Envie somente imagens JPG, PNG, WebP ou arquivos PDF.";
    if (selected.some(file => file.size > maxFileSize)) return "Cada arquivo pode ter no máximo 15 MB.";
    return "";
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const fileError = validateFiles(files);
    if (fileError) { setMessage(fileError); return; }
    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      setMessage("O orçamento mínimo não pode ser maior que o máximo.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const uploadedPaths: string[] = [];
    let requestId = "";
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Sua sessão expirou. Entre novamente.");

      requestId = crypto.randomUUID();
      for (const file of files) {
        const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100);
        const path = `${user.id}/${requestId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("request-files").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (uploadError) throw new Error(`Falha ao enviar ${file.name}: ${uploadError.message}`);
        uploadedPaths.push(path);
      }

      const { error: requestError } = await supabase.from("service_requests").insert({
        id: requestId,
        client_id: user.id,
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        neighborhood: neighborhood.trim() || null,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        status: "published",
      });
      if (requestError) throw requestError;

      if (uploadedPaths.length) {
        const { error: attachmentError } = await supabase.from("request_attachments").insert(
          uploadedPaths.map(storage_path => ({ request_id: requestId, storage_path }))
        );
        if (attachmentError) {
          await supabase.from("service_requests").delete().eq("id", requestId);
          throw attachmentError;
        }
      }

      router.replace("/cliente?criado=1");
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length) await supabase.storage.from("request-files").remove(uploadedPaths);
      setMessage(error instanceof Error ? error.message : "Não foi possível publicar seu pedido. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppFrame title="Publicar pedido" active="inicio"><div className="cs-request-form-shell">
      <section className="client-form-wrap">
        <div className="eyebrow"><span className="eyebrow-dot" /> NOVO PEDIDO</div>
        <h1>O que você precisa?</h1>
        <p className="client-form-intro">Descreva o serviço. Profissionais da sua região poderão encontrar seu pedido e enviar propostas.</p>
        <form className="client-request-form" onSubmit={submit}>
          <label>Categoria do serviço
            <select required value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">Selecione uma categoria</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>Título do pedido<input required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Instalação de câmeras em residência" /></label>
          <label>Conte os detalhes<textarea required minLength={15} maxLength={3000} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Explique o que precisa, quantidades, medidas e qualquer detalhe importante." /></label>
          <div className="client-form-grid">
            <label>Cidade<input required value={city} onChange={e => setCity(e.target.value)} placeholder="Sua cidade" /></label>
            <label>Estado<input required maxLength={2} value={state} onChange={e => setState(e.target.value)} placeholder="SP" /></label>
            <label>Bairro (opcional)<input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Seu bairro" /></label>
          </div>
          <div className="client-form-grid">
            <label>Orçamento mínimo (R$)<input type="number" min="0" step="0.01" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} placeholder="Opcional" /></label>
            <label>Orçamento máximo (R$)<input type="number" min="0" step="0.01" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="Opcional" /></label>
          </div>
          <label>Fotos ou documentos (opcional)
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setFiles(Array.from(e.target.files ?? []))} />
            <small>JPG, PNG, WebP ou PDF. Até 15 MB por arquivo.</small>
          </label>
          {files.length > 0 && <p className="selected-files">{files.length} arquivo(s) selecionado(s)</p>}
          {message && <p className="access-message" role="alert">{message}</p>}
          <button className="access-submit" disabled={busy || categories.length === 0}>{busy ? "Publicando pedido..." : "Publicar pedido grátis →"}</button>
        </form>
      </section>
    </div></AppFrame>
  );
}
