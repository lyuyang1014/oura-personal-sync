import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const srcPath='fdao-monitor/indexer5.mjs';
let src=fs.readFileSync(srcPath,'utf8');
const start=src.indexOf('async function batch(');
const end=src.indexOf('const latest=',start);
if(start<0||end<0)throw new Error('indexer template changed');
const replacement=`async function logsRange(from,to){
  let out=[];
  for(let a=from;a<=to;a+=10000){
    let b=Math.min(to,a+9999),filter={address:A.FDAO,fromBlock:hx(a),toBlock:hx(b),topics:[ALL]},last,ok=false;
    for(let attempt=0;attempt<6;attempt++){
      try{let x=await rpc('eth_getLogs',[filter],'https://bsc.drpc.org',1);out.push(...x);ok=true;break}
      catch(e){last=e;await wait(4000+attempt*3000)}
    }
    if(!ok)throw last;
    await wait(2200);
  }
  return out;
}
`;
src=src.slice(0,start)+replacement+src.slice(end);
src=src.replaceAll("bsc-batch-v1","bsc-drpc-v1");
const target='/tmp/fdao-indexer-runtime.mjs';fs.writeFileSync(target,src);
await import(pathToFileURL(target).href+'?v='+Date.now());
