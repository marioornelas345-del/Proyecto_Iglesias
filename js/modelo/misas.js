/* =========================================================
   MISAS Y FIESTAS DE CADA TEMPLO
   Los horarios son los que publicó el Diario de Yucatán en 2019:
   pueden haber cambiado, por eso la vista pide confirmarlos.
   Las fiestas usan la fecha litúrgica del santo y, cuando hay,
   notas de prensa sobre cómo se celebra en el barrio.
   --------------------------------------------------------- */
const FUENTE_MISAS_2019 = { nombre: "Diario de Yucatán, «¿A qué hora hay misa en el Centro de Mérida?» (2019)", url: "https://www.yucatan.com.mx/imagen/2019/01/19/a-que-hora-hay-misa-en-el-centro-de-merida.html" };
const FECHA_HORARIOS = "enero de 2019";
const DURACION_MISA = 60; // minutos: las fuentes no dan la hora de término, se calcula aproximada

const MISAS = {
  catedral: {
    horarios: [
      { dias: "Lunes a sábado", misas: [["7:00"], ["8:15", "misa conventual"], ["9:30", "en la capilla del Divino Maestro"], ["11:15"], ["17:15"], ["18:30"]] },
      { dias: "Domingo", misas: [["7:00"], ["8:15", "misa episcopal"], ["9:00", "en inglés"], ["10:00"], ["11:00"], ["12:00"], ["13:00"], ["17:00"], ["18:30"]] }
    ],
    fiestas: [
      { fecha: "23 de enero", nombre: "San Ildefonso", motivo: "Es el santo al que está dedicada la Catedral; ese día la Iglesia celebra a San Ildefonso, arzobispo de Toledo." },
      { fecha: "14 de septiembre al 17 de octubre", nombre: "Fiesta del Santo Cristo de las Ampollas", motivo: "Es la devoción más grande de Yucatán. La imagen baja de su altar el 14 de septiembre y, a partir de finales de septiembre, llegan los gremios con sus ofrendas." },
      { fecha: "Semana Santa (fecha variable)", nombre: "Domingo de Ramos y Semana Santa", motivo: "Recuerda la entrada de Jesús en Jerusalén, su pasión y su resurrección. En 2026 la procesión de Domingo de Ramos salió de Santa Lucía hacia la Catedral." }
    ],
    fuentes: [
      FUENTE_MISAS_2019,
      { nombre: "Diario de Yucatán, «El Santo Cristo de las Ampollas» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/09/18/el-santo-cristo-de-las-ampollas-patrimonio-de-fe-y-arte-en-yucatan.html" },
      { nombre: "Diario de Yucatán, programa de Semana Santa de la Catedral (2026)", url: "https://www.yucatan.com.mx/imagen/2026/03/24/la-catedral-de-merida-da-a-conocer-su-programa-de-semana-santa-2026.html" }
    ]
  },

  santalucia: {
    horarios: [
      { dias: "Lunes a sábado", misas: [["18:00"]] },
      { dias: "Domingo", misas: [["9:00"], ["10:00"]] }
    ],
    notaHorarios: "La misma nota da también otro horario para este templo: martes a viernes 6:30 p. m., sábado 6:00 p. m. y domingo 8:50 y 11:00 a. m. Conviene confirmar cuál sigue vigente.",
    fiestas: [
      { fecha: "13 de diciembre", nombre: "Santa Lucía", motivo: "Día de la santa patrona del templo, mártir de Siracusa y patrona de la vista." },
      { fecha: "Todos los jueves", nombre: "Serenata Yucateca", motivo: "No es una celebración religiosa: es la tradicional serenata con trova y jarana que se hace en el parque, frente a la iglesia." }
    ],
    fuentes: [FUENTE_MISAS_2019]
  },

  jesus: {
    horarios: [
      { dias: "Martes a viernes", misas: [["7:30"], ["19:00"]] },
      { dias: "Sábado", texto: "Solo bodas" },
      { dias: "Domingo", misas: [["9:00"], ["10:30", "en lengua maya"], ["12:00"], ["19:00"], ["20:15"]] }
    ],
    fiestas: [
      { fecha: "Cada domingo, 10:30 a. m.", nombre: "Misa en lengua maya", motivo: "Una misa celebrada en maya yucateco, la lengua de muchas familias de la península." }
    ],
    notaFiestas: "No encontramos la fecha de una fiesta patronal propia de este templo.",
    fuentes: [FUENTE_MISAS_2019]
  },

  mejorada: {
    horarios: [
      { dias: "Lunes a viernes", misas: [["7:30"], ["19:00"]] },
      { dias: "Domingo", misas: [["9:00"], ["11:00"], ["12:00"], ["13:00"], ["19:00"]] }
    ],
    fiestas: [
      { fecha: "16 de julio", nombre: "Virgen del Carmen", motivo: "Día de Nuestra Señora del Carmen, a quien hoy está dedicada la iglesia y cuya imagen está al centro de su retablo." }
    ],
    fuentes: [FUENTE_MISAS_2019]
  },

  santiago: {
    horarios: [
      { dias: "Martes a sábado", misas: [["7:00"], ["19:00"]] },
      { dias: "Domingo", misas: [["6:00"], ["7:00"], ["8:30"], ["10:00"], ["18:00"], ["19:30"]] }
    ],
    fiestas: [
      { fecha: "25 de julio", nombre: "Santiago Apóstol", motivo: "Día del santo patrono de la parroquia. En 2026 hubo misas a las 7:00 a. m. y 6:00 p. m. y una procesión por la tarde." },
      { fecha: "26 de julio al 8 de agosto (solemnidad el 6)", nombre: "Santo Cristo de la Transfiguración", motivo: "Fiesta del Cristo Negro de Santiago. Los gremios entran al templo con charanga y voladores; el gremio La Perseverancia cumplió cien años en 2026." }
    ],
    fuentes: [
      FUENTE_MISAS_2019,
      { nombre: "Diario de Yucatán, «Es una arraigada tradición» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/07/21/es-una-arraigada-tradicion.html" },
      { nombre: "Diario de Yucatán, «Devoción fortalece tradición» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/07/30/devocion-fortalece-tradicion.html" }
    ]
  },

  santaana: {
    horarios: [
      { dias: "Martes a sábado", misas: [["9:00"], ["19:00"]] },
      { dias: "Domingo", misas: [["11:00"], ["17:00"], ["19:00"]] }
    ],
    fiestas: [
      { fecha: "26 de julio", nombre: "Santa Ana", motivo: "Día de San Joaquín y Santa Ana, padres de la Virgen María. Santa Ana es la patrona del templo y del barrio." }
    ],
    fuentes: [FUENTE_MISAS_2019]
  },

  santaisabel: {
    horarios: [
      { dias: "Jueves y sábado", misas: [["19:00"]] },
      { dias: "Domingo", misas: [["9:00"], ["10:30"], ["18:00"], ["19:00"]] }
    ],
    fiestas: [],
    notaFiestas: "La ermita está dedicada a Nuestra Señora del Buen Viaje, pero no encontramos la fecha de su fiesta.",
    fuentes: [FUENTE_MISAS_2019]
  },

  sancristobal: {
    horarios: [
      { dias: "Lunes a viernes", misas: [["7:00"], ["19:00"]] },
      { dias: "Domingo", misas: [["6:00"], ["7:30"], ["8:45"], ["18:00"], ["19:00"], ["20:00"]] }
    ],
    fiestas: [
      { fecha: "11 y 12 de diciembre (peregrinaciones desde semanas antes)", nombre: "Virgen de Guadalupe", motivo: "El templo es el santuario guadalupano de Mérida. Llegan peregrinos y antorchistas de todo el estado, hay mañanitas y misas, y se cierran calles del barrio." }
    ],
    fuentes: [
      FUENTE_MISAS_2019,
      { nombre: "Diario de Yucatán, «San Cristóbal se prepara para los festejos a la Virgen de Guadalupe» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/10/30/san-cristobal-se-prepara-para-los-festejos-a-la-virgen-de-guadalupe.html" },
      { nombre: "Por Esto, mañanitas y misas en San Cristóbal (2025)", url: "https://www.poresto.com/yucatan/merida/2025/12/10/mananitas-a-la-virgen-de-guadalupe-en-merida-horarios-de-misas-y-actividades-en-la-iglesia-de-san-cristobal.html" }
    ]
  },

  sanjuan: {
    horarios: [
      { dias: "Martes a viernes", misas: [["7:00"], ["18:00"]] },
      { dias: "Sábado", misas: [["7:00"], ["17:30"]] },
      { dias: "Domingo", misas: [["9:00"], ["13:00"], ["17:30"]] }
    ],
    fiestas: [
      { fecha: "24 de junio", nombre: "San Juan Bautista", motivo: "Día del santo patrono. Desde 1618 el cabildo de Mérida prometió celebrar cada 24 de junio una misa solemne en su ermita, en agradecimiento por el fin de una plaga de langosta." }
    ],
    fuentes: [FUENTE_MISAS_2019, FUENTE_CASTILLO]
  },

  sansebastian: {
    horarios: [
      { dias: "Lunes a sábado", misas: [["7:00"], ["19:00"]] },
      { dias: "Domingo", misas: [["7:00"], ["10:00"], ["20:00"]] }
    ],
    fiestas: [
      { fecha: "3 al 16 de agosto (solemnidad el 15)", nombre: "Virgen de la Asunción", motivo: "La gran fiesta del barrio: el 3 de agosto bajan la imagen de su nicho y, durante dos semanas, hay gremios, procesiones y vaquerías hasta la solemnidad del 15 de agosto." }
    ],
    fuentes: [
      FUENTE_MISAS_2019,
      { nombre: "Diario de Yucatán, «San Sebastián anuncia su fiesta» (2026)", url: "https://www.yucatan.com.mx/imagen/2026/06/28/san-sebastian-anuncia-su-fiesta.html" },
      { nombre: "Por Esto, fiesta de la Virgen de la Asunción en San Sebastián (2026)", url: "https://www.poresto.com/yucatan/merida/2026/7/3/barrio-de-san-sebastian-en-merida-alista-su-tradicional-fiesta-en-honor-a-la-virgen-de-la-asuncion.html" }
    ]
  }
};
