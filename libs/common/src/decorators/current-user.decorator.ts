import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { JwtPayLoad } from "src/auth/interfaces";

export const CurrentUser = createParamDecorator((key: keyof JwtPayLoad, ctx: ExecutionContext): JwtPayLoad | Partial<JwtPayLoad> => {

    const request = ctx.switchToHttp().getRequest();

    return key ? request.user[key] : request.user
})