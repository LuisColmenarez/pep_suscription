import { supabase } from '../../lib/supabase';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const {
      nombre_apellido,
      telefono,
      correo,
      sirve_area,
      nombre_area,
      iglesia,
      estado_pago,
      banco_emisor,
      referencia,
      fecha_pago,
      responsable_cobro
    } = body;

    if (!nombre_apellido || !telefono || !correo || !iglesia || !estado_pago) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    // Código único de confirmación
    const codigo = 'TALLER-' + Math.floor(100000 + Math.random() * 900000);

    const { data, error } = await supabase
      .from('inscritos')
      .insert([
        {
          codigo,
          nombre_apellido,
          telefono,
          correo,
          sirve_area: Boolean(sirve_area),
          nombre_area: sirve_area ? nombre_area : null,
          iglesia,
          estado_pago,
          banco_emisor: estado_pago === 'pagado_movil' ? banco_emisor : null,
          referencia: estado_pago === 'pagado_movil' ? referencia : null,
          fecha_pago: estado_pago === 'pagado_movil' ? fecha_pago : null,
          responsable_cobro: estado_pago === 'pagado_efectivo' ? responsable_cobro : null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
