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

const PATRIMONIO = {
  catedral: {
    libros: [
      { titulo: "Libro de bautizos del Sagrario Metropolitano", fecha: "Desde 1543", detalle: "Su primera partida corresponde a Catalina de Montejo y Herrera.", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Libro de matrimonios", fecha: "Desde 1567", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Libro de defunciones", fecha: "Desde 1639", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Informaciones matrimoniales", fecha: "Desde 1755", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Libro de confirmaciones", fecha: "Desde 1830", lugar: ARCHIVO_ARQUIDIOCESIS },
      { titulo: "Índice-Resumen del Sagrario Metropolitano: Bautizos", fecha: "1965", detalle: "Publicado por la Academia Yucateca de Historia y Genealogía. Cubre de 1543 a 1667." },
      { titulo: "Índice-Resumen de los matrimonios del Sagrario de Mérida", fecha: "1971–1979", detalle: "Ocho volúmenes de la Academia Yucateca de Historia y Genealogía. Cubren de 1797 a 1900." }
    ],
    arte: {
      arte: [
        { nombre: "Inmaculada Concepción", detalle: "Pintura de 1730 atribuida a fray Miguel de Herrera, según una fuente." }
      ],
      imagenes: [
        { nombre: "Santo Cristo de las Ampollas", detalle: "Réplica tallada en Querétaro. La talla original del siglo XVII fue destruida en 1915." }
      ],
      imagineria: [
        { nombre: "Cristo de la Unidad", detalle: "Crucifijo de madera de Ramón Lapayese del Río, de unos 8 metros, sobre el altar mayor. Las fuentes lo fechan entre 1965 y 1967." }
      ],
      bienes: [
        { nombre: "Capillas históricas", detalle: "Se conservan las del Sagrario Metropolitano, el Santo Cristo de las Ampollas y el Divino Maestro." },
        { nombre: "Retablos barrocos y churriguerescos", detalle: "De los siglos XVII y XVIII. Se perdieron en 1915.", perdida: true }
      ],
      antiguedades: [
        { nombre: "Órgano Walcker", detalle: "Construido en Alemania en 1902. Se perdió en 1915.", perdida: true }
      ]
    },
    fuentes: [
      { nombre: "Archivos eclesiásticos (Enciclopedia Yucatanense)", url: "https://enciclopediayet.com/archivos-eclesiasticos/" },
      { nombre: "Catedral de San Ildefonso (Wikipedia)", url: "https://es.wikipedia.org/wiki/Catedral_de_San_Ildefonso_(M%C3%A9rida)" },
      { nombre: "Diario de Yucatán, «El Santo Cristo de las Ampollas» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/09/18/el-santo-cristo-de-las-ampollas-patrimonio-de-fe-y-arte-en-yucatan.html" }
    ]
  },

  santalucia: {
    libros: [
      { titulo: "Novena a la Gloriosa Virgen y Mártir Santa Lucía, abogada de los ojos", fecha: "1853", detalle: "De Juan Carnero, impresa en Mérida.", lugar: BIBLIOTECA_YUCATANENSE },
      { titulo: "Novena del esclarecido mártir San Lorenzo", fecha: "1881", detalle: "De Pedro C. Aldana Rivas. Está dedicada a la imagen que se veneraba en esta iglesia.", lugar: BIBLIOTECA_YUCATANENSE }
    ],
    notaLibros: "Son libros de devoción ligados al templo; no encontramos un inventario de los libros que se guardan dentro de él.",
    arte: {
      arte: [
        { nombre: "Mural del Martirio de Santa Lucía", detalle: "De Ermilo Torre Gamboa, en el muro del ábside. Es el único templo meridano con una pintura mural de gran formato en el centro de su presbiterio." },
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
    fuentes: [FUENTE_RIVERO]
  },

  jesus: {
    libros: [],
    notaLibros: "No encontramos una fuente que detalle los libros de este templo.",
    arte: {
      arte: [
        { nombre: "Murales y bóvedas pintadas", detalle: "Escenas religiosas y bíblicas, con flores pintadas al óleo en las bóvedas. Se restauraron entre 1995 y 1996." }
      ],
      antiguedades: [
        { nombre: "Retablo de la Anunciación", detalle: "Barroco, de madera con hoja de oro y probablemente del siglo XVIII. Está en el muro lateral sur." }
      ],
      imagineria: [
        { nombre: "Retablo principal", detalle: "Obra posterior del escultor Francisco Mena." }
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
      { titulo: "Novena muy útil y provechosa… por la intercesión de la admirable madre de la reina del cielo… señora Santa Ana", fecha: "1888", lugar: BIBLIOTECA_YUCATANENSE }
    ],
    notaLibros: "La parroquia figura con archivo propio en el Directorio Nacional de Archivos, pero ese registro no detalla sus libros.",
    arte: {
      arte: [
        { nombre: "Nuestra Señora de Guadalupe", detalle: "Óleo de los últimos años del Porfiriato, en un muro lateral." },
        { nombre: "Nuestra Señora del Refugio de los Pecadores", detalle: "Óleo muy repintado. El autor del estudio se pregunta si es el mismo que se veneraba a fines del siglo XIX." }
      ],
      imagenes: [
        { nombre: "María Auxiliadora", detalle: "Imagen de origen catalán." },
        { nombre: "Santa Ana con la Virgen María", detalle: "Escultura de pequeño formato en el nicho central de la fachada." }
      ],
      imagineria: [
        { nombre: "Viacrucis", detalle: "De Francisco Mena Valdez, tallado en madera. Sus catorce estaciones muestran en bajorrelieve expresiones del rostro de Cristo." },
        { nombre: "Santísima Trinidad", detalle: "Altorrelieve de Francisco Mena Valdez." },
        { nombre: "Nuestra Señora del Carmen", detalle: "Escultura de madera policromada, donada por el arzobispo Martín Tritschler y Córdova." }
      ],
      bienes: [
        { nombre: "Dos altares neogóticos", detalle: "Uno en cada capilla lateral." }
      ]
    },
    fuentes: [
      FUENTE_RIVERO,
      { nombre: "Directorio Nacional de Archivos: Yucatán", url: "https://archivos.gob.mx/DirectorioArchivos/Yucatan.html" }
    ]
  },

  santaisabel: {
    libros: [],
    notaLibros: "No encontramos una fuente que detalle los libros de esta ermita.",
    arte: {
      antiguedades: [
        { nombre: "Retablo barroco salomónico", detalle: "Una guía lo sitúa a finales del siglo XVII, en cedro rojo con hoja de oro. Esa datación no está confirmada por una fuente académica." }
      ]
    },
    fuentes: [
      { nombre: "Ermita de Santa Isabel (meridadeyucatan.com)", url: "https://www.meridadeyucatan.com/ermita-de-santa-isabel-merida-yucatan/" },
      { nombre: "Ermita de Santa Isabel (Wikipedia)", url: "https://es.wikipedia.org/wiki/Ermita_de_Santa_Isabel_(M%C3%A9rida,_Yucat%C3%A1n)" }
    ]
  },

  sancristobal: {
    libros: [],
    notaLibros: "Fue una de las cuatro parroquias históricas de Mérida, pero no encontramos un inventario público de sus libros.",
    arte: {
      arte: [
        { nombre: "Apariciones de la Virgen a Juan Diego", detalle: "Imágenes en los muros del templo." }
      ],
      imagenes: [
        { nombre: "Santos del retablo mayor", detalle: "Ocupan los nichos del retablo." }
      ],
      antiguedades: [
        { nombre: "Retablo mayor de piedra", detalle: "Neoclásico y probablemente de 1796. Su autoría se atribuye, sin confirmar, a Santiago Servian. A veces lo oculta el cortinaje del altar." }
      ]
    },
    fuentes: [
      FUENTE_RETABLOS,
      { nombre: "Historia de la iglesia de Nuestra Señora de Guadalupe (SIPSE)", url: "https://sipse.com/novedades-yucatan/yucatan-historia-iglesia-nuestra-senora-guadalupe-san-cristobal-225152.html" }
    ]
  }
};
