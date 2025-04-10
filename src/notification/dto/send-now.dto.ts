import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';

export class SendNowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // @Type(() => String)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // @Type(() => String)
  message: string;
}
