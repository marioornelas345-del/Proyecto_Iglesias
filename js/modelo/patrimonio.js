/* =========================================================
   LIBROS Y ARTE SACRO DE CADA TEMPLO
   Solo incluye lo que respalda alguna fuente. Si no hay datos
   de un templo, se deja vacío en lugar de suponerlos.
   ========================================================= */
const CATEGORIAS_ARTE = [
  { clave: "arte", nombre: "Arte sacro", definicion: "Nombre general para las obras de arte relacionadas con la religión, como pinturas, esculturas y objetos religiosos." },
  { clave: "imagenes", nombre: "Imágenes religiosas", definicion: "Estatuas o representaciones de Jesucristo, la Virgen María, santos y ángeles." },
  { clave: "reliquias", nombre: "Reliquias", definicion: "Restos físicos de santos o elementos que estuvieron relacionados con ellos." },
  { clave: "reliquiarios", nombre: "Reliquiarios", definicion: "Recipientes decorados donde se guardan reliquias." },
  { clave: "antiguedades", nombre: "Antigüedades eclesiásticas", definicion: "Objetos antiguos pertenecientes a la Iglesia." },
  { clave: "bienes", nombre: "Bienes de arte sacro", definicion: "Patrimonio artístico e histórico de carácter religioso." },
  { clave: "ornamentos", nombre: "Ornamentos litúrgicos", definicion: "Objetos utilizados durante las ceremonias religiosas." },
  { clave: "imagineria", nombre: "Imaginería religiosa", definicion: "Esculturas e imágenes religiosas, especialmente las elaboradas artesanalmente." }
];

const ARCHIVO_ARQUIDIOCESIS = "Archivo de la Arquidiócesis de Yucatán";
const BIBLIOTECA_YUCATANENSE = "Biblioteca Yucatanense";

const FUENTE_RIVERO = { nombre: "Rivero Canto, «Pasado y presente de los templos de Santa Lucía Mártir y Santa Ana» (2014)", url: "https://dialnet.unirioja.es/descarga/articulo/4838414.pdf" };
const FUENTE_RETABLOS = { nombre: "Diario de Yucatán, «Tres joyas del arte sacro» (2024)", url: "https://www.yucatan.com.mx/imagen/2024/08/26/tres-joyas-del-arte-sacro-retablos-coloniales-que-sobreviven-en-merida.html" };

// Libros antiguos de dominio público que se pueden leer completos en Internet Archive
const LIBRO_CASTILLO = "https://archive.org/details/diccionariohist00castgoog";
const LIBRO_OBISPADO = "https://archive.org/details/el-obispado-de-yucatan";
const LIBRO_COGOLLUDO_2 = "https://archive.org/details/historiadeyucata02lope";
const TITULO_CASTILLO = "Diccionario histórico, biográfico y monumental de Yucatán";
const TITULO_OBISPADO = "El Obispado de Yucatán, tomo I";
const FUENTE_CASTILLO = { nombre: "Jerónimo del Castillo, «Diccionario histórico, biográfico y monumental de Yucatán» (1866)", url: LIBRO_CASTILLO };
const FUENTE_OBISPADO = { nombre: "Crescencio Carrillo y Ancona, «El Obispado de Yucatán», tomo I (1892)", url: LIBRO_OBISPADO };

// Portada real (página de título digitalizada) y PDF de cada libro que se puede leer en la página.
// Los PDF están copiados en la carpeta libros/ para que abran rápido (desde Internet Archive tardaban mucho).
const LIBROS_DIGITALES = {
  [LIBRO_CASTILLO]: { portada: "img/libro-castillo.jpg", pdf: "libros/castillo-diccionario-1866.pdf" },
  [LIBRO_OBISPADO]: { portada: "img/libro-obispado.jpg", pdf: "libros/carrillo-obispado-yucatan-1892.pdf" },
  [LIBRO_COGOLLUDO_2]: { portada: "img/libro-cogolludo.jpg", pdf: "libros/cogolludo-historia-yucatan-tomo2.pdf" }
};

