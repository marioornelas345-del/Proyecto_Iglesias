// Prueba completa en el navegador (Edge o Chrome sin ventana). No necesita librerías extra.
//   node scripts/probar.mjs
// Levanta su propio servidor, crea una cuenta de prueba, recorre el sitio y la borra.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const PUERTO = 5199;
const DEPURACION = 9399;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const NAVEGADORES = [
  process.env.NAVEGADOR,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'
].filter(Boolean);
const navegador = NAVEGADORES.find((r) => existsSync(r));
if (!navegador) { console.log('FALLA: no encontré Edge ni Chrome (usa la variable NAVEGADOR=ruta)'); process.exit(1); }

const servidorJs = join(raiz, 'node_modules', 'http-server', 'bin', 'http-server');
if (!existsSync(servidorJs)) { console.log('FALLA: falta http-server. Corre "npm install" primero.'); process.exit(1); }

const procesos = [];
const perfil = mkdtempSync(join(tmpdir(), 'templos-prueba-'));
const salir = (codigo) => {
  procesos.forEach((p) => p.kill());
  setTimeout(() => { try { rmSync(perfil, { recursive: true, force: true }); } catch {} process.exit(codigo); }, 500);
};

procesos.push(spawn(process.execPath, [servidorJs, raiz, '-p', PUERTO, '-c-1', '-s'], { stdio: 'ignore' }));
procesos.push(spawn(navegador, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${DEPURACION}`, `--user-data-dir=${perfil}`, '--window-size=1400,950', 'about:blank'], { stdio: 'ignore' }));

let objetivo;
for (let i = 0; i < 60 && !objetivo; i++) {
  await espera(250);
  try { objetivo = (await (await fetch(`http://127.0.0.1:${DEPURACION}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
if (!objetivo) { console.log('FALLA: el navegador no respondió'); salir(1); }

const ws = new WebSocket(objetivo.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pendientes = new Map();
const errores = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id) pendientes.get(m.id)?.(m.result ?? m);
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  // Los servicios externos (mapas, rutas) pueden fallar sin que sea culpa del sitio
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && String(m.params.entry.url || '').includes(`127.0.0.1:${PUERTO}`)) errores.push(`${m.params.entry.text} ${m.params.entry.url}`);
};
const cdp = (method, params = {}) => new Promise((r) => { const id = ++n; pendientes.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => {
  const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return r.exceptionDetails ? `EXC ${r.exceptionDetails.exception?.description}` : r.result.value;
};
const poner = (id, v) => `document.getElementById('${id}').value=${JSON.stringify(v)};`;

let fallas = 0;
const comprobar = async (nombre, expresion) => {
  const valor = await ev(expresion);
  const ok = valor === true;
  if (!ok) fallas++;
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${nombre}${ok ? '' : ` → ${JSON.stringify(valor)}`}`);
};

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
await cdp('Page.navigate', { url: `http://127.0.0.1:${PUERTO}/` });
await espera(2000);

// Crear cuenta
await ev(`document.getElementById('tab-registro').click();${poner('nombre', 'Prueba')}${poner('correo', 'prueba@ejemplo.com')}${poner('contrasena', 'secreto1')}${poner('confirmar', 'secreto1')}document.getElementById('form-auth').requestSubmit();`);
await espera(5500);
await comprobar('Crear cuenta muestra la aplicación', `!document.getElementById('app').hidden && document.getElementById('usuario-nombre').textContent === 'Prueba'`);
await comprobar('Carrusel, tarjetas y marcadores (10 iglesias)', `TEMPLOS.length === 10 && document.querySelectorAll('.tarjeta').length === 10`);

// Iglesias y mapa
await ev(`document.querySelector('#tarjetas [data-i="3"]').click()`); await espera(1200);
await comprobar('Elegir una tarjeta cambia la ficha y el mapa', `estado.elegida === 3 && document.querySelector('.mapa-ficha h3').textContent === TEMPLOS[3].tipo + ' ' + TEMPLOS[3].nombre`);
await comprobar('La ficha muestra la dirección', `document.querySelector('.info-direccion strong').textContent === TEMPLOS[3].direccion`);

// Apartados de cada iglesia
for (const t of ['catedral', 'santalucia', 'jesus', 'mejorada', 'santiago', 'santaana', 'santaisabel', 'sancristobal', 'sanjuan', 'sansebastian']) {
  for (const tipo of ['libros', 'arte', 'eventos']) {
    await ev(`location.hash='#${tipo}/${t}'`); await espera(350);
    await comprobar(`#${tipo}/${t}`, `!document.getElementById('vista-apartado').hidden && document.getElementById('vista-titulo') !== null`);
  }
}
await ev(`location.hash='#arte/catedral'`); await espera(500);
await comprobar('Ventana de detalle de una pieza', `(abrirDetalle(), document.getElementById('pieza-detalle').open)`);
await ev(`document.getElementById('pieza-detalle').close()`);

// Imágenes locales
await comprobar('Todas las fotos de iglesias y arte existen', `(async () => {
  const urls = new Set();
  TEMPLOS.forEach((t) => { t.galeria.map(buscarFoto).filter(Boolean).forEach((f) => { urls.add(f.foto); urls.add(f.mini); }); });
  TEMPLOS.forEach((t) => piezasDeArte(t).forEach((p) => p.foto && urls.add(p.foto.foto)));
  for (const u of urls) { if (u && u.startsWith('img/') && !(await fetch(u)).ok) return 'falta ' + u; }
  return true;
})()`);

// Perfil (leer y actualizar)
await ev(`location.hash='#perfil'`); await espera(700);
await ev(`${poner('perfil-nombre', 'Prueba Dos')}${poner('perfil-libros', '3')}document.getElementById('form-perfil').requestSubmit()`); await espera(300);
await comprobar('Guardar perfil actualiza el nombre', `document.getElementById('usuario-nombre').textContent === 'Prueba Dos'`);
await ev(`document.querySelector('[data-templo="catedral"]').click()`);
await comprobar('Marcar iglesia visitada', `Perfiles.leer('prueba@ejemplo.com').visitadas.includes('catedral')`);

// Eliminar cuenta (borrar)
await ev(`document.getElementById('perfil-eliminar').click()`); await espera(200);
await ev(`${poner('eliminar-contrasena', 'secreto1')}document.getElementById('form-eliminar').requestSubmit()`); await espera(800);
await comprobar('Eliminar cuenta borra cuenta y perfil', `!document.getElementById('auth').hidden && !JSON.parse(localStorage['templos-merida-cuentas'] || '{}')['prueba@ejemplo.com'] && !JSON.parse(localStorage['templos-merida-perfiles'] || '{}')['prueba@ejemplo.com']`);

if (errores.length) { fallas++; console.log('FALLA Errores de JavaScript:\n  ' + errores.join('\n  ')); }
console.log(fallas ? `\nPRUEBA: ${fallas} falla(s)` : '\nPRUEBA OK');
ws.close();
salir(fallas ? 1 : 0);
