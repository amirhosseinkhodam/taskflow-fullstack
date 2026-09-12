import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { RATE_LIMITS, RATE_LIMIT_TTL_MS } from '../shared/const/rate-limits';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  readonly #authService: AuthService;
  constructor(authService: AuthService) {
    this.#authService = authService;
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: RATE_LIMITS.register, ttl: RATE_LIMIT_TTL_MS },
  })
  register(@Body() dto: RegisterDto) {
    return this.#authService.register(dto.email, dto.password);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: RATE_LIMITS.login, ttl: RATE_LIMIT_TTL_MS } })
  login(@Body() dto: LoginDto) {
    return this.#authService.login(dto.email, dto.password);
  }
}
