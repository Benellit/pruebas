import { conexion } from '../../conexion';

export async function fetchTruck(id) {
  const res = await fetch(`${conexion}/truck/${Number(id)}`);
  if (!res.ok) throw new Error('No se pudo obtener el camión');
  return res.json();
}
