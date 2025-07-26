// src/services/userService.js
import { conexion } from '../../conexion';
export async function fetchUser(id) {
  const res = await fetch(`${conexion}/user/${id}`);
  if (!res.ok) throw new Error('No se pudo obtener el usuario');
  return res.json();
}
