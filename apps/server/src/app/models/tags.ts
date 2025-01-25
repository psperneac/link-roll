export interface TagDto {
  id?: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  name: string;
  description: string;
  translations: {[key: string]: string};
  type: string;
  access: string;
}

export interface TagRef {
  id: string;
  name: string;
}
