import { Gender } from "../constants/enums.js";

export interface UserParams {
  id: string;
  name: string;
  gender: Gender;
  dob: string;
  travelInterests: string[];
  profileImageUrl: string | null;
}

export class UserDto {
  constructor(params: UserParams) {
    Object.assign(this, params);
  }
}
