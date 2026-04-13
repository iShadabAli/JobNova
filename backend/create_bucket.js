require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function ensureAvatarsBucket() {
    console.log('Checking for avatars bucket...');
    const { data: buckets, error: getError } = await supabase.storage.listBuckets();

    if (getError) {
        console.error('Error fetching buckets:', getError);
        return;
    }

    const hasAvatars = buckets.some(b => b.name === 'avatars');

    if (!hasAvatars) {
        console.log('Bucket "avatars" not found. Creating it...');
        const { data, error } = await supabase.storage.createBucket('avatars', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log('Bucket "avatars" created successfully!', data);
        }
    } else {
        console.log('Bucket "avatars" already exists.');

        // Ensure it is public
        const bucket = buckets.find(b => b.name === 'avatars');
        if (!bucket.public) {
            console.log('Updating bucket to be public...');
            await supabase.storage.updateBucket('avatars', { public: true });
        }
    }
}

ensureAvatarsBucket();
