import { supabase } from '../../lib/supabase';

export const prerender = false;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('iglesias')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ iglesias: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const { nombre } = await request.json();
    if (!nombre || !nombre.trim()) {
      return new Response(JSON.stringify({ error: 'Nombre de iglesia requerido' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('iglesias')
      .insert([{ nombre: nombre.trim() }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Ya existe
        return new Response(JSON.stringify({ message: 'Ya existía', nombre: nombre.trim() }), { status: 200 });
      }
      throw error;
    }

    return new Response(JSON.stringify({ iglesia: data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
