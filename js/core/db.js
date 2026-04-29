// Supabase client — single shared instance used across the whole app
export const db = window.supabase.createClient(
  "https://rhkycxduurrshgwfembn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoa3ljeGR1dXJyc2hnd2ZlbWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjkyMDIsImV4cCI6MjA5MzA0NTIwMn0.Tu0TrserGiUrQA8gvWomIM99z0YnTFzTAw-TVYnF8wk"
);
