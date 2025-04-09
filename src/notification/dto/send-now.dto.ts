import { IsNotEmpty, IsString } from 'class-validator';
// import { Type } from 'class-transformer';

export class SendNowDto {
  @IsString()
  @IsNotEmpty()
  // @Type(() => String)
  title: string;

  @IsString()
  @IsNotEmpty()
  // @Type(() => String)
  message: string;
}
