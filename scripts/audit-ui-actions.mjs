import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const appFiles=walk("app");
const routes=appFiles.filter(f=>/\/(page|route)\.tsx?$/.test(f)).map(f=>"/"+f.replace(/^app\//,"").replace(/(?:\/)?(?:page|route)\.tsx?$/,"").replace(/\([^/]+\)\/?/g,"").replace(/\/$/,""));
const routeMatches=(url)=>{
 const target=url.split(/[?#]/)[0].replace(/\/$/,"")||"/";
 return routes.some(route=>{const a=route.split("/"),b=target.split("/");return a.length===b.length&&a.every((part,i)=>/^\[.+\]$/.test(part)?Boolean(b[i]):part===b[i]);});
};
const files=[...appFiles,...walk("components")].filter(f=>f.endsWith(".tsx"));
let buttons=0,links=0,forms=0,details=0;
const errors=[];
for(const file of files){
 const source=ts.createSourceFile(file,fs.readFileSync(file,"utf8"),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const report=(node,msg)=>errors.push(file+":"+(source.getLineAndCharacterOfPosition(node.getStart(source)).line+1)+" "+msg);
 function attr(node,name){return node.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.getText(source)===name);}
 function literal(a){if(!a?.initializer)return undefined;const i=a.initializer;if(ts.isStringLiteral(i))return i.text;if(ts.isJsxExpression(i)&&i.expression&&ts.isStringLiteral(i.expression))return i.expression.text;}
 function ancestor(node,name){for(let p=node.parent;p;p=p.parent){if(ts.isJsxElement(p)&&p.openingElement.tagName.getText(source)===name)return p.openingElement;}return undefined;}
 function visit(node){
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
   const tag=node.tagName.getText(source);
   if(tag==="button"){
    buttons++;
    const handler=attr(node,"onClick"),type=literal(attr(node,"type"))||"submit";
    const form=ancestor(node,"form");
    if(!handler&&!(type==="submit"&&form&&(attr(form,"onSubmit")||attr(form,"action"))))report(node,"botão sem ação ou formulário");
   }
   if(tag==="Link"||tag==="a"){
    links++;const href=attr(node,"href");const url=literal(href);
    if(!href||url===""||url==="#")report(node,"link sem destino");
    if(url?.startsWith("/")&&!url.startsWith("//")&&!routeMatches(url))report(node,"rota inexistente: "+url);
   }
   if(tag==="form"){forms++;if(!attr(node,"onSubmit")&&!attr(node,"action"))report(node,"formulário sem envio");}
   if(tag==="summary"){details++;if(!ancestor(node,"details"))report(node,"summary fora de details");}
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
}
console.log(JSON.stringify({files:files.length,buttons,links,forms,details,errors},null,2));
assert.equal(errors.length,0,"Controles sem ação ou links inválidos");
