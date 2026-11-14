import http from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// This helper serves the same generated files that are published on GitHub Pages.
export function createPreview({root=fileURLToPath(new URL('../_site/',import.meta.url))}={}){
 const base='/SwaraNusa';
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
 return http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/'||url.pathname===base){res.writeHead(302,{Location:base+'/'});return res.end();}
  if(!url.pathname.startsWith(base+'/')){res.writeHead(404);return res.end('Halaman tidak ditemukan.');}
  try{
   const relative=decodeURIComponent(url.pathname.slice(base.length+1));
   const target=path.resolve(root,relative);
   if(target!==path.resolve(root)&&!target.startsWith(path.resolve(root)+path.sep))throw new Error('outside');
   let actual=await realpath(target);
   const canonicalRoot=await realpath(root);
   if(actual!==canonicalRoot&&!actual.startsWith(canonicalRoot+path.sep))throw new Error('outside');
   if((await stat(actual)).isDirectory())actual=path.join(actual,'index.html');
   const body=await readFile(actual);
   res.writeHead(200,{'Content-Type':types[path.extname(actual)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':body.length});
   res.end(req.method==='HEAD'?undefined:body);
  }catch{
   res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
   const page=await readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Halaman tidak ditemukan.'));
   res.end(req.method==='HEAD'?undefined:page);
  }
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);
 const server=createPreview();
 server.listen(port,'127.0.0.1',()=>console.log(`SwaraNusa: http://127.0.0.1:${port}/SwaraNusa/`));
}
