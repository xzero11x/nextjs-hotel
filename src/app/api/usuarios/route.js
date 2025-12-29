import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - List all users
export async function GET() {
    try {
        const supabase = await createServerClient()

        // Verify current user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Check if user is admin
        const { data: currentUser } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single()

        if (currentUser?.rol !== 'administrador') {
            return NextResponse.json({ error: 'Solo administradores pueden ver usuarios' }, { status: 403 })
        }

        // Get all users from custom table
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ usuarios })
    } catch (error) {
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST - Create new user
export async function POST(request) {
    try {
        const supabase = await createServerClient()

        // Verify current user is admin
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
            return NextResponse.json({ error: 'Solo administradores pueden crear usuarios' }, { status: 403 })
        }

        // Get request body
        const body = await request.json()
        const { email, password, nombre, rol, telefono } = body

        // Validate required fields
        if (!email || !password || !nombre || !rol) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        // Validate role
        const validRoles = ['administrador', 'recepcionista', 'limpieza', 'contador']
        if (!validRoles.includes(rol)) {
            return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
        }

        // Create user in Supabase Auth using admin client
        const supabaseAdmin = createAdminClient()
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
        })

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 400 })
        }

        // Create profile in usuarios table
        const { data: newUser, error: dbError } = await supabaseAdmin
            .from('usuarios')
            .insert({
                id: authData.user.id,
                email,
                nombre,
                rol,
                telefono: telefono || null,
                activo: true
            })
            .select()
            .single()

        if (dbError) {
            // Rollback: delete auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ usuario: newUser }, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
