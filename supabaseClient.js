import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://lyunffzbwwgjmjcexnwr.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dW5mZnpid3dnam1qY2V4bndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTcwNTMsImV4cCI6MjA3NzY3MzA1M30.ss7NqSdTmJlGiNTWtBa3x-B8NjT4ltx7TdNNCzB46EY";        

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
