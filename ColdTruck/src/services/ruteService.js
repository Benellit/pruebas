// src/services/ruteService.js
import { conexion } from '../../conexion';

export async function fetchRute(id) {
  const res = await fetch(`${conexion}/rute/${Number(id)}`);
  if (!res.ok) throw new Error('No se pudo obtener la ruta');
  return res.json();
}


