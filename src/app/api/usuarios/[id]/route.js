import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Get single user
export async function GET(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ usuario })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PATCH - Update user
export async function PATCH(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        // Verify admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (currentUser?.rol !== 'administrador') {
            return NextResponse.json({ error: 'Solo administradores pueden editar usuarios' }, { status: 403 })
        }

        const body = await request.json()
        const { nombre, rol, telefono, activo } = body

        // Update profile in usuarios table
        const { data: updated, error } = await supabase
            .from('usuarios')
            .update({
                nombre,
                rol,
                telefono,
                activo,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ usuario: updated })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// DELETE - Delete user (soft delete by deactivating)
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerClient()
        const { id } = await params

        // Verify admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (currentUser?.rol !== 'administrador') {
            return NextResponse.json({ error: 'Solo administradores pueden eliminar usuarios' }, { status: 403 })
        }

        // Prevent self-deletion
        if (id === user.id) {
            return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
        }

        // Soft delete - just deactivate
        const { error: dbError } = await supabase
            .from('usuarios')
            .update({ activo: false })
            .eq('id', id)

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        // Optionally: Delete from Supabase Auth completely
        // const supabaseAdmin = createAdminClient()
        // await supabaseAdmin.auth.admin.deleteUser(id)

        return NextResponse.json({ message: 'Usuario desactivado' })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
