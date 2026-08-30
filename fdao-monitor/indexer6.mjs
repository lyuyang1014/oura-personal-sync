import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const srcPath='fdao-monitor/indexer5.mjs';
let src=fs.readFileSync(srcPath,'utf8');
const start=src.indexOf('async function batch('),end=src.indexOf('const latest=',start);if(start<0||end<0)throw Error('template changed');
const replacement=`async function logsRange(from,to){
 let out=[];const base='https://api.routescan.io/v2/network/mainnet/evm/56/etherscan/api';
 for(let a=from;a<=to;a+=10000){let b=Math.min(to,a+9999),page=1;while(true){let u=new URL(base);for(let [k,v] of Object.entries({module:'logs',action:'getLogs',fromBlock:a,toBlock:b,address:A.FDAO,page,offset:1000}))u.searchParams.set(k,v);let r=await fetch(u);if(!r.ok)throw Error('Routescan HTTP '+r.status);let j=await r.json();if(j.status==='0'&&String(j.message).toLowerCase().includes('no'))break;if(!Array.isArray(j.result))throw Error('Routescan '+JSON.stringify(j).slice(0,200));let rows=j.result.filter(x=>ALL.includes((x.topics?.[0]||'').toLowerCase()));out.push(...rows);if(j.result.length<1000)break;page++;await wait(550)}await wait(550)}return out;
}
`;
src=src.slice(0,start)+replacement+src.slice(end);src=src.replaceAll('bsc-batch-v1','routescan-index-v1');src=src.replace('const BACK=50000','const BACK=200000');const target='/tmp/fdao-indexer-runtime.mjs';fs.writeFileSync(target,src);await import(pathToFileURL(target).href+'?v='+Date.now());