import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserListResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List users. Requires Super Admin or Admin.' })
  @ApiOkResponse({ type: UserListResponseDto })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get user by ID. Requires Super Admin or Admin.' })
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create a new user. Requires Super Admin or Admin.' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update user. Requires Super Admin or Admin.' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Patch(':id/status')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({
    summary: 'Update user status. Requires Super Admin or Admin.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.updateStatus(id, updateUserStatusDto, user);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete user. Requires Super Admin or Admin.' })
  @ApiOkResponse({ schema: { example: { message: 'User deleted successfully.' } } })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.remove(id, user);
  }
}
