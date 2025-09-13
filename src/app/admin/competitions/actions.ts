
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

const uploadFile = async (supabaseAdmin: any, file: File, bucket: string): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    const filePath = `admin/${Date.now()}-${file.name}`;
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


export async function createCompetition(formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            prize: Number(formData.get('prize')),
            entry_fee: Number(formData.get('entry_fee')),
            deadline: formData.get('deadline') as string,
            image: formData.get('image') as File | null,
            details_pdf: formData.get('details_pdf') as File | null,
        };

        let imageUrl: string | null = null;
        let pdfUrl: string | null = null;

        if (rawFormData.image && rawFormData.image.size > 0) {
            imageUrl = await uploadFile(supabaseAdmin, rawFormData.image, 'competitions');
            if (!imageUrl) {
                return { error: 'Failed to upload banner image.' };
            }
        }
        if (rawFormData.details_pdf && rawFormData.details_pdf.size > 0) {
            pdfUrl = await uploadFile(supabaseAdmin, rawFormData.details_pdf, 'competitions');
            if (!pdfUrl) {
                return { error: 'Failed to upload details PDF.' };
            }
        }

        const { error } = await supabaseAdmin.from('competitions').insert({
          title: rawFormData.title,
          description: rawFormData.description,
          prize: rawFormData.prize,
          entry_fee: rawFormData.entry_fee,
          deadline: new Date(rawFormData.deadline).toISOString(),
          image_url: imageUrl,
          details_pdf_url: pdfUrl,
        });

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/competitions');
        revalidatePath('/workspace/competitions');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function updateCompetition(id: number, formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            prize: Number(formData.get('prize')),
            entry_fee: Number(formData.get('entry_fee')),
            deadline: formData.get('deadline') as string,
            image: formData.get('image') as File | null,
            details_pdf: formData.get('details_pdf') as File | null,
        };

        const { data: existing } = await supabaseAdmin.from('competitions').select('image_url, details_pdf_url').eq('id', id).single();
        
        let imageUrl = existing?.image_url || null;
        let pdfUrl = existing?.details_pdf_url || null;

        if (rawFormData.image && rawFormData.image.size > 0) {
            imageUrl = await uploadFile(supabaseAdmin, rawFormData.image, 'competitions');
            if (!imageUrl) return { error: 'Failed to upload banner image.' };
        }
        if (rawFormData.details_pdf && rawFormData.details_pdf.size > 0) {
            pdfUrl = await uploadFile(supabaseAdmin, rawFormData.details_pdf, 'competitions');
            if (!pdfUrl) return { error: 'Failed to upload details PDF.' };
        }

        const { error } = await supabaseAdmin.from('competitions').update({
          title: rawFormData.title,
          description: rawFormData.description,
          prize: rawFormData.prize,
          entry_fee: rawFormData.entry_fee,
          deadline: new Date(rawFormData.deadline).toISOString(),
          image_url: imageUrl,
          details_pdf_url: pdfUrl,
        }).eq('id', id);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/competitions');
        revalidatePath(`/admin/competitions/${id}/edit`);
        revalidatePath('/workspace/competitions');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteCompetition(id: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin.from('competitions').delete().eq('id', id);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath('/admin/competitions');
        revalidatePath('/workspace/competitions');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}
