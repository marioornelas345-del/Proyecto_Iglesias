/* =========================================================
   VISTA · EXPORTAR REPORTES A PDF Y EXCEL (RF-09)
   Las librerías se descargan solo cuando se pide un archivo,
   así no hacen más lenta la página.
   ========================================================= */
const GestionExportar = (() => {
  const LIBRERIAS = {
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    autotable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
    xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
  };
  const cargadas = new Map();

  function cargar(url) {
    if (!cargadas.has(url)) {
      cargadas.set(url, new Promise((listo, fallo) => {
        const s = document.createElement("script");
        s.src = url;
        s.onload = listo;
        s.onerror = () => { cargadas.delete(url); fallo(new Error("No se pudo descargar la librería para exportar.")); };
        document.head.append(s);
      }));
    }
    return cargadas.get(url);
  }

  /** Convierte celdas (texto o elementos) a texto plano. */
  const texto = (c) => (c instanceof Node ? c.textContent : String(c ?? ""));
  const nombreArchivo = (reporte, ext) =>
    reporte.titulo.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() +
    "-" + new Date().toISOString().slice(0, 10) + "." + ext;

  async function pdf(reporte, iglesia) {
    await cargar(LIBRERIAS.jspdf);
    await cargar(LIBRERIAS.autotable);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: reporte.columnas.length > 4 ? "landscape" : "portrait", unit: "pt", format: "letter" });
    doc.setFontSize(10); doc.setTextColor(110);
    doc.text(iglesia || "", 40, 36);
    doc.setFontSize(16); doc.setTextColor(20);
    doc.text(reporte.titulo, 40, 58);
    doc.setFontSize(10); doc.setTextColor(90);
    doc.text(`${reporte.subtitulo || ""}   ·   Generado el ${new Date().toLocaleString("es-MX")}`, 40, 74);
    let y = 90;
    if (reporte.resumen?.length) {
      doc.text(reporte.resumen.map(([t, v]) => `${t}: ${v}`).join("    "), 40, y);
      y += 14;
    }
    const estilos = { styles: { fontSize: 9, cellPadding: 4 }, headStyles: { fillColor: [42, 47, 94] }, alternateRowStyles: { fillColor: [245, 242, 236] }, margin: { left: 40, right: 40 } };
    doc.autoTable({ startY: y, head: [reporte.columnas], body: reporte.filas.map((f) => f.map(texto)), ...estilos });
    if (reporte.extra?.filas.length) {
      const yExtra = doc.lastAutoTable.finalY + 24;
      doc.setFontSize(12); doc.setTextColor(20);
      doc.text(reporte.extra.titulo, 40, yExtra);
      doc.autoTable({ startY: yExtra + 8, head: [reporte.extra.columnas], body: reporte.extra.filas.map((f) => f.map(texto)), ...estilos });
    }
    doc.save(nombreArchivo(reporte, "pdf"));
  }

  async function excel(reporte, iglesia) {
    await cargar(LIBRERIAS.xlsx);
    const XLSX = window.XLSX;
    const filas = [
      [iglesia || ""], [reporte.titulo], [reporte.subtitulo || ""], [],
      ...(reporte.resumen?.length ? [reporte.resumen.map(([t, v]) => `${t}: ${v}`), []] : []),
      reporte.columnas, ...reporte.filas.map((f) => f.map(texto))
    ];
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.aoa_to_sheet(filas);
    hoja["!cols"] = reporte.columnas.map((c, i) => ({ wch: Math.min(60, Math.max(c.length, ...reporte.filas.map((f) => texto(f[i]).length)) + 2) }));
    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
    if (reporte.extra?.filas.length) {
      XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet([reporte.extra.columnas, ...reporte.extra.filas.map((f) => f.map(texto))]), reporte.extra.titulo.slice(0, 31));
    }
    XLSX.writeFile(libro, nombreArchivo(reporte, "xlsx"));
  }

  return { pdf, excel };
})();
