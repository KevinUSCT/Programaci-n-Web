// Información del portafolio
const portafolio = {

    presentacion:
        "Soy Kevin Tabares, estudiante de Ingeniería en Sistemas, Tengo 21 años y soy de Bogotá Colombia.",

    historialAcademico: [
        "Colegio NUESTRA SEÑORA DE FATIMA (Bachillerato)",
        "Universidad Santiago de Cali Ingeniería en Sistemas semestre:(",
        
    ],

    historialLaboral: [
        "mcdonalds"
    ]

};


// Mostrar presentación
document.getElementById("presentacion").textContent =
    portafolio.presentacion;


// Mostrar historial académico
function mostrarAcademico() {

    const lista =
        document.getElementById("historialAcademico");

    lista.innerHTML = "";

    portafolio.historialAcademico.forEach(function (estudio) {

        const elemento =
            document.createElement("li");

        elemento.className =
            "list-group-item";

        elemento.textContent =
            estudio;

        lista.appendChild(elemento);

    });

}


// Mostrar historial laboral
function mostrarLaboral() {

    const lista =
        document.getElementById("historialLaboral");

    lista.innerHTML = "";

    portafolio.historialLaboral.forEach(function (trabajo) {

        const elemento =
            document.createElement("li");

        elemento.className =
            "list-group-item";

        elemento.textContent =
            trabajo;

        lista.appendChild(elemento);

    });

}


// Mostrar información inicial
mostrarAcademico();
mostrarLaboral();


// Agregar formación académica
document
    .getElementById("btnAcademico")
    .addEventListener("click", function () {

        const input =
            document.getElementById("nuevoAcademico");

        const nuevoEstudio =
            input.value.trim();

        if (nuevoEstudio === "") {
            return;
        }

        portafolio.historialAcademico.push(
            nuevoEstudio
        );

        input.value = "";

        mostrarAcademico();

    });


// Agregar experiencia laboral
document
    .getElementById("btnLaboral")
    .addEventListener("click", function () {

        const input =
            document.getElementById("nuevoLaboral");

        const nuevoTrabajo =
            input.value.trim();

        if (nuevoTrabajo === "") {
            return;
        }

        portafolio.historialLaboral.push(
            nuevoTrabajo
        );

        input.value = "";

        mostrarLaboral();

    });