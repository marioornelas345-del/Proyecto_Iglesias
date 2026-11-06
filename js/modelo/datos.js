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
    clave: "mejorada",
    lat: 20.9677, lon: -89.61591, // ubicación (OpenStreetMap)
    siglo: "XVII",
    galeria: [ // más fotos en Wikimedia Commons
      "Iglesia de Nuestra Señora del Tránsito de Mejorada, Mérida, Yucatán (01).jpg",
      "Iglesia de Nuestra Señora del Tránsito de Mejorada, Mérida, Yucatán (02).jpg",
      "Iglesia la mejorada.jpg"
    ],
    archivo: "Iglesia de Nuestra Señora del Tránsito de Mejorada, Mérida, Yucatán (01).jpg", // foto en Wikimedia Commons
    barrio: "Barrio de La Mejorada",
    tipo: "Iglesia de",
    nombre: "La Mejorada",
    subtitulo: "Antiguo convento franciscano de recolección",
    descripcion: "La empezó el encomendero Diego García de Montalvo, que la cedió a los franciscanos antes de terminarla. Hoy está dedicada a la Virgen del Carmen.",
    anio: "1621",
    nota: "iniciada en 1621",
    inicio: 1621, fin: 1640,
    construccion: "1621 – 1640",
    estilo: "Colonial (siglo XVII)",
    direccion: "Calle 50 x 59, La Mejorada",
    dato: "Su antiguo convento es hoy la Facultad de Arquitectura de la Universidad Autónoma de Yucatán.",
    corto: "La Mejorada"
  },
  {
    clave: "santiago",
    lat: 20.97013, lon: -89.62939, // ubicación (OpenStreetMap)
    siglo: "XVII",
    galeria: [ // más fotos en Wikimedia Commons
      "Iglesia de Santiago, Mérida, Yucatán.jpg",
      "Iglesia de Santiago Apóstol, Mérida, Yucatán (01).jpg",
      "Iglesia de Santiago Apóstol, Mérida, Yucatán (02).jpg",
      "Interior, Iglesia de Santiago, Mérida Yucatán. - panoramio.jpg"
    ],
    archivo: "Iglesia de Santiago, Mérida, Yucatán.jpg", // foto en Wikimedia Commons
    barrio: "Barrio de Santiago",
    tipo: "Parroquia de",
    nombre: "Santiago Apóstol",
    subtitulo: "La parroquia de indios más antigua de Mérida",
    descripcion: "Su barrio nació como pueblo de indios en las afueras de la ciudad recién fundada. La iglesia, con su espadaña, preside el Parque de Santiago.",
    anio: "1637",
    nota: "terminada en 1637",
    aproximado: true,
    inicio: 1637, fin: 1637,
    construccion: "Terminada en 1637",
    estilo: "Colonial con espadaña",
    direccion: "Calle 70 x 57 y 59, Santiago",
    dato: "Según una placa, en su capilla anexa se celebró la primera misa en capilla de Mérida.",
    corto: "Santiago"
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
    direccion: "Calle 60 x 45, Santa Ana",
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
  },
  {
    clave: "sanjuan",
    lat: 20.96268, lon: -89.62557, // ubicación (OpenStreetMap)
    siglo: "XVIII",
    galeria: [ // más fotos en Wikimedia Commons
      "Iglesia de San Juan Bautista, Merida, Yucatan, Mexico, Marzo 2021 con pajaros 01.jpg",
      "Merida Mexico 2012 Templo de San Juan Bautista - 1.jpg",
      "Templo de San Juan Bautista (Mérida) Estado de Yucatán,México interior.jpg"
    ],
    archivo: "Iglesia de San Juan Bautista, Merida, Yucatan, Mexico, Marzo 2021 con pajaros 01.jpg", // foto en Wikimedia Commons
    barrio: "Barrio de San Juan",
    tipo: "Iglesia de",
    nombre: "San Juan Bautista",
    subtitulo: "Levantada contra las plagas de langosta",
    descripcion: "Se construyó sobre una capilla anterior para pedir a San Juan Bautista protección contra las plagas de langosta. A su lado sigue el arco que marcaba el límite de la ciudad colonial.",
    anio: "1769",
    nota: "construida en 1769 y 1770",
    inicio: 1769, fin: 1770,
    construccion: "1769 – 1770",
    estilo: "Barroco (siglo XVIII)",
    direccion: "Calle 67-A x 62 y 64, San Juan",
    dato: "En su sacristía se reunían los sanjuanistas, que impulsaron la emancipación de Yucatán.",
    corto: "San Juan"
  },
  {
    clave: "sansebastian",
    lat: 20.95889, lon: -89.63209, // ubicación (OpenStreetMap)
    siglo: "XVIII",
    galeria: [ // más fotos en Wikimedia Commons
      "San Sebastián, Mérida, Yucatán.jpg",
      "Iglesia de San Sebastián, Mérida, Yucatán, México.jpg",
      "Iglesia de San Sebastián, Mérida, Yucatán (01).jpg",
      "Iglesia de San sebastián, Mérida, Yucatán. (Dentro) - panoramio.jpg"
    ],
    archivo: "San Sebastián, Mérida, Yucatán.jpg", // foto en Wikimedia Commons
    barrio: "Barrio de San Sebastián",
    tipo: "Parroquia de",
    nombre: "San Sebastián",
    subtitulo: "Nuestra Señora de la Asunción",
    descripcion: "Por mucho tiempo fue una ermita rústica. Los vecinos terminaron el templo actual en 1796, y su gran fiesta es la de la Virgen de la Asunción, en agosto.",
    anio: "1796",
    nota: "templo actual de 1796",
    inicio: 1796, fin: 1796,
    construccion: "1796",
    estilo: "Colonial (siglo XVIII)",
    direccion: "Calle 72 x 75 y 77, San Sebastián",
    dato: "En 1889 el obispo Crescencio Carrillo y Ancona la elevó a parroquia.",
    corto: "San Sebastián"
  }
];

const AÑO_INICIAL = 1561;
const AÑO_FINAL = 1796;
