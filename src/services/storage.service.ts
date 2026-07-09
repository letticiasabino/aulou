export type UploadIntent = {
  fileName: string;
  contentType: string;
  size: number;
};

export const storageService = {
  async createUploadIntent(intent: UploadIntent) {
    return {
      ...intent,
      storagePath: `pending/${crypto.randomUUID()}-${intent.fileName}`,
      ready: false,
    };
  },
};
