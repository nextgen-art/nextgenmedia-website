import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dghlytwuslldhogqscho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaGx5dHd1c2xsZGhvZ3FzY2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDIxMTMsImV4cCI6MjA2MjMxODExM30.4SqWMfCQPdMmC_jkiCw-6VQNA2hVB38lGUxVZyDrkM4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
