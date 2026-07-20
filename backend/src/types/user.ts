import type { ObjectId } from "mongodb";


export interface UserImage {
  data: Buffer;
  contentType: string;
}

export interface UserDocument {
  _id?: ObjectId;
  firstname: string;
  lastname: string;
  gender: string;
  image?: UserImage | null;
}

export interface UserIdParams {
  id: string;
}

export interface UserIdParams {
  id: string;
}

export interface UpdateUserBody {
  firstname?: string;
  lastname?: string;
  gender?: string;
}
