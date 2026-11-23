/**
 * Curated service types shown while browsing a marketplace category.
 * They help visitors identify a task without knowing a professional's name.
 * These are NOT advertisements or claims that a provider is available.
 */
const servicesByCategory:Record<string,string[]>={
  "ar-condicionado":[
    "Instalação de ar-condicionado",
    "Limpeza e higienização",
    "Manutenção preventiva",
    "Conserto de ar-condicionado",
    "Remoção e reinstalação",
    "Diagnóstico de falhas",
  ],
  "eletricista":[
    "Instalação de tomadas e interruptores",
    "Instalação de luminárias",
    "Troca de disjuntores",
    "Instalação de chuveiro elétrico",
    "Revisão de instalação elétrica",
    "Montagem de quadro elétrico",
  ],
  "encanador":[
    "Conserto de vazamentos",
    "Desentupimento de pias e ralos",
    "Troca de torneiras e registros",
    "Instalação de vaso sanitário",
    "Reparo de tubulações",
    "Instalação de caixa-d'água",
  ],
  "reformas-construcao":[
    "Reforma de cozinha",
    "Reforma de banheiro",
    "Alvenaria e construção de paredes",
    "Assentamento de pisos e revestimentos",
    "Reparo de telhados",
    "Reboco e acabamento",
  ],
  "montagem-de-moveis":[
    "Montagem de guarda-roupa",
    "Montagem de armários",
    "Montagem de mesa e escritório",
    "Desmontagem e remontagem",
    "Instalação de prateleiras",
    "Ajuste de portas e gavetas",
  ],
  "tecnologia-cameras":[
    "Instalação de câmeras",
    "Manutenção de sistema de câmeras",
    "Configuração de DVR e NVR",
    "Instalação de vídeo porteiro",
    "Cabeamento de rede",
    "Configuração de Wi-Fi",
  ],
  "limpeza":[
    "Limpeza residencial",
    "Limpeza pós-obra",
    "Limpeza de escritório",
    "Limpeza de vidros",
    "Limpeza pesada",
    "Limpeza de áreas externas",
  ],
  "jardinagem":[
    "Corte de grama",
    "Poda de árvores e arbustos",
    "Manutenção de jardim",
    "Plantio de flores e mudas",
    "Limpeza de quintal",
    "Paisagismo",
  ],
  "fretes-mudancas":[
    "Frete de móveis",
    "Mudança residencial",
    "Mudança comercial",
    "Transporte de eletrodomésticos",
    "Pequenos fretes",
    "Carreto com ajudante",
  ],
  "beleza-bem-estar":[
    "Corte de cabelo",
    "Manicure e pedicure",
    "Maquiagem",
    "Design de sobrancelhas",
    "Penteados",
    "Massagem relaxante",
  ],
};

export function serviceSuggestions(slug:string):string[]{
  return servicesByCategory[slug]||[];
}
