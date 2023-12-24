import { Token } from "@prisma/client";

export interface Tokens{
accessToken: string;
refreshToken: Token;


}
export interface JwtPayLoad {
    id: string;
    email: string;
    roles: string[];
}