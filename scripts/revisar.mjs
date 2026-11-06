// Revisión rápida del proyecto, sin navegador. Sirve para cualquier agente o persona.
//   node scripts/revisar.mjs           → todo
//   node scripts/revisar.mjs --rapido  → igual, pero solo imprime si hay problemas
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const rapido = process.argv.includes('--rapido');
const problemas = [];

const archivosJs = (dir) => readdirSync(dir).flatMap((n) => {
  const ruta = join(dir, n);
  return statSync(ruta).isDirectory() ? archivosJs(ruta) : n.endsWith('.js') ? [ruta] : [];
});
const js = archivosJs(join(raiz, 'js'));

// 1) Sintaxis de cada archivo
for (const archivo of js) {
  const r = spawnSync(process.execPath, ['--check', archivo], { encoding: 'utf8' });
  if (r.status !== 0) problemas.push(`Sintaxis: ${relative(raiz, archivo)}\n${r.stderr.trim()}`);
}

// 2) index.html: sin BOM, archivos existentes y con versión ?v=N
const html = readFileSync(join(raiz, 'index.html'));
if (html[0] === 0xef && html[1] === 0xbb && html[2] === 0xbf) problemas.push('index.html tiene BOM (guárdalo en UTF-8 sin BOM)');
const texto = html.toString('utf8');
const cargados = [...texto.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => m[1]);
for (const ref of cargados) {
  const [ruta, consulta] = ref.split('?');
  if (!existsSync(join(raiz, ruta))) problemas.push(`index.html carga un archivo que no existe: ${ruta}`);
  if (!/^v=\d+$/.test(consulta || '')) problemas.push(`index.html: ${ruta} no tiene ?v=N`);
}
const rutasCargadas = new Set(cargados.map((r) => r.split('?')[0]));
for (const archivo of js) {
  const rel = relative(raiz, archivo).replaceAll('\\', '/');
  if (!rutasCargadas.has(rel)) problemas.push(`${rel} no se carga en index.html`);
}

// 3) Nombres globales repetidos entre scripts clásicos (rompen la carga)
const globales = new Map();
for (const archivo of js) {
  if (archivo.endsWith('portada.js')) continue; // está dentro de una función autoejecutable
  const codigo = readFileSync(archivo, 'utf8');
  for (const m of codigo.matchAll(/^(?:async\s+)?(?:function|const|let|var|class)\s+([\p{L}\w$]+)/gmu)) {
    const lista = globales.get(m[1]) || [];
    lista.push(relative(raiz, archivo));
    globales.set(m[1], lista);
  }
}
for (const [nombre, lista] of globales) {
  if (lista.length > 1) problemas.push(`Nombre global repetido "${nombre}" en: ${lista.join(', ')}`);
}

// 4) Fotos referenciadas que no existen
const datosFotos = ['js/modelo/fotos.js', 'js/modelo/patrimonio.js'].map((f) => readFileSync(join(raiz, f), 'utf8')).join('\n');
for (const m of datosFotos.matchAll(/"(img\/[^"]+\.(?:jpe?g|png|webp))"/g)) {
  if (!existsSync(join(raiz, m[1]))) problemas.push(`Falta la imagen ${m[1]}`);
}

if (problemas.length) {
  console.log(`REVISIÓN: ${problemas.length} problema(s)\n- ` + problemas.join('\n- '));
  process.exit(1);
}
if (!rapido) console.log(`REVISIÓN OK · ${js.length} archivos JS · ${cargados.length} archivos en index.html · ${globales.size} nombres globales`);
