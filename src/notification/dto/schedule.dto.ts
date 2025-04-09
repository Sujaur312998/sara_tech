import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleSendDto {
  @IsString()
  @IsNotEmpty()
  // @Type(() => String)
  title: string;

  @IsString()
  @IsNotEmpty()
  // @Type(() => String)
  message: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  scheduleAt: Date;
}
