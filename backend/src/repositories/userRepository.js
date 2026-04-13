const { supabaseAdmin } = require('../config/supabase');

const userRepository = {
    findByUserId: async (user_id) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('user_id', user_id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    findByPhone: async (phone) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    createUser: async ({ user_id, phone, password_hash, role, first_name, last_name }) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert([{
                user_id,
                phone,
                password_hash,
                role,
                first_name,
                last_name,
                is_profile_completed: false
            }])
            .select('id, user_id, phone, role, first_name, last_name, created_at')
            .single();

        if (error) throw error;
        return data;
    },

    findById: async (id) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, user_id, phone, role, first_name, last_name, created_at, is_profile_completed')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
};

module.exports = userRepository;
