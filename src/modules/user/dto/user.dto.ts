import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string="";

  @IsNotEmpty()
  @IsString()
  lastName: string="";

  @IsNotEmpty()
  @IsString()
  username: string="";

  @IsNotEmpty()
  @IsString()
  phone: string="";

  @IsNotEmpty()
  @IsEmail()
  email: string="";

  @IsNotEmpty()
  @MinLength(6)
  password: string="";

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  teamName?: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateUserDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  picture?: string;

  @IsOptional()
  teamName?: string;

  @IsOptional()
  organizationName?: string;

  @IsOptional()
  role?: string;
}
