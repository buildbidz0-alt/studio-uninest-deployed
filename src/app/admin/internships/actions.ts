
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const uploadFile = async (supabaseAdmin: any, file: File, bucket: string): Promise<string | null> => {
    if (!file) return null;
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

export async function createInternship(formData: FormData) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { error: 'Supabase service role key is not configured.' };
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const rawFormData = {
        role: formData.get('role') as string,
        company: formData.get('company') as string,
        stipend: Number(formData.get('stipend')),
        stipend_period: formData.get('stipend_period') as string,
        location: formData.get('location') as string,
        deadline: formData.get('deadline') as string,
        image: formData.get('image') as File | null,
        details_pdf: formData.get('details_pdf') as File | null,
    };

    let imageUrl: string | null = null;
    let pdfUrl: string | null = null;

    if (rawFormData.image && rawFormData.image.size > 0) {
        imageUrl = await uploadFile(supabaseAdmin, rawFormData.image, 'internships');
        if (!imageUrl) {
            return { error: 'Failed to upload image.' };
        }
    }
    if (rawFormData.details_pdf && rawFormData.details_pdf.size > 0) {
        pdfUrl = await uploadFile(supabaseAdmin, rawFormData.details_pdf, 'internships');
        if (!pdfUrl) {
            return { error: 'Failed to upload PDF.' };
        }
    }

    const { error } = await supabaseAdmin.from('internships').insert({
      role: rawFormData.role,
      company: rawFormData.company,
      stipend: rawFormData.stipend,
      stipend_period: rawFormData.stipend_period,
      location: rawFormData.location,
      deadline: new Date(rawFormData.deadline).toISOString(),
      image_url: imageUrl,
      details_pdf_url: pdfUrl,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/internships');
    return { error: null };
}
