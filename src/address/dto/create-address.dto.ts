import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La calle no puede estar vacía' })
  @MinLength(5, { message: 'La calle debe tener al menos 5 caracteres' })
  @MaxLength(150, { message: 'La calle no puede exceder 150 caracteres' })
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'El número no puede estar vacío' })
  @MaxLength(20, { message: 'El número no puede exceder 20 caracteres' })
  number: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad no puede estar vacía' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'La provincia/estado no puede estar vacío' })
  @MinLength(2, { message: 'La provincia/estado debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La provincia/estado no puede exceder 100 caracteres' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'El código postal no puede estar vacío' })
  @MaxLength(20, { message: 'El código postal no puede exceder 20 caracteres' })
  zip_code: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El país no puede exceder 100 caracteres' })
  country?: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
