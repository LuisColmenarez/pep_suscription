import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { clave, id, certificado } = await request.json();

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

    // 1. Verificar clave maestra en tabla configuracion
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

    // 2. Actualizar el estado de certificación del inscrito
    const { data, error } = await supabaseAdmin
      .from('inscritos')
      .update({ certificado })
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