import { Role, User } from "@prisma/client";

export class UserResponse implements User {
    id: string;
    email: string;
    roles: Role[];


    password: string;
    banned: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(user: User) { Object.assign(this, user) }
}