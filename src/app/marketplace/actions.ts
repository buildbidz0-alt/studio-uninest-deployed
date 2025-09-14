
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

const uploadFile = async (supabaseAdmin: any, file: File, bucket: string, userId: string): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
}

export async function createProduct(formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to create a product.' };
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            category: formData.get('category') as string,
            location: formData.get('location') as string | null,
            total_seats: formData.has('total_seats') ? Number(formData.get('total_seats')) : null,
        };

        const imageFile = formData.get('image') as File | null;
        let imageUrl: string | null = null;
        
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            imageUrl = await uploadFile(supabaseAdmin, imageFile, 'products', user.id);
            if (!imageUrl) {
                return { error: 'Failed to upload image.' };
            }
        }

        const { data: newProduct, error } = await supabaseAdmin.from('products').insert({
          seller_id: user.id,
          name: rawFormData.name,
          description: rawFormData.description,
          price: rawFormData.price,
          category: rawFormData.category,
          image_url: imageUrl,
          location: rawFormData.location,
          total_seats: rawFormData.total_seats,
        }).select().single();

        if (error) {
            return { error: error.message };
        }
        
        if (rawFormData.category === 'Library' && rawFormData.total_seats) {
            const seatProducts = Array.from({ length: rawFormData.total_seats }, (_, i) => ({
                name: `Seat ${i + 1}`,
                category: 'Library Seat',
                price: rawFormData.price,
                seller_id: user.id,
                parent_product_id: newProduct.id,
                description: `Seat ${i+1} at ${rawFormData.name}`
            }));
            await supabaseAdmin.from('products').insert(seatProducts);
        }

        revalidatePath('/marketplace');
        revalidatePath('/vendor/products');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function updateProduct(id: number, formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to update a product.' };
    }
    
    try {
        const supabaseAdmin = getSupabaseAdmin();

        const { data: existing } = await supabaseAdmin.from('products').select('image_url, seller_id').eq('id', id).single();
        if (!existing || existing.seller_id !== user.id) {
            return { error: 'You do not have permission to edit this product.' };
        }
        
        const rawFormData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            category: formData.get('category') as string,
            location: formData.get('location') as string | null,
            total_seats: formData.has('total_seats') ? Number(formData.get('total_seats')) : null,
        };

        const imageFile = formData.get('image') as File | null;
        let imageUrl = existing.image_url || null;

        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            imageUrl = await uploadFile(supabaseAdmin, imageFile, 'products', user.id);
            if (!imageUrl) return { error: 'Failed to upload new image.' };
        }

        const { error } = await supabaseAdmin.from('products').update({
          name: rawFormData.name,
          description: rawFormData.description,
          price: rawFormData.price,
          category: rawFormData.category,
          image_url: imageUrl,
          location: rawFormData.location,
          total_seats: rawFormData.total_seats,
        }).eq('id', id);

        if (error) {
            return { error: error.message };
        }

        if (rawFormData.category === 'Library' && rawFormData.total_seats) {
             const seatProducts = Array.from({ length: rawFormData.total_seats }, (_, i) => ({
                name: `Seat ${i + 1}`,
                category: 'Library Seat',
                price: rawFormData.price,
                seller_id: user.id,
                parent_product_id: id,
                description: `Seat ${i+1} at ${rawFormData.name}`
            }));
             await supabaseAdmin.from('products').delete().eq('parent_product_id', id);
             await supabaseAdmin.from('products').insert(seatProducts);
        }

        revalidatePath('/marketplace');
        revalidatePath(`/marketplace/${id}`);
        revalidatePath('/vendor/products');
        revalidatePath(`/vendor/products/${id}/edit`);
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}
