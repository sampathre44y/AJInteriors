// This is a mock Supabase client for the prototype.
// To use real Supabase, install @supabase/supabase-js and replace this file.
// export const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: any) => {
      if (email === 'admin@ajinterior.com' && password === 'admin123') {
        return { data: { user: { id: '1', email } }, error: null };
      }
      return { data: null, error: new Error('Invalid credentials') };
    },
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ error: null }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://mock-storage.com/${path}` } }),
    }),
  },
};
