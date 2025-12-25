import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  QueryParams,
  QueryParam,
  HttpCode,
  JsonController,
} from 'routing-controllers';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../types/user.dto';
import { PaginationDto } from '@/common/dto';

@JsonController('/users')
export class UserController {
  @Get('/')
  async getAll(@QueryParams() query: PaginationDto) {
    return UserService.findAll(query);
  }

  @Get('/search')
  async search(
    @QueryParam('q') q: string,
    @QueryParams() query: PaginationDto,
  ) {
    if (!q || q.trim().length < 2) {
      return {
        success: false,
        message: 'Search query must be at least 2 characters',
      };
    }
    return UserService.searchUsers(q.trim(), query);
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    return UserService.findById(id);
  }

  @Post('/')
  @HttpCode(201)
  async create(@Body() body: CreateUserDto) {
    return UserService.create(body);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return UserService.update(id, body);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return UserService.delete(id);
  }
}
