import fs from 'node:fs/promises';
const out=new URL('../outputs/',import.meta.url);
let page=await fs.readFile(new URL('source/reference-library-page.html',out),'utf8');
const data=await fs.readFile(new URL('source/vehicle-reference-index.json',out),'utf8');
page=page.replace('<script type="module">',`<script id="embedded-index" type="application/json">${data.replaceAll('<','\\u003c')}</script><script type="module">`);
page=page.replace('try{const response=await fetch(manifestURL',"try{if(location.protocol==='file:'){acceptIndex(JSON.parse(document.querySelector('#embedded-index').textContent));return;}const response=await fetch(manifestURL");
page=page.replace('grid-template-columns:62vw minmax(0,1fr)','grid-template-columns:minmax(0,1fr) minmax(0,1fr)');
await fs.writeFile(new URL('reference-library.html',out),page);
console.log('Reference library built with local embedded index and model comparison.');
