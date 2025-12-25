import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  QueryParams,
  HttpCode,
  JsonController,
} from 'routing-controllers';
import { SetService } from '../services';
import {
  CreateSetDto,
  UpdateSetDto,
  AddSetSongDto,
  UpdateSetSongDto,
  ReorderSetSongsDto,
} from '../types';
import { PaginationDto } from '@/common/dto';

@JsonController('/sets')
export class SetController {
  @Get('/')
  async getAll(@QueryParams() query: PaginationDto) {
    return SetService.findAll(query);
  }

  @Get('/band/:bandId')
  async getByBand(
    @Param('bandId') bandId: string,
    @QueryParams() query: PaginationDto,
  ) {
    return SetService.findByBand(bandId, query);
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    return SetService.findById(id);
  }

  @Post('/')
  @HttpCode(201)
  async create(@Body() body: CreateSetDto) {
    return SetService.create(body);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateSetDto) {
    return SetService.update(id, body);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return SetService.delete(id);
  }

  // ============ SET SONGS ============
  @Get('/:id/songs')
  async getSongs(@Param('id') id: string) {
    return SetService.getSongs(id);
  }

  @Post('/:id/songs')
  @HttpCode(201)
  async addSong(@Param('id') id: string, @Body() body: AddSetSongDto) {
    return SetService.addSong(id, body);
  }

  @Put('/:id/songs/:songId')
  async updateSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Body() body: UpdateSetSongDto,
  ) {
    return SetService.updateSong(id, songId, body);
  }

  @Put('/:id/songs/reorder')
  async reorderSongs(
    @Param('id') id: string,
    @Body() body: ReorderSetSongsDto,
  ) {
    return SetService.reorderSongs(id, body.songs);
  }

  @Delete('/:id/songs/:songId')
  async removeSong(@Param('id') id: string, @Param('songId') songId: string) {
    return SetService.removeSong(id, songId);
  }
}
