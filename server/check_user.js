require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
    const email = 'casuriagabruno9@gmail.com';
    console.log(`Checking user: ${email}...`);

    try {
        // 1. Check Auth Users
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Error listing users:', error);
            return;
        }

        const user = users.find(u => u.email === email);

        if (user) {
            console.log('✅ User FOUND in Auth:', user.id);
            console.log('Status:', user.aud, user.confirmed_at ? 'Confirmed' : 'Unconfirmed');

            // 2. Check Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.log('❌ Profile missing or error:', profileError.message);
            } else {
                console.log('✅ Profile found:', profile);
            }
        } else {
            console.log('❌ User NOT found in Auth.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkUser();
