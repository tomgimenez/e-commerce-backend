import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, 
         IsPositive, IsString, IsUUID, MinLength 
} from 'class-validator';


export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number; 

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    rating?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    reviews?: number;

    @ApiProperty()
    @IsArray()
    @IsOptional()
    categories?: any[];

    @IsUUID()
    @IsNotEmpty()
    productTypeId: string;

    @IsObject()
    @IsNotEmpty()
    attributes: Record<string, any>;

    @IsBoolean()
    isActive: boolean;
}
