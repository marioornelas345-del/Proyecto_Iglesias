/* =========================================================
   DATOS DE LOS TEMPLOS (en orden de construcción)
   inicio/fin: años para la línea de tiempo
   ========================================================= */
const TEMPLOS = [
  {
    clave: "catedral",
    lat: 20.96713, lon: -89.62254, // ubicación (OpenStreetMap)
    siglo: "XVI",
    galeria: [ // más fotos en Wikimedia Commons
      "Catedral de San Ildefonso, Mérida, Yucatán, fachada principal.jpg",
      "Catedral de San Ildefonso al atardecer..JPG",
      "Catedral de San Ildefonso de noche.JPG",
      "Catedral de Mérida, Yucatán de noche.jpg"
    ],
    archivo: "Catedral de San Ildefonso, Mérida, Yucatán, fachada principal.jpg", // foto en Wikimedia Commons
    barrio: "Centro · Plaza Grande",
    tipo: "Catedral de",
    nombre: "San Ildefonso",
    subtitulo: "Una de las catedrales más antiguas de la América continental",
    descripcion: "Preside la Plaza Grande con su fachada sobria y sus dos torres. Se levantó con las piedras de T'Hó, la ciudad maya sobre la que se fundó Mérida.",
    anio: "1561",
    nota: "iniciada en 1561",
    inicio: 1561, fin: 1598,
    construccion: "1561 – 1598",
    estilo: "Renacentista herreriano",
    direccion: "Calle 60 x 61 y 63, Centro",
    dato: "Se construyó con piedra de la antigua ciudad maya de T'Hó.",
    corto: "Catedral"
  },
  {
    clave: "santalucia",
    lat: 20.97103, lon: -89.62192, // ubicación (OpenStreetMap)
    siglo: "XVI",
    galeria: [ // más fotos en Wikimedia Commons
      "Iglesia de Santa Lucía-2.JPG",
      "Iglesia de Santa Lucía-1.JPG",
      "Iglesia de Santa Lucía, Mérida, Yucatán (01).jpg",
      "Iglesia de Santa Lucia 1.jpg"
    ],
    archivo: "Iglesia de Santa Lucía-2.JPG", // foto en Wikimedia Commons
    barrio: "Barrio de Santa Lucía",
    tipo: "Iglesia de",
    nombre: "Santa Lucía",
    subtitulo: "Espadaña colonial frente a su parque",
    descripcion: "Una iglesia sencilla, coronada por su espadaña, frente a uno de los parques con más tradición del centro.",
    anio: "S. XVI",
    nota: "construida en el siglo XVI",
    aproximado: true,
    inicio: 1575, fin: 1580, // posición aproximada en la línea de tiempo (siglo XVI)
    construccion: "Siglo XVI",
    estilo: "Colonial con espadaña",
    direccion: "Calle 60 x 55, Centro",
    dato: "Los jueves, su parque recibe la tradicional Serenata Yucateca.",
    corto: "Santa Lucía"
  },
  {
    clave: "jesus",
    lat: 20.96878, lon: -89.6224, // ubicación (OpenStreetMap)
    siglo: "XVII",
    galeria: [ // más fotos en Wikimedia Commons
      "Templo de El Jesús o de la Tercera Orden - Merida Yucatan 2012 02.jpg",
      "Iglesia del Jesús (Tercera Orden) Merida 2012.jpg",
      "Torre de la Iglesia de Jesús de la Tercera Orden, Mérida, Yucatán.jpg",
      "Interior de Rectoría El Jesús Tercera Orden, Mérida Yucatán.jpg"
    ],
    archivo: "Templo de El Jesús o de la Tercera Orden - Merida Yucatan 2012 02.jpg", // foto en Wikimedia Commons
    barrio: "Parque Hidalgo",
    tipo: "Templo de",
    nombre: "El Jesús",
    subtitulo: "Tercera Orden · obra de los jesuitas",
    descripcion: "Levantado por la Compañía de Jesús, combina el barroco con la influencia y la mano de obra indígenas.",
    anio: "1618",
    nota: "construido en 1618",
    inicio: 1618, fin: 1618,
    construccion: "1618",
    estilo: "Barroco con influencia indígena",
    direccion: "Calle 60 x 57 y 59, Centro",
    dato: "Lo construyeron los jesuitas; también se le conoce como iglesia de la Tercera Orden.",
    corto: "El Jesús"
  },
  {
    clave: "santaana",
    lat: 20.97649, lon: -89.62092, // ubicación (OpenStreetMap)
    siglo: "XVIII",
    galeria: [ // más fotos en Wikimedia Commons
      "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (01).JPG",
      "Iglesia de Santa Ana - Merida, Yucatan.jpg",
      "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (02).JPG",
      "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (03).JPG"
    ],
    archivo: "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (01).JPG", // foto en Wikimedia Commons
    barrio: "Barrio de Santa Ana",
    tipo: "Iglesia de",
    nombre: "Santa Ana",
    subtitulo: "Encargo del gobernador Figueroa y Silva",
    descripcion: "Domina el parque de su barrio, al norte del centro.",
    anio: "1729",
    nota: "iniciada en 1729",
    inicio: 1729, fin: 1733,
    construccion: "1729 – 1733",
    estilo: "Colonial (siglo XVIII)",
    direccion: "Calle 60, Parque de Santa Ana",
    dato: "La mandó construir el gobernador Antonio de Figueroa y Silva.",
    corto: "Santa Ana"
  },
  {
    clave: "santaisabel",
    lat: 20.95679, lon: -89.62963, // ubicación (OpenStreetMap)
    siglo: "XVIII",
    galeria: [ // más fotos en Wikimedia Commons
      "Ermita de Santa Isabel, Mérida, Yucatán (08).jpg",
      "Ermita de Santa Isabel, Mérida, Yucatán (07).jpg",
      "Ermita de Santa Isabel, Mérida, Yucatán (06).jpg",
      "Ermita de Santa Isabel, Mérida, Yucatán (05).jpg"
    ],
    archivo: "Ermita de Santa Isabel, Mérida, Yucatán (08).jpg", // foto en Wikimedia Commons
    barrio: "Barrio de La Ermita",
    tipo: "Ermita de",
    nombre: "Santa Isabel",
    subtitulo: "Nuestra Señora del Buen Viaje",
    descripcion: "Pequeña ermita con la fecha 1748 grabada en su cornisa, rodeada por un jardín de plantas yucatecas.",
    anio: "1748",
    nota: "fecha grabada en la cornisa",
    inicio: 1748, fin: 1748,
    construccion: "1748",
    estilo: "Colonial (siglo XVIII)",
    direccion: "Calle 66 x 77, La Ermita",
    dato: "Estaba al inicio del antiguo camino real entre Mérida y Campeche; hoy tiene un jardín de plantas yucatecas.",
    corto: "Santa Isabel"
  },
  {
    clave: "sancristobal",
    lat: 20.96115, lon: -89.61741, // ubicación (OpenStreetMap)
    siglo: "XVIII",
    galeria: [ // más fotos en Wikimedia Commons
      "Vista del Templo de San Cristobal (Santuario de Guadalupe), Mérida, Yucatán 01.jpg",
      "Iglesia de San Cristóbal Mérida 1.JPG",
      "Vista del Templo de San Cristobal (Santuario de Guadalupe), Mérida, Yucatán 02.jpg",
      "Iglesia de Nuestra Señora de Guadalupe Antes San Cristóbal, Mérida Yucatán 2022-03.jpg"
    ],
    archivo: "Vista del Templo de San Cristobal (Santuario de Guadalupe), Mérida, Yucatán 01.jpg", // foto en Wikimedia Commons
    barrio: "Barrio de San Cristóbal",
    tipo: "Parroquia de",
    nombre: "San Cristóbal",
    subtitulo: "Santuario guadalupano",
    descripcion: "Gran santuario dedicado a la Virgen de Guadalupe; su construcción tomó cuarenta años.",
    anio: "1756",
    nota: "iniciada en 1756",
    inicio: 1756, fin: 1796,
    construccion: "1756 – 1796",
    estilo: "Colonial (siglo XVIII)",
    direccion: "Calle 50 x 69, San Cristóbal",
    dato: "Fue la última iglesia construida en la provincia española de Yucatán.",
    corto: "San Cristóbal"
  }
];

const AÑO_INICIAL = 1561;
const AÑO_FINAL = 1796;
