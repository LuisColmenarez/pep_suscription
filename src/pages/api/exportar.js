import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { clave } = await request.json();

    if (!clave) {
      return new Response(
        JSON.stringify({ error: 'Debes ingresar la clave maestra.' }),
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

    // Cliente privilegiado solo en servidor para leer la tabla protegida 'configuracion'
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: configData, error: configError } = await supabaseAdmin
      .from('configuracion')
      .select('valor')
      .eq('clave', 'admin_master_key')
      .single();

    if (configError || !configData) {
      return new Response(
        JSON.stringify({ error: 'No se encontró la clave maestra en la base de datos.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (clave !== configData.valor) {
      return new Response(
        JSON.stringify({ error: 'Clave maestra incorrecta. Acceso denegado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clave válida: obtener listado completo de inscritos
    const { data, error } = await supabase
      .from('inscritos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ inscritos: data || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error al validar acceso' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}