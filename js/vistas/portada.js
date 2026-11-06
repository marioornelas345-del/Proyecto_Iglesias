/* =========================================================
   PORTADA "MÉRIDA SACRA"
   Usa los datos de TEMPLOS (definidos en index.html), así los
   contadores siempre coinciden con las iglesias que tenemos.
   ========================================================= */
(() => {
  const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Estrellas ---------- */
  /** Crea 80 estrellas con tamaño, posición y parpadeo al azar. */
  function crearEstrellas() {
    const cielo = document.getElementById("sacra-estrellas");
    const azar = (min, max) => min + Math.random() * (max - min);
    for (let i = 0; i < 80; i++) {
      const estrella = document.createElement("span");
      estrella.className = "sacra-estrella";
      estrella.style.left = azar(0, 100) + "%";
      estrella.style.top = azar(0, 100) + "%"; // 100% del contenedor = 70% del cielo
      estrella.style.setProperty("--tam", azar(1, 2.6).toFixed(1) + "px");
      estrella.style.setProperty("--duracion", azar(2, 6).toFixed(1) + "s");
      estrella.style.setProperty("--retraso", azar(0, 5).toFixed(1) + "s");
      cielo.appendChild(estrella);
    }
  }

  /* ---------- Contadores ---------- */
  /** Calcula los tres números a partir de los datos de las iglesias. */
  function calcularDatos() {
    const anioActual = new Date().getFullYear();
    const masAntiguo = Math.min(...TEMPLOS.map((t) => t.inicio));
    return {
      iglesias: TEMPLOS.length,
      desde: masAntiguo,
      siglos: Math.ceil((anioActual - masAntiguo) / 100)
    };
  }

  /** Easing "ease-out cubic": empieza rápido y frena al final. */
  const frenar = (x) => 1 - Math.pow(1 - x, 3);

  /** Sube un número de 0 a su valor en 1.6 segundos. */
  function animarNumero(elemento, valor) {
    if (menosMovimiento) { elemento.textContent = valor; return; }
    const duracion = 1600;
    const inicio = performance.now();
    function paso(ahora) {
      const avance = Math.min((ahora - inicio) / duracion, 1);
      elemento.textContent = Math.round(valor * frenar(avance));
      if (avance < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  /** Pone los contadores en 0 y los anima cuando se ven en pantalla. */
  function prepararContadores() {
    const datos = calcularDatos();
    const numeros = document.querySelectorAll("[data-contador]");
    numeros.forEach((n) => { n.textContent = "0"; });

    const observador = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      numeros.forEach((n) => animarNumero(n, datos[n.dataset.contador]));
      observador.disconnect(); // solo una vez
    }, { threshold: 0.4 });
    observador.observe(document.querySelector(".sacra-contadores"));
  }

  /* ---------- Aparición escalonada ---------- */
  function prepararRevelado() {
    const elementos = document.querySelectorAll(".sacra-revelar");
    elementos.forEach((el, i) => el.style.setProperty("--orden", i));
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        observador.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    elementos.forEach((el) => observador.observe(el));
  }

  /* ---------- Luz de vela ---------- */
  /** El resplandor sigue al cursor con suavizado (lerp 0.12 por cuadro). */
  function prepararVela() {
    const esCelular = window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;
    if (esCelular || menosMovimiento) return;

    const vela = document.getElementById("sacra-vela");
    let x = innerWidth / 2, y = innerHeight / 2; // posición actual
    let destinoX = x, destinoY = y;               // posición del cursor

    addEventListener("pointermove", (e) => {
      destinoX = e.clientX;
      destinoY = e.clientY;
      vela.classList.add("encendida");
    });
    document.addEventListener("pointerleave", () => vela.classList.remove("encendida"));

    function mover() {
      x += (destinoX - x) * 0.12;
      y += (destinoY - y) * 0.12;
      vela.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(mover);
    }
    requestAnimationFrame(mover);
  }

  crearEstrellas();
  prepararContadores();
  prepararRevelado();
  prepararVela();
})();
