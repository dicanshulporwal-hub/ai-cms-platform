import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { MediaQueryDto } from './dto/media-query.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaService, UploadedMediaFile } from './media.service';

@ApiBearerAuth()
@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOkResponse({ type: MediaResponseDto, isArray: true })
  findAll(@Query() query: MediaQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: MediaResponseDto })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      properties: {
        altText: { type: 'string' },
        caption: { type: 'string' },
        file: { format: 'binary', type: 'string' },
        folder: { type: 'string' },
      },
      required: ['file'],
      type: 'object',
    },
  })
  @ApiCreatedResponse({ type: MediaResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body() body: UpdateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaService.upload(file, body, user);
  }

  @Put(':id')
  @ApiOkResponse({ type: MediaResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaService.update(id, updateMediaDto, user);
  }

  @Delete(':id')
  @ApiOkResponse({ type: MediaResponseDto })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaService.remove(id, user);
  }
}
