import { createClient, SupabaseClient } from "@supabase/supabase-js";
import mime from "mime-types";
import { v4 as uuidv4 } from "uuid";

export const SupabaseStorageService = {
  get client(): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
    return createClient(supabaseUrl, supabaseKey);
  },

  uploadFile: async (file: Express.Multer.File) => {
    const fileName = `${uuidv4()}.${mime.extension(file.mimetype)}`;

    const { data, error } = await SupabaseStorageService.client.storage
      .from("images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    return fileName;
  },

  getSignedDownloadUrl: async (fileName: string) => {
    const { data: signedUrlData, error: signedUrlError } =
      await SupabaseStorageService.client.storage.from("images").createSignedUrl(fileName, 60 * 60);

    if (signedUrlError) throw signedUrlError;

    return signedUrlData.signedUrl;
  },
};
