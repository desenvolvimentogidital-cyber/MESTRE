import {PublicMarketplaceSearch} from "@/components/public-marketplace-search";

export default async function ProfessionalsPage({searchParams}:{
  searchParams:Promise<{q?:string;categoria?:string;cidade?:string}>
}){
  const {q="",categoria="",cidade=""}=await searchParams;
  const id=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(categoria)?categoria:"";
  return <PublicMarketplaceSearch mode="professionals" initialQuery={q} initialCategory={id} initialCity={cidade}/>;
}
