import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dghlytwuslldhogqscho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaGx5dHd1c2xsZGhvZ3FzY2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODk4OTcsImV4cCI6MjA3NjQ2NTg5N30.Hg827ikWk_wRcR2ALzi9Kh9sCDr5rQUGR9NxodKpN8I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
