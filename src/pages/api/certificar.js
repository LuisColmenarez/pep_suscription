import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { clave, id, certificado, monto_bs, referencia, plan_inversion } = await request.json();

    if (!clave || !id || typeof certificado !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Parámetros inválidos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Verificar clave maestra
    const { data: configData, error: configError } = await supabaseAdmin
      .from('configuracion')
      .select('valor')
      .eq('clave', 'admin_master_key')
      .single();

    if (configError || !configData || clave !== configData.valor) {
      return new Response(
        JSON.stringify({ error: 'Clave maestra incorrecta. Acceso denegado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Consultar registro actual
    const { data: actual, error: fetchError } = await supabaseAdmin
      .from('inscritos')
      .select('estado_pago, monto_bs, referencia, plan_inversion')
      .eq('id', id)
      .single();

    if (fetchError || !actual) {
      return new Response(
        JSON.stringify({ error: 'No se encontró el participante.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatePayload = { certificado };

    if (certificado) {
      // Actualizar plan si se envió uno válido
      if (plan_inversion === '12_usd' || plan_inversion === '20_usd') {
        updatePayload.plan_inversion = plan_inversion;
      }

      const montoLimpio = monto_bs !== undefined && monto_bs !== null && String(monto_bs).trim() !== ''
        ? parseFloat(monto_bs)
        : null;
      const refLimpia = referencia !== undefined && referencia !== null && String(referencia).trim() !== ''
        ? String(referencia).trim()
        : null;

      updatePayload.monto_bs = montoLimpio;
      updatePayload.referencia = refLimpia;

      if (actual.estado_pago === 'pendiente' && (montoLimpio !== null || refLimpia !== null)) {
        updatePayload.estado_pago = 'pagado_movil';
      }
    }

    // 3. Guardar cambios
    const { data, error } = await supabaseAdmin
      .from('inscritos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, inscrito: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al actualizar certificación' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}