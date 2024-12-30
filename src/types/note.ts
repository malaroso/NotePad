export type Note = {
  note_id: number;
  user_id: number;
  title: string;
  content: string;
  category_id: number | null;
  is_public: number;
  created_at: string;
  updated_at: string;
  category_name: string | null;
}; 