import fetch from "node-fetch";

async function run() {
  const data = {
    names: "Juan",
    paternalSurname: "Perez",
    maternalSurname: "Gomez",
    dni: "12345678",
    email: "juan@test.com",
    career: "Ingeniería de Sistemas",
    modality: "Examen Ordinario",
    lugarInscripcion: "Campus",
    gender: "Masculino",
    idioma: "Español",
    schoolType: "Estatal",
    schoolName: "Test School",
    birthDate: "2000-01-01"
  };

  const res1 = await fetch("http://127.0.0.0:3000/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  console.log("Insert 1:", res1.status, await res1.json());

  const res2 = await fetch("http://localhost:3000/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  console.log("Insert 2:", res2.status, await res2.json());
}
run();
