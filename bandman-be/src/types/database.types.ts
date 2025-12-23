// Shared database types - Supabase schema definition
// Feature-specific entity types live in their respective feature folders

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Database {
  public: {
    Tables: {
      users: {
        Row: any;
        Insert: any;
        Update: any;
      };
      bands: {
        Row: any;
        Insert: any;
        Update: any;
      };
      band_members: {
        Row: any;
        Insert: any;
        Update: any;
      };
      songs: {
        Row: any;
        Insert: any;
        Update: any;
      };
      band_songs: {
        Row: any;
        Insert: any;
        Update: any;
      };
      sets: {
        Row: any;
        Insert: any;
        Update: any;
      };
      set_songs: {
        Row: any;
        Insert: any;
        Update: any;
      };
      gigs: {
        Row: any;
        Insert: any;
        Update: any;
      };
      sessions: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
  };
}

// Base entity interface - all entities extend this
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}
