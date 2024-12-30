export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  AllNotes: undefined;
  NoteDetail: {
    noteId: number;
  };
  AddNote: {
    note?: Note;
    isEditing?: boolean;
  };
  Notifications: undefined;
}; 