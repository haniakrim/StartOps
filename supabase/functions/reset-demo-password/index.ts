import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const demoEmail = 'demo@example.com'
    const demoPassword = 'DemoPass123!'

    // Find the demo user
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const demoUser = listData?.users?.find((u: any) => u.email === demoEmail)

    if (!demoUser) {
      return new Response(JSON.stringify({ error: 'Demo user not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Update password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(demoUser.id, {
      password: demoPassword,
      email_confirm: true
    })

    if (error) {
      console.error('[reset-demo-password] Error:', error.message)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    console.log('[reset-demo-password] Password reset successfully for', demoEmail)

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo password reset successfully',
      email: demoEmail,
      password: demoPassword
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error: any) {
    console.error('[reset-demo-password] Fatal error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
