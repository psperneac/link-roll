import { TagRef } from './tags';

export interface ItemDto {
  id?: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  name?: string;
  description?: string;
  url?: string;

  type?: string;
  access?: string;

  // on query, all tags will have id and name as they are already in DB
  // on create/update, some might have id and name but fresh ones will have only name
  tags?: TagRef[];
}
