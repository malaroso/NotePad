import { Note } from "./note";
import { UserDetail } from "./userDetail";

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
  TodoList: undefined;
  CategoryNotes: {
    categoryId: number;
    categoryName: string;
  };
  EditProfile: {
    currentUser: UserDetail;
  };
  ChangePassword: undefined;
  FAQ: undefined;
  About: undefined;
}; 