export const environment = {
  production: false,

  // Para desarrollo local: descomenta las siguientes 3 lineas y comenta las de Railway
  // apiUrl: 'http://localhost:5000',
  // apiCima: 'http://localhost:5000/api/cima/buscar',
  // apiCimaMedicamento: 'http://localhost:5000/api/cima/medicamento'

  // Para produccion (Hetzner): descomenta las siguientes 3 lineas y comenta las de local
  apiUrl: 'https://pharma-api.ko2-oreilly.com',
  apiCima: 'https://pharma-api.ko2-oreilly.com/api/cima/buscar',
  apiCimaMedicamento: 'https://pharma-api.ko2-oreilly.com/api/cima/medicamento'
};
