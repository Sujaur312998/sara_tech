import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleSendDto {
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

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  scheduleAt: Date;
}
