// src/services/cargoTypeService.js
import { conexion } from '../../conexion';

export async function fetchCargoType(id) {
  const res = await fetch(`${conexion}/cargoType/${Number(id)}`);
  if (!res.ok) throw new Error('No se pudo obtener el tipo de carga');
  return res.json();
}

