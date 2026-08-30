import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const srcPath='fdao-monitor/indexer5.mjs';
let src=fs.readFileSync(srcPath,'utf8');
const start=src.indexOf('async function batch(');
const end=src.indexOf('const latest=',start);
if(start<0||end<0)throw new Error('indexer template changed');
const replacement=`async function logsRange(from,to){
  let out=[];
  const eps=['https://bsc-rpc.publicnode.com','https://bsc-mainnet.public.blastapi.io','https://bsc-rpc.blockreq.com/v1/rpc/public'];
  for(let a=from;a<=to;a+=5000){
    let b=Math.min(to,a+4999),filter={address:A.FDAO,fromBlock:hx(a),toBlock:hx(b),topics:[ALL]},last,ok=false;
    for(let url of eps){for(let attempt=0;attempt<2;attempt++){try{let x=await rpc('eth_getLogs',[filter],url,1);out.push(...x);ok=true;break}catch(e){last=e;await wait(1200)}}if(ok)break}
    if(!ok)throw last;
    await wait(350);
  }
  return out;
}
`;
src=src.slice(0,start)+replacement+src.slice(end);
src=src.replaceAll("bsc-batch-v1","bsc-multi-v2");
src=src.replace('const BACK=50000','const BACK=150000');
const target='/tmp/fdao-indexer-runtime.mjs';fs.writeFileSync(target,src);
await import(pathToFileURL(target).href+'?v='+Date.now());
