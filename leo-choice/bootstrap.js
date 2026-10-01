import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';

const tar = gunzipSync(Buffer.from(readFileSync('bundle.b64','utf8').trim(),'base64'));
const wanted = new Set(['server.js','public/choice-widget.html']);

for (let at=0; at+512<=tar.length;) {
  const raw = tar.subarray(at,at+100).toString('utf8').replace(/\0.*$/,'');
  if (!raw) break;
  const size = parseInt(tar.subarray(at+124,at+136).toString('ascii').replace(/\0.*$/,'').trim() || '0',8);
  const start = at+512;
  const name = raw.replace(/^leo-choice\//,'');
  if (wanted.has(name)) {
    if (name.includes('/')) mkdirSync(name.slice(0,name.lastIndexOf('/')),{recursive:true});
    writeFileSync(name, tar.subarray(start,start+size));
  }
  at = start + Math.ceil(size/512)*512;
}

await import(pathToFileURL(process.cwd() + '/server.js').href);