const PATRIMONIO = {
  catedral: {
    libros: [
      { titulo: "Libro de bautizos del Sagrario Metropolitano", fecha: "Desde 1543", detalle: "Su primera partida corresponde a Catalina de Montejo y Herrera.", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Libro de matrimonios", fecha: "Desde 1567", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Libro de defunciones", fecha: "Desde 1639", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Informaciones matrimoniales", fecha: "Desde 1755", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Libro de confirmaciones", fecha: "Desde 1830", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Índice-Resumen del Sagrario Metropolitano: Bautizos", fecha: "1965", detalle: "Publicado por la Academia Yucateca de Historia y Genealogía. Cubre de 1543 a 1667." },
      { titulo: "Índice-Resumen de los matrimonios del Sagrario de Mérida", fecha: "1971–1979", detalle: "Ocho volúmenes de la Academia Yucateca de Historia y Genealogía. Cubren de 1797 a 1900." },
      { titulo: "La Catedral de Mérida", fecha: "2013", detalle: "De Miguel A. Bretos, publicado por Cultura Yucatán. Tiene 311 páginas." },
      { titulo: "Cathedral of Merida", fecha: "2001", detalle: "De Christian Rasmussen, Kate Howe y el presbítero Juan Lara Castro. Compañía Editorial de la Península." },
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En las páginas 164 y 165 describe el coro, el púlpito y las capillas de la Catedral.", enLinea: LIBRO_CASTILLO, pagina: 164, hoja: 169 },
      { titulo: TITULO_OBISPADO, fecha: "1892", detalle: "Del obispo Crescencio Carrillo y Ancona. Llama a la capilla del Santo Cristo de las Ampollas «verdadero santuario para todo el pueblo yucateco».", enLinea: LIBRO_OBISPADO, hoja: 26 }
    ],
    arte: {
      arte: [
        { nombre: "Inmaculada Concepción", detalle: "Pintura de 1730 atribuida a fray Miguel de Herrera, según una fuente.", fotoLocal: { foto: "img/arte-inmaculada-catedral.jpg", credito: "Diario de Yucatán, «100 joyas del arte sacro»" } },
        { nombre: "Virgen de Guadalupe", detalle: "Pintura de Miguel Cabrera.", fotoLocal: { foto: "img/arte-guadalupe-cabrera.jpg", credito: "Diario de Yucatán, «100 joyas del arte sacro»" } },
        { nombre: "Pinturas al fresco de la capilla del Cristo de las Ampollas", detalle: "En 1866, Jerónimo del Castillo escribió que el arquitecto Zápari las pintó y que era la capilla con el altar más logrado de la Catedral.", sinConfirmar: true }
      ],
      imagenes: [
        { nombre: "Santo Cristo de las Ampollas", detalle: "Según la tradición, se talló en el siglo XVII de un tronco del pueblo de Ichmul. En 1634 un incendio en su capilla dejó la madera ennegrecida y con marcas como ampollas, y de ahí su nombre. Hacia 1640 el padre Juan de la Huerta lo llevó a Hocabá, y el 16 de mayo de 1645 pasó solemnemente a la Catedral de Mérida. La talla original se destruyó el 24 de septiembre de 1915; la de hoy es una réplica tallada en Querétaro.", foto: "Mérida Yucatán México 17 oct 2013 - Procesión del Cristo en la Plaza Grande - 1.jpg", fotoLocal: { foto: "img/arte-cristo-ampollas.jpg", credito: "Yucatán Pasado Glorioso (fotografía antigua coloreada)" } }
      ],
      imagineria: [
        { nombre: "Cristo de la Unidad", detalle: "El retablo mayor se destruyó en 1915 y el presbiterio quedó vacío. El arzobispo Fernando Ruiz Solórzano pensó primero en un retablo nuevo, pero al final encargó este Cristo, que bendijo el 10 de octubre de 1967.", foto: "Altar principal Catedral de San Ildefonso.jpg", fotoLocal: { foto: "img/arte-cristo-unidad.jpg", credito: "aportada por un usuario del sitio" } }
      ],
      ornamentos: [
        { nombre: "Cáliz de la Catedral", detalle: "Pieza del patrimonio de la Catedral que hoy está bajo resguardo.", fotoLocal: { foto: "img/arte-caliz-catedral.jpg", credito: "Diario de Yucatán, «100 joyas del arte sacro»" } }
      ],
      bienes: [
        { nombre: "Capillas históricas", detalle: "Se conservan las del Sagrario Metropolitano, el Santo Cristo de las Ampollas y el Divino Maestro.", fotoLocal: { foto: "img/arte-capilla-ampollas.jpg", credito: "Catedrales e Iglesias (altar de la capilla del Cristo de las Ampollas)", licencia: "CC BY 2.0", pagina: "https://www.flickr.com/photos/12950131@N06/12493086154" } },
        { nombre: "Capilla de San José", detalle: "En 1866 estaba en el costado sur. La mandó construir el obispo fray Gonzalo de Salazar, y por muchos años allí funcionó la parroquia del Sagrario.", sinConfirmar: true }
      ],
      antiguedades: [
        { nombre: "Retablo mayor barroco", detalle: "Obra novohispana del siglo XVIII, destruida la noche del 24 de septiembre de 1915.", perdida: true },
        { nombre: "Órgano Walcker", detalle: "Construido en Alemania en 1902. Se perdió en 1915.", perdida: true },
        { nombre: "Púlpito de los cuatro evangelistas", detalle: "En 1866 era de madera pintada y descansaba sobre una nube con las cuatro cabezas que simbolizan a los evangelistas.", sinConfirmar: true }
      ]
    },
    fuentes: [
      { nombre: "Archivos eclesiásticos (Enciclopedia Yucatanense)", url: "https://enciclopediayet.com/archivos-eclesiasticos/" },
      { nombre: "Catedral de San Ildefonso (Wikipedia)", url: "https://es.wikipedia.org/wiki/Catedral_de_San_Ildefonso_(M%C3%A9rida)" },
      { nombre: "Cathedral of Mérida, Yucatán (Wikipedia en inglés)", url: "https://en.wikipedia.org/wiki/Cathedral_of_M%C3%A9rida,_Yucat%C3%A1n" },
      { nombre: "Reseña de «La Catedral de Mérida» en The Americas (Project MUSE)", url: "https://muse.jhu.edu/article/603033" },
      { nombre: "Diario de Yucatán, «El Santo Cristo de las Ampollas» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/09/18/el-santo-cristo-de-las-ampollas-patrimonio-de-fe-y-arte-en-yucatan.html" },
      { nombre: "Diario de Yucatán, «El retablo que nunca llegó a la Catedral de Mérida» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/10/18/el-retablo-que-nunca-llego-a-la-catedral-de-merida-su-maqueta-se-exhibe-en-el-mudy.html" },
      { nombre: "Catedral de San Ildefonso (Lonely Planet)", url: "https://www.lonelyplanet.com/points-of-interest/catedral-de-san-ildefonso/1159545" },
      FUENTE_CASTILLO,
      FUENTE_OBISPADO
    ]
  },

  santalucia: {
    libros: [
      { titulo: "Novena a la Gloriosa Virgen y Mártir Santa Lucía, abogada de los ojos", fecha: "1853", detalle: "De Juan Carnero, impresa en Mérida.", lugar: BIBLIOTECA_YUCATANENSE },
      { titulo: "Novena del esclarecido mártir San Lorenzo", fecha: "1881", detalle: "De Pedro C. Aldana Rivas. Está dedicada a la imagen que se veneraba en esta iglesia.", lugar: BIBLIOTECA_YUCATANENSE },
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En la página 168 cuenta que el cementerio de la parroquia del Sagrario estuvo en la ermita de Santa Lucía.", enLinea: LIBRO_CASTILLO, pagina: 168, hoja: 173 }
    ],
    notaLibros: "Son libros de devoción ligados al templo y uno que habla de él; no encontramos un inventario de los libros que se guardan dentro.",
    arte: {
      arte: [
        { nombre: "Mural del Martirio de Santa Lucía", detalle: "De Ermilo Torre Gamboa, en el muro del ábside. Es el único templo meridano con una pintura mural de gran formato en el centro de su presbiterio.", foto: "Fotografía interior de la Iglesia de Santa Lucia.jpg" },
        { nombre: "El Espíritu Santo iluminando a los apóstoles", detalle: "Óleo de Ermilo Torre Gamboa, de 2004, con los santos Pedro, Juan y Santiago el Mayor." }
      ],
      imagenes: [
        { nombre: "Santa Lucía Mártir", detalle: "Imagen patronal reconstruida por el escultor Francisco Mena Valdez." },
        { nombre: "San Lorenzo Mártir", detalle: "Imagen muy venerada, perdida durante la persecución religiosa del siglo XX.", perdida: true }
      ],
      imagineria: [
        { nombre: "Nuestra Señora del Perpetuo Socorro", detalle: "Talla de Francisco Mena Valdez." }
      ],
      ornamentos: [
        { nombre: "Comulgatorio de granito gris", detalle: "Un caso excepcional en la región yucatanense." }
      ]
    },
    fuentes: [FUENTE_RIVERO, FUENTE_CASTILLO]
  },

  jesus: {
    libros: [],
    notaLibros: "No encontramos una fuente que detalle los libros de este templo.",
    arte: {
      arte: [
        { nombre: "Murales y bóvedas pintadas", detalle: "Escenas religiosas y bíblicas, con flores pintadas al óleo en las bóvedas. Se restauraron entre 1995 y 1996.", foto: "Interior tercera orden.jpg" }
      ],
      antiguedades: [
        { nombre: "Retablo de la Anunciación", detalle: "Barroco, de madera con hoja de oro y probablemente del siglo XVIII. Está en el muro lateral sur." }
      ],
      imagineria: [
        { nombre: "Retablo principal", detalle: "Obra posterior del escultor Francisco Mena.", foto: "Mérida Yucatán Mexique 2022, L'Iglesia de Jesús - 02.jpg" }
      ]
    },
    fuentes: [
      FUENTE_RETABLOS,
      { nombre: "Iglesia de la Tercera Orden (Adopte una Obra de Arte)", url: "https://adopteunaobradearteyucatan.wordpress.com/2012/09/18/iglesia-de-la-tercera-orden-de-merida-yucatan/" }
    ]
  },

  santaana: {
    libros: [
      { titulo: "Reglamento de la venerable Cofradía del Santísimo Sacramento de la parroquia de Ntra. Sra. de Santa Ana", fecha: "1876", detalle: "De José M. Pérez.", lugar: BIBLIOTECA_YUCATANENSE },
      { titulo: "Novena muy útil y provechosa… por la intercesión de la admirable madre de la reina del cielo… señora Santa Ana", fecha: "1888", lugar: BIBLIOTECA_YUCATANENSE },
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En la página 54 cuenta que los restos del gobernador Antonio de Figueroa y Silva, que mandó construir la iglesia, están a la entrada de su puerta principal.", enLinea: LIBRO_CASTILLO, pagina: 54, hoja: 59 }
    ],
    notaLibros: "La parroquia figura con archivo propio en el Directorio Nacional de Archivos, pero ese registro no detalla sus libros.",
    arte: {
      arte: [
        { nombre: "Nuestra Señora de Guadalupe", detalle: "Óleo de los últimos años del Porfiriato, en un muro lateral." },
        { nombre: "Nuestra Señora del Refugio de los Pecadores", detalle: "Óleo muy repintado. El autor del estudio se pregunta si es el mismo que se veneraba a fines del siglo XIX." }
      ],
      imagenes: [
        { nombre: "María Auxiliadora", detalle: "Imagen de origen catalán." },
        { nombre: "Santa Ana con la Virgen María", detalle: "Escultura de pequeño formato en el nicho central de la fachada.", fotoLocal: { foto: "img/arte-santa-ana-fachada.jpg", credito: "Inri (Wikimedia Commons)", licencia: "CC0", pagina: "https://commons.wikimedia.org/wiki/File:Iglesia_del_Barrio_de_Santa_Ana,_M%C3%A9rida,_Yucat%C3%A1n_(02).JPG" } }
      ],
      imagineria: [
        { nombre: "Viacrucis", detalle: "De Francisco Mena Valdez, tallado en madera. Sus catorce estaciones muestran en bajorrelieve expresiones del rostro de Cristo." },
        { nombre: "Santísima Trinidad", detalle: "Altorrelieve de Francisco Mena Valdez." },
        { nombre: "Nuestra Señora del Carmen", detalle: "Escultura de madera policromada, donada por el arzobispo Martín Tritschler y Córdova." }
      ],
      bienes: [
        { nombre: "Dos altares neogóticos", detalle: "Uno en cada capilla lateral." },
        { nombre: "Sepultura del gobernador Figueroa y Silva", detalle: "En 1866 sus restos estaban a la entrada de la puerta principal. Él mandó construir la iglesia. Hoy su lápida, fechada en 1734, está en la fachada.", sinConfirmar: true, fotoLocal: { foto: "img/arte-sepultura-figueroa.jpg", credito: "Inri (Wikimedia Commons)", licencia: "Dominio público", pagina: "https://commons.wikimedia.org/wiki/File:Iglesia_del_Barrio_de_Santa_Ana,_M%C3%A9rida,_Yucat%C3%A1n_(03).JPG" } }
      ]
    },
    fuentes: [
      FUENTE_RIVERO,
      FUENTE_CASTILLO,
      { nombre: "Directorio Nacional de Archivos: Yucatán", url: "https://archivos.gob.mx/DirectorioArchivos/Yucatan.html" }
    ]
  },

  santaisabel: {
    libros: [
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En la página 125, en la entrada «Buenviaje, ermita del», cuenta que la fundó Gaspar González de Ledesma, que vivió como ermitaño en su sacristía, y que en 1866 dependía de San Sebastián.", enLinea: LIBRO_CASTILLO, pagina: 125, hoja: 130 },
      { titulo: TITULO_OBISPADO, fecha: "1892", detalle: "Del obispo Crescencio Carrillo y Ancona. Cuenta a la ermita entre los santuarios notables de Mérida, por Nuestra Señora del Buen Viaje.", enLinea: LIBRO_OBISPADO, hoja: 26 }
    ],
    notaLibros: "Son libros que hablan de la ermita; no encontramos un inventario de los libros que se guardan en ella.",
    arte: {
      antiguedades: [
        { nombre: "Retablo barroco salomónico", detalle: "Una guía lo sitúa a finales del siglo XVII, en cedro rojo con hoja de oro. Esa datación no está confirmada por una fuente académica." }
      ]
    },
    fuentes: [
      { nombre: "Ermita de Santa Isabel (meridadeyucatan.com)", url: "https://www.meridadeyucatan.com/ermita-de-santa-isabel-merida-yucatan/" },
      { nombre: "Ermita de Santa Isabel (Wikipedia)", url: "https://es.wikipedia.org/wiki/Ermita_de_Santa_Isabel_(M%C3%A9rida,_Yucat%C3%A1n)" },
      FUENTE_CASTILLO,
      FUENTE_OBISPADO
    ]
  },

  sancristobal: {
    libros: [
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En las páginas 231 y 232 copia la inscripción de la cúpula y describe el retablo mayor de piedra.", enLinea: LIBRO_CASTILLO, pagina: 231, hoja: 236 },
      { titulo: TITULO_OBISPADO, fecha: "1892", detalle: "Del obispo Crescencio Carrillo y Ancona. Pone al santuario de Guadalupe entre los templos que, por su hermosura, algunos llamaban «catedralicios».", enLinea: LIBRO_OBISPADO, hoja: 34 }
    ],
    notaLibros: "Fue una de las cuatro parroquias históricas de Mérida, pero no encontramos un inventario público de sus libros; estos hablan del templo.",
    arte: {
      arte: [
        { nombre: "Apariciones de la Virgen a Juan Diego", detalle: "Imágenes en los muros del templo.", fotoLocal: { foto: "img/arte-apariciones-juan-diego.jpg", credito: "aportada por un usuario del sitio" } }
      ],
      imagenes: [
        { nombre: "Santos del retablo mayor", detalle: "Ocupan los nichos del retablo." }
      ],
      antiguedades: [
        { nombre: "Retablo mayor de piedra", detalle: "Neoclásico y probablemente de 1796. En 1866 se describía tallado en piedra y de arquitectura dórica. Su autoría se atribuye, sin confirmar, a Santiago Servián, que terminó el templo. A veces lo oculta el cortinaje del altar.", fotoLocal: { foto: "img/arte-retablo-piedra-sancristobal.jpg", credito: "Diario de Yucatán, «100 joyas del arte sacro»" } },
        { nombre: "Inscripción de la cúpula", detalle: "Dice que el cura Diego Antonio de Lorra puso los cimientos el 4 de noviembre de 1756 y que el maestro de arquitectura Santiago Servián colocó la última piedra el 28 de diciembre de 1796. Jerónimo del Castillo la copió en 1866.", sinConfirmar: true }
      ]
    },
    fuentes: [
      FUENTE_RETABLOS,
      { nombre: "Historia de la iglesia de Nuestra Señora de Guadalupe (SIPSE)", url: "https://sipse.com/novedades-yucatan/yucatan-historia-iglesia-nuestra-senora-guadalupe-san-cristobal-225152.html" },
      FUENTE_CASTILLO,
      FUENTE_OBISPADO
    ]
  },

  mejorada: {
    libros: [
      { titulo: "Historia de Yucatán, tomo II", fecha: "1688 · ed. 1867", detalle: "De fray Diego López de Cogolludo. En la página 577 dice que su iglesia es «de las hermosas y bien adornadas fábricas que hay en estos reinos de la Nueva España».", enLinea: LIBRO_COGOLLUDO_2, pagina: 577, hoja: 581 },
      { titulo: TITULO_OBISPADO, fecha: "1892", detalle: "Del obispo Crescencio Carrillo y Ancona. En las páginas 400 y 412 cuenta que los franciscanos tomaron posesión el 13 de octubre de 1624 y que el obispo Alonso de Ocón la dedicó el 22 de enero de 1640.", enLinea: LIBRO_OBISPADO, pagina: 400, hoja: 423 },
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En la página 235 habla de la cruz de piedra que se guardaba en esta iglesia.", enLinea: LIBRO_CASTILLO, pagina: 235, hoja: 240 }
    ],
    notaLibros: "Son libros que hablan del templo; no encontramos un inventario de los libros que se guardan en él.",
    arte: {
      arte: [
        { nombre: "Óleo de Nuestra Señora", detalle: "En 1892, el obispo Carrillo y Ancona escribió que esta pintura, de «tres o cuatro siglos», se conservaba en el edificio de La Mejorada.", sinConfirmar: true }
      ],
      imagenes: [
        { nombre: "Virgen del Carmen", detalle: "Está al centro del retablo, según las guías del Centro Histórico.", fotoLocal: { foto: "img/arte-virgen-carmen-mejorada.jpg", credito: "aportada por un usuario del sitio" } }
      ],
      antiguedades: [
        { nombre: "Retablo", detalle: "Pequeño y muy ornamentado, con motivos vegetales." },
        { nombre: "Cruz de piedra de Cozumel", detalle: "Cogolludo recogió que los mayas de Cozumel ya la tenían antes de la conquista; Jerónimo del Castillo pensaba que no estaba probado. En 1866 estaba en la primera capilla a la izquierda de la entrada.", sinConfirmar: true }
      ]
    },
    fuentes: [
      { nombre: "Parque de La Mejorada (Wikipedia)", url: "https://es.wikipedia.org/wiki/Parque_de_La_Mejorada" },
      { nombre: "Parque de la Mejorada (Ryo)", url: "https://ryo.co/es/destinos/mexico/lugares/parque-de-la-mejorada/" },
      { nombre: "Templo y ex convento de la Mejorada (Programa Destinos México)", url: "https://programadestinosmexico.com/que-ver/arquitectura-colonial/templo-y-exconvento-de-la-mejorada-facultad-de-arquitectura-merida.html" },
      { nombre: "Diego López de Cogolludo, «Historia de Yucatán», tomo II (ed. 1867)", url: LIBRO_COGOLLUDO_2 },
      FUENTE_OBISPADO,
      FUENTE_CASTILLO
    ]
  },

  santiago: {
    libros: [
      { titulo: TITULO_OBISPADO, fecha: "1892", detalle: "Del obispo Crescencio Carrillo y Ancona. La llama la parroquia de indios más antigua de Mérida y habla de su imagen de Nuestra Señora de los Remedios y del santuario del Santo Cristo de la Transfiguración.", enLinea: LIBRO_OBISPADO, hoja: 47 }
    ],
    notaLibros: "Es un libro que habla del templo; no encontramos un inventario de los libros parroquiales que se guardan en él.",
    arte: {
      imagenes: [
        { nombre: "Santo Cristo de la Transfiguración", detalle: "Conocido como el Cristo Negro: Cristo muerto en la cruz, con tres flamas doradas sobre la cabeza y corona de espinas dorada. Está en una capilla al sur del presbiterio. Su culto ya existía en la primera mitad del siglo XVIII y su fiesta es el 6 de agosto.", fotoLocal: { foto: "img/arte-cristo-transfiguracion.jpg", credito: "aportada por un usuario del sitio" } },
        { nombre: "Nuestra Señora de los Remedios", detalle: "Pequeña imagen que se conservaba en la parroquia en 1892. El obispo Carrillo y Ancona sugirió, como simple posibilidad, que fuera la que trajo Hernán Cortés.", sinConfirmar: true }
      ],
      bienes: [
        { nombre: "Capilla anexa", detalle: "Una placa dice que ahí se celebró la primera misa en capilla de Mérida. Se reconstruyó casi por completo en 1925.", fotoLocal: { foto: "img/arte-capilla-anexa-santiago.jpg", credito: "En Yucatán (@turismoyucatan)" } }
      ]
    },
    fuentes: [
      { nombre: "Barrio de Santiago (Wikipedia)", url: "https://es.wikipedia.org/wiki/Barrio_de_Santiago_(M%C3%A9rida,_Yucat%C3%A1n)" },
      { nombre: "Diario de Yucatán, «The Transfigured Lord»", url: "https://www.yucatan.com.mx/directorio/lugares/the-black-christ-st-james-church-merida" },
      FUENTE_OBISPADO
    ]
  },

  sanjuan: {
    libros: [
      { titulo: TITULO_CASTILLO, fecha: "1866", detalle: "De Jerónimo del Castillo. En la página 71 registra que el 23 de junio de 1618 el cabildo prometió una misa solemne cada 24 de junio en la ermita de San Juan Bautista, por el fin de una plaga de langosta.", enLinea: LIBRO_CASTILLO, pagina: 71, hoja: 76 }
    ],
    notaLibros: "Es un libro que habla del templo; no encontramos un inventario de los libros que se guardan en él.",
    arte: {
      imagenes: [
        { nombre: "San Juan Bautista de la fachada", detalle: "Escultura del santo patrono en el remate ondulado, entre relieves de estuco con leones rampantes.", fotoLocal: { foto: "img/arte-sanjuan-fachada.jpg", credito: "Catedrales e Iglesias (Wikimedia Commons)", licencia: "CC BY 2.0", pagina: "https://commons.wikimedia.org/wiki/File:Templo_de_San_Juan_Bautista_(M%C3%A9rida)_Estado_de_Yucat%C3%A1n,M%C3%A9xico_05.jpg" } }
      ],
      antiguedades: [
        { nombre: "Retablo neogótico", detalle: "Está en el ábside. Es de los pocos retablos que sobrevivieron a los daños de la Revolución y tenía poleas para cubrir y descubrir las imágenes de sus nichos.", foto: "Merida Mexico 2012 Templo de San Juan Bautista - 4.jpg" }
      ]
    },
    fuentes: [
      { nombre: "Barrio de San Juan (Wikipedia)", url: "https://es.wikipedia.org/wiki/Barrio_de_San_Juan_(M%C3%A9rida,_M%C3%A9xico)" },
      { nombre: "Richard D. Perry, «San Juan Bautista de Mérida» (Colonial Mexico, 2020)", url: "https://colonialmexico.blogspot.com/2020/10/yucatan-san-juan-bautista-de-merida.html" },
      FUENTE_CASTILLO
    ]
  },

  sansebastian: {
    libros: [
      { titulo: TITULO_OBISPADO, fecha: "1892", detalle: "Del obispo Crescencio Carrillo y Ancona, que la hizo parroquia en 1889. Cuenta cómo se dividieron las parroquias de Mérida y dice que la de San Sebastián se estableció «más recientemente».", enLinea: LIBRO_OBISPADO, hoja: 26 }
    ],
    notaLibros: "Es un libro que habla del templo; no encontramos un inventario de los libros parroquiales que se guardan en él.",
    arte: {
      imagenes: [
        { nombre: "Virgen de la Asunción", detalle: "Escultura de madera tallada y policromada del siglo XVIII. Hacia 1950 se le retiró el Niño y se coronó como Virgen de la Asunción. Su fiesta es el 15 de agosto.", fotoLocal: { foto: "img/arte-asuncion-sansebastian.jpg", credito: "aportada por un usuario del sitio" } }
      ]
    },
    fuentes: [
      { nombre: "Barrio de San Sebastián (Wikipedia)", url: "https://es.wikipedia.org/wiki/Barrio_de_San_Sebasti%C3%A1n_(M%C3%A9rida,_Yucat%C3%A1n)" },
      { nombre: "Karla Martínez (INAH Yucatán), columna «Cauces del tiempo», La Jornada Maya (2025)", url: "https://centroyucatan.inah.gob.mx/Administrador/images/8707011755034015.PDF" },
      FUENTE_OBISPADO
    ]
  }
};

/* ---------------------------------------------------------
   QUÉ SIGNIFICA Y CÓMO SE HIZO CADA PIEZA DE ARTE SACRO
   Clave: "iglesia/Nombre de la pieza". El significado explica la
   advocación o el tipo de obra; "cómo se hizo" solo repite lo que
   dicen las fuentes y aclara cuando no se sabe.
   --------------------------------------------------------- */
const EXPLICACIONES = {
  "catedral/Inmaculada Concepción": {
    significado: "Representa a la Virgen María concebida sin pecado original. Suele pintarse de pie sobre la luna, con manto azul y vestido blanco.",
    creacion: "Pintura de 1730 atribuida al pintor novohispano fray Miguel de Herrera. La atribución viene de una sola fuente."
  },
  "catedral/Virgen de Guadalupe": {
    significado: "Reproduce la imagen de la Virgen que, según la tradición, se apareció a Juan Diego en el cerro del Tepeyac en 1531. Es la patrona de México.",
    creacion: "La pintó Miguel Cabrera (1695–1768), uno de los pintores más reconocidos de la Nueva España, que en 1751 estudió de cerca la imagen original del Tepeyac."
  },
  "catedral/Pinturas al fresco de la capilla del Cristo de las Ampollas": {
    significado: "Adornaban la capilla de la imagen más venerada de Yucatán, como marco para su culto.",
    creacion: "Pintura al fresco: se pinta sobre la capa de cal todavía húmeda para que el color quede dentro del muro. Según Jerónimo del Castillo (1866), su autor fue el arquitecto Zápari."
  },
  "catedral/Santo Cristo de las Ampollas": {
    significado: "Es Cristo crucificado. Sus «ampollas» recuerdan que, según la tradición, la imagen sobrevivió al fuego. Es la devoción más grande de Yucatán: su fiesta va del 14 de septiembre al 17 de octubre, con la llegada de los gremios.",
    creacion: "La original era una talla en madera hecha de un árbol de Ichmul. La actual también es de madera y se talló en Querétaro; no encontramos su autor ni su fecha."
  },
  "catedral/Cristo de la Unidad": {
    significado: "Su nombre se suele explicar como símbolo de la reconciliación entre los pueblos de herencia española y maya, aunque no encontramos una declaración oficial que lo diga.",
    creacion: "Lo talló en madera de abedul el escultor español Ramón Lapayese del Río. La figura mide unos 7.65 metros y está sobre una cruz de caoba de 12 metros; se le considera el Cristo crucificado de madera más grande bajo techo."
  },
  "catedral/Cáliz de la Catedral": {
    significado: "Es la copa en la que el sacerdote consagra el vino durante la misa; es el más importante de los vasos sagrados.",
    creacion: "No encontramos su fecha, su autor ni su material."
  },
  "catedral/Capillas históricas": {
    significado: "Las capillas laterales permiten dedicar altares a devociones propias, como la del Sagrario, donde se guarda la Eucaristía.",
    creacion: "Se construyeron adosadas a la nave de la Catedral; no encontramos la fecha de cada una."
  },
  "catedral/Capilla de San José": {
    significado: "Estaba dedicada a San José, esposo de la Virgen María y patrono de la Iglesia universal.",
    creacion: "La mandó construir, con su propio dinero, el obispo fray Gonzalo de Salazar, que antes de morir se la donó a los curas del Sagrario."
  },
  "catedral/Retablo mayor barroco": {
    significado: "Un retablo es la gran estructura detrás del altar que reúne imágenes y escenas para enseñar la fe.",
    creacion: "Era un retablo barroco novohispano del siglo XVIII; no encontramos su autor."
  },
  "catedral/Órgano Walcker": {
    significado: "El órgano acompaña el canto durante la liturgia.",
    creacion: "Lo construyó en Alemania, en 1902, la casa Walcker, una de las fábricas de órganos más conocidas de su época."
  },
  "catedral/Púlpito de los cuatro evangelistas": {
    significado: "Desde el púlpito se predicaba. Las cuatro cabezas simbolizan a los evangelistas: el hombre o ángel a Mateo, el león a Marcos, el toro a Lucas y el águila a Juan.",
    creacion: "Era de madera tallada y pintada, sobre una nube. Jerónimo del Castillo pensaba que había sido una obra primorosa cuando se hizo, pero que en 1866 se veía de mal gusto."
  },

  "santalucia/Mural del Martirio de Santa Lucía": {
    significado: "Muestra el martirio de Santa Lucía de Siracusa, joven cristiana que murió hacia el año 304 por no renunciar a su fe. Es la patrona de los ojos y de la vista.",
    creacion: "Pintura mural de gran formato hecha directamente sobre el muro del ábside por el pintor Ermilo Torre Gamboa. No encontramos su fecha."
  },
  "santalucia/El Espíritu Santo iluminando a los apóstoles": {
    significado: "Recuerda Pentecostés, cuando el Espíritu Santo descendió sobre los apóstoles en forma de lenguas de fuego.",
    creacion: "Pintura al óleo de Ermilo Torre Gamboa, hecha en 2004."
  },
  "santalucia/Santa Lucía Mártir": {
    significado: "Es la imagen patronal del templo. Santa Lucía suele representarse con la palma del martirio y con sus ojos sobre un plato, por ser patrona de la vista.",
    creacion: "La reconstruyó el escultor Francisco Mena Valdez."
  },
  "santalucia/San Lorenzo Mártir": {
    significado: "San Lorenzo, diácono de Roma martirizado en el año 258, suele llevar la parrilla en la que, según la tradición, murió.",
    creacion: "No encontramos su autor ni su material."
  },
  "santalucia/Nuestra Señora del Perpetuo Socorro": {
    significado: "Esta advocación viene de un ícono bizantino que se venera en Roma: la Virgen sostiene al Niño, que se asusta al ver a los ángeles con los instrumentos de la Pasión.",
    creacion: "Talla en madera del escultor Francisco Mena Valdez."
  },
  "santalucia/Comulgatorio de granito gris": {
    significado: "Es la baranda donde los fieles se arrodillaban para recibir la comunión.",
    creacion: "Está hecho de granito gris, un material poco común en Yucatán, donde casi todo se labraba en piedra caliza."
  },

  "jesus/Murales y bóvedas pintadas": {
    significado: "Las escenas bíblicas de muros y bóvedas servían para enseñar la historia sagrada a quienes entraban al templo.",
    creacion: "Están pintadas al óleo sobre los muros y las bóvedas, con flores decorativas. No encontramos su autor."
  },
  "jesus/Retablo de la Anunciación": {
    significado: "Representa la Anunciación: el ángel Gabriel anuncia a María que será la madre de Jesús.",
    creacion: "Es de madera tallada cubierta con hoja de oro, en estilo barroco, probablemente del siglo XVIII. Algunas fuentes dicen que vino del antiguo convento franciscano. Es uno de los pocos retablos coloniales que sobreviven en Mérida."
  },
  "jesus/Retablo principal": {
    significado: "Enmarca el altar mayor; tiene al centro a Cristo crucificado.",
    creacion: "Es una obra del siglo XX del escultor Francisco Mena, hecha después de que se perdiera el retablo antiguo."
  },

  "santaana/Nuestra Señora de Guadalupe": {
    significado: "Reproduce la imagen de la Virgen que, según la tradición, se apareció a Juan Diego en el Tepeyac en 1531. Es la patrona de México.",
    creacion: "Pintura al óleo de los últimos años del Porfiriato, a principios del siglo XX. No encontramos su autor."
  },
  "santaana/Nuestra Señora del Refugio de los Pecadores": {
    significado: "Presenta a la Virgen como refugio y amparo de quienes buscan el perdón; fue una advocación muy popular en México.",
    creacion: "Pintura al óleo muy repintada: otras manos la retocaron con los años, y por eso es difícil saber cómo era la original."
  },
  "santaana/María Auxiliadora": {
    significado: "Presenta a la Virgen como «auxilio de los cristianos». Su devoción la difundieron San Juan Bosco y los salesianos.",
    creacion: "Es una imagen hecha en Cataluña; no encontramos su autor ni su fecha."
  },
  "santaana/Santa Ana con la Virgen María": {
    significado: "Santa Ana es la madre de la Virgen María y abuela de Jesús. Es la patrona del templo y del barrio.",
    creacion: "Escultura de pequeño formato colocada en el nicho central de la fachada. No encontramos su autor."
  },
  "santaana/Viacrucis": {
    significado: "Sus catorce estaciones recorren la Pasión de Cristo, desde su condena hasta su sepultura. Los fieles las rezan sobre todo en Cuaresma.",
    creacion: "Francisco Mena Valdez lo talló en madera; en cada estación, en bajorrelieve, se ve una expresión distinta del rostro de Cristo."
  },
  "santaana/Santísima Trinidad": {
    significado: "Representa a Dios Padre, Dios Hijo y Dios Espíritu Santo: un solo Dios en tres personas.",
    creacion: "Es un altorrelieve, una escultura que sobresale mucho del fondo, obra de Francisco Mena Valdez."
  },
  "santaana/Nuestra Señora del Carmen": {
    significado: "Es la advocación de la Orden del Carmen. Se representa con el escapulario, signo de su protección.",
    creacion: "Escultura de madera policromada, es decir, pintada en varios colores. La donó el arzobispo Martín Tritschler y Córdova."
  },
  "santaana/Dos altares neogóticos": {
    significado: "El estilo neogótico imita las catedrales medievales, con arcos en punta y pináculos; estuvo de moda a fines del siglo XIX y principios del XX.",
    creacion: "Hay uno en cada capilla lateral. No encontramos su autor ni su fecha."
  },
  "santaana/Sepultura del gobernador Figueroa y Silva": {
    significado: "Enterrarse dentro de una iglesia era un honor para quienes la fundaban o la ayudaban.",
    creacion: "El gobernador Antonio de Figueroa y Silva mandó construir la iglesia. Murió en el rancho Chacal, de regreso de Bacalar, y sus restos se depositaron a la entrada de la puerta principal."
  },

  "santaisabel/Retablo barroco salomónico": {
    significado: "Sus columnas salomónicas, torcidas en espiral, recuerdan el templo de Salomón en Jerusalén y son típicas del barroco.",
    creacion: "Según una guía, es de cedro rojo con hoja de oro y de finales del siglo XVII; esa fecha no está confirmada."
  },

  "sancristobal/Apariciones de la Virgen a Juan Diego": {
    significado: "Cuentan cómo, según la tradición, la Virgen de Guadalupe se apareció a Juan Diego en el Tepeyac en 1531. El templo es un santuario guadalupano.",
    creacion: "Están en los muros del templo. No encontramos su autor, su técnica ni su fecha."
  },
  "sancristobal/Santos del retablo mayor": {
    significado: "Las imágenes de santos acompañan a la figura principal y se presentan como ejemplos de vida cristiana.",
    creacion: "Ocupan los nichos del retablo mayor de piedra. No encontramos quiénes son ni quién los hizo."
  },
  "sancristobal/Retablo mayor de piedra": {
    significado: "A diferencia de los retablos de madera dorada, éste es de piedra y de estilo neoclásico, más sobrio, como se usaba a fines del siglo XVIII.",
    creacion: "Está tallado en piedra. Jerónimo del Castillo lo describió en 1866 como de arquitectura dórica y muy recargado de adornos."
  },
  "sancristobal/Inscripción de la cúpula": {
    significado: "Es como el acta de nacimiento del templo: registra quién empezó la obra y quién la terminó.",
    creacion: "Está escrita con letras mayúsculas y la ortografía de la época; por ejemplo, dice «YGLESYA» en lugar de «iglesia»."
  },

  "mejorada/Óleo de Nuestra Señora": {
    significado: "Es una pintura de la Virgen María que el obispo Carrillo y Ancona consideraba muy antigua.",
    creacion: "Pintura al óleo. Carrillo y Ancona le dedicó su artículo «La lámpara de tres siglos». No encontramos su autor."
  },
  "mejorada/Virgen del Carmen": {
    significado: "Es la advocación de la Orden del Carmen. Se representa con el escapulario, signo de su protección.",
    creacion: "No encontramos su autor, su material ni su fecha."
  },
  "mejorada/Retablo": {
    significado: "Enmarca la imagen principal del templo, la Virgen del Carmen.",
    creacion: "Es pequeño, muy ornamentado y con motivos vegetales. No encontramos su autor ni su fecha."
  },
  "mejorada/Cruz de piedra de Cozumel": {
    significado: "La cruz es el símbolo central del cristianismo. Cogolludo la usó para sostener que los mayas ya conocían la cruz antes de la conquista.",
    creacion: "Es de piedra y tiene la figura de un crucifijo. No se sabe quién la labró."
  },

  "santiago/Santo Cristo de la Transfiguración": {
    significado: "La Transfiguración recuerda cuando Jesús mostró su gloria a tres apóstoles en un monte. Las tres flamas doradas se interpretan como símbolo de su divinidad, y su fiesta es el 6 de agosto, día de la Transfiguración.",
    creacion: "Es una imagen negra de Cristo muerto en la cruz, con la barba y el bigote esculpidos en la misma pieza. No se sabe quién la hizo ni cuándo."
  },
  "santiago/Nuestra Señora de los Remedios": {
    significado: "Fue la Virgen de los conquistadores españoles; con su nombre se llamó la primera parroquia de Yucatán.",
    creacion: "Es una imagen pequeña. No encontramos su material ni su autor."
  },
  "santiago/Capilla anexa": {
    significado: "Recuerda los primeros años de la evangelización del barrio de Santiago.",
    creacion: "Se reconstruyó casi por completo en 1925."
  },

  "sanjuan/San Juan Bautista de la fachada": {
    significado: "San Juan Bautista anunció la llegada de Jesús y lo bautizó en el río Jordán. En este barrio, además, se le pedía protección contra las plagas de langosta.",
    creacion: "Es una escultura en el remate ondulado de la fachada, entre relieves de estuco, una mezcla de cal y arena que se modela."
  },
  "sanjuan/Retablo neogótico": {
    significado: "El estilo neogótico imita las catedrales medievales, con arcos en punta y pináculos.",
    creacion: "Tenía poleas para cubrir y descubrir las imágenes de sus nichos. No encontramos su autor ni su fecha."
  },

  "sansebastian/Virgen de la Asunción": {
    significado: "Celebra que la Virgen María fue llevada en cuerpo y alma al cielo. Por eso aparece con las manos alzadas, sobre la luna y entre ángeles.",
    creacion: "Es una escultura del siglo XVIII, tallada en madera y policromada a mano, con pincel. Hacia 1950 se le retiró el Niño Jesús y se le coronó como Virgen de la Asunción."
  }
};
