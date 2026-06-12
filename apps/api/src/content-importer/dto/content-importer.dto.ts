import {
  ContentImportAssetStatus,
  ContentImportAssetType,
  ContentImportExtractionMode,
  ContentImportItemStatus,
  ContentImportJobStatus,
  ContentImportMode,
  ContentImportRuleMatchType,
  ContentImportSourceType,
  DetectedContentType,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

function QueryBoolean() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return value;
  });
}

export class ContentImportListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsEnum(ContentImportJobStatus)
  status?: ContentImportJobStatus;

  @IsOptional()
  @IsEnum(ContentImportSourceType)
  sourceType?: ContentImportSourceType;

  @IsOptional()
  @IsString()
  search?: string;
}

export class ContentImportItemQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsEnum(ContentImportItemStatus)
  status?: ContentImportItemStatus;

  @IsOptional()
  @IsEnum(DetectedContentType)
  detectedContentType?: DetectedContentType;

  @IsOptional()
  @IsString()
  targetModuleKey?: string;
}

export class ContentImportAssetQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsEnum(ContentImportAssetType)
  assetType?: ContentImportAssetType;

  @IsOptional()
  @IsEnum(ContentImportAssetStatus)
  status?: ContentImportAssetStatus;
}

export class ContentImportLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateContentImportJobDto {
  @IsOptional()
  @IsEnum(ContentImportSourceType)
  sourceType?: ContentImportSourceType;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceUrls?: string[];

  @IsOptional()
  @IsEnum(ContentImportExtractionMode)
  extractionMode?: ContentImportExtractionMode;

  @IsOptional()
  @IsEnum(ContentImportMode)
  importMode?: ContentImportMode;

  @IsOptional()
  @IsBoolean()
  complianceConfirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  includeImages?: boolean;

  @IsOptional()
  @IsBoolean()
  includeTables?: boolean;

  @IsOptional()
  @IsBoolean()
  includeLinks?: boolean;

  @IsOptional()
  @IsBoolean()
  respectRobots?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  maxPages?: number;

  @IsOptional()
  @IsBoolean()
  sameDomainOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  attributionRequired?: boolean;
}

export class ImportUrlDto extends CreateContentImportJobDto {}

export class ImportUrlBatchDto extends CreateContentImportJobDto {}

export class ImportSitemapDto extends ImportUrlDto {}

export class ValidateUrlDto {
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsBoolean()
  respectRobots?: boolean;
}

export class UpdateContentImportItemDto {
  @IsOptional()
  @IsEnum(DetectedContentType)
  detectedContentType?: DetectedContentType;

  @IsOptional()
  @IsString()
  targetModuleKey?: string;

  @IsOptional()
  @IsString()
  targetEntityType?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  bodyJson?: unknown;

  @IsOptional()
  fieldMappingJson?: unknown;

  @IsOptional()
  metadataJson?: unknown;

  @IsOptional()
  sourceAttributionJson?: unknown;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class UpdateContentImportAssetDto {
  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  sourceLicenseInfo?: string;

  @IsOptional()
  @IsEnum(ContentImportAssetStatus)
  status?: ContentImportAssetStatus;

  @IsOptional()
  metadataJson?: unknown;
}

export class ContentImportRuleQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  targetModuleKey?: string;
}

export class CreateContentImportRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  priority?: number;

  @IsEnum(ContentImportRuleMatchType)
  matchType!: ContentImportRuleMatchType;

  @IsString()
  @IsNotEmpty()
  matchPattern!: string;

  @IsString()
  @IsNotEmpty()
  targetModuleKey!: string;

  @IsString()
  @IsNotEmpty()
  targetEntityType!: string;

  @IsOptional()
  mappingConfigJson?: unknown;
}

export class UpdateContentImportRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsEnum(ContentImportRuleMatchType)
  matchType?: ContentImportRuleMatchType;

  @IsOptional()
  @IsString()
  matchPattern?: string;

  @IsOptional()
  @IsString()
  targetModuleKey?: string;

  @IsOptional()
  @IsString()
  targetEntityType?: string;

  @IsOptional()
  mappingConfigJson?: unknown;
}

export class ReorderContentImportRulesDto {
  @IsArray()
  rules!: { id: string; priority: number }[];
}

export class TestContentImportRuleDto {
  @IsString()
  sampleText!: string;

  @IsOptional()
  @IsString()
  sampleTitle?: string;

  @IsOptional()
  @IsString()
  sampleUrl?: string;
}
