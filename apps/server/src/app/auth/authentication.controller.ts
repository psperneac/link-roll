import {
  Body,
  ClassSerializerInterceptor,
  Controller, Get, HttpCode, HttpStatus, Post, Req, Res,
  SerializeOptions,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { Response } from 'express';
import { AllExceptionsFilter } from '../utils/all-exceptions.filter';
import { HeaderApiKeyGuard, LocalAuthenticationGuard, LoggedIn } from './authentication.guards';
import { RegisterDto, RequestWithUser } from './authentication.module';
import { AuthenticationService } from './authentication.service';


@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(AllExceptionsFilter)
@SerializeOptions({
  strategy: 'excludeAll',
})
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Verifies auth token and returns current user
   * @param request
   * @param response contains logged-in user if login ok or error if login not ok
   */
  @UseGuards(LoggedIn)
  @Get()
  authenticate(@Req() request: RequestWithUser, @Res() response: Response) {
    const user = request.user;
    user.password = undefined;
    return response.status(HttpStatus.OK).send({ ...user });
  }

  /**
   * Registers a new user in the system
   * @param registrationData details of the new user
   * @param response newly registered user details or error
   */
  @Post('register')
  async register(@Body() registrationData: RegisterDto, @Res() response: Response) {
    const created = await this.authenticationService.register(registrationData);
    return response.status(HttpStatus.CREATED).send({ ...created });
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const auth = this.authenticationService.getAuthorizationBearer(user.id);
    user.password = undefined;
    return response
      .status(HttpStatus.OK)
      .send({ ...user, ...auth });
  }

  @HttpCode(200)
  @UseGuards(HeaderApiKeyGuard)
  @Post('login-apikey')
  async logInApiKey(@Req() request: RequestWithUser, @Res() response: Response) {
    const apiKey = request.headers['apikey'] as string;
    console.log('controller.apikey', apiKey);
    const key = await this.authenticationService.getApiKeyByApiKeyInternal(apiKey);
    console.log('controller.key', key);
    const user = await this.authenticationService.getAuthenticatedUserForApiKey(key);
    console.log('controller.user', user);

    const auth = this.authenticationService.getAuthorizationBearer(user.id);
    console.log('controller.auth', auth);
    user.password = undefined;
    return response
      .status(HttpStatus.OK)
      .send({ ...user, ...auth });
  }

  // @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  @HttpCode(200)
  // @UseGuards(LoggedIn) -- logout should be allowed even if not logged in
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    // we have no way to currently un-authenticate tokens already sent out
    // app is stateless / session less, so this doesn't do anything
    // TODO: find way to un-authenticate tokens already sent out and remove them from server
    return response.send(JSON.stringify({ ok: true }));
  }
}
