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
      plan_inversion,
      estado_pago,
      monto_bs,
      banco_emisor,
      referencia,
      fecha_pago,
      responsable_cobro
    } = body;

    if (!nombre_apellido || !telefono || !correo || !iglesia || !estado_pago || !plan_inversion) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios generales.' }), { status: 400 });
    }

    if (estado_pago === 'pagado_movil') {
      if (!monto_bs || !banco_emisor?.trim() || !referencia?.trim() || !fecha_pago) {
        return new Response(
          JSON.stringify({ error: 'Para Pago Móvil debes completar monto, banco emisor, referencia y fecha.' }),
          { status: 400 }
        );
      }
    }

    if (estado_pago === 'pagado_efectivo') {
      if (!monto_bs || !responsable_cobro?.trim()) {
        return new Response(
          JSON.stringify({ error: 'Para pago en efectivo debes indicar el monto y el nombre de quien recibió el dinero.' }),
          { status: 400 }
        );
      }
    }

    const codigo = 'PEP-' + Math.floor(100000 + Math.random() * 900000);
    const montoNumerico = estado_pago !== 'pendiente' && monto_bs ? parseFloat(monto_bs) : null;

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
          plan_inversion,
          estado_pago,
          monto_bs: montoNumerico,
          banco_emisor: estado_pago === 'pagado_movil' ? banco_emisor.trim() : null,
          referencia: estado_pago === 'pagado_movil' ? referencia.trim() : null,
          fecha_pago: estado_pago === 'pagado_movil' ? fecha_pago : null,
          responsable_cobro: estado_pago === 'pagado_efectivo' ? responsable_cobro.trim() : null
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