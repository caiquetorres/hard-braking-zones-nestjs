import {
  IsDefined,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

/**
 * Class that represents how environment variables should be set before
 * the application starts.
 */
export class EnvironmentVariables {
  @IsDefined({ message: 'It is required to set the "NODE_ENV"' })
  @IsString({ message: 'It is required to set a valid string value' })
  @IsIn(['test', 'development', 'production'])
  NODE_ENV: string

  @IsOptional()
  @IsNumber({}, { message: 'It is required to set a number value' })
  PORT?: number

  //#region HTTP

  @IsDefined({ message: 'It is required to set the http timeout' })
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'It is required to set a valid number value' },
  )
  HTTP_TIMEOUT: number

  //#endregion

  //#region Influx

  @IsDefined({ message: 'It is required to set the influx user' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_USER: string

  @IsDefined({ message: 'It is required to set the influx password' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_USER_PASSWORD: string

  @IsDefined({ message: 'It is required to set the influx org' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_ORG: string

  @IsDefined({ message: 'It is required to set the influx bucket' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_BUCKET: string

  @IsDefined({ message: 'It is required to set the influx measurement name' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_MEASUREMENT_NAME: string

  @IsDefined({ message: 'It is required to set the influx password' })
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'It is required to set a valid number value' },
  )
  INFLUXDB_PORT: number

  @IsDefined({ message: 'It is required to set the influx host' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_HOST: string

  @IsDefined({ message: 'It is required to set the influx url' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_URL: string

  @IsDefined({ message: 'It is required to set the influx token' })
  @IsString({ message: 'It is required to set a valid string value' })
  INFLUXDB_TOKEN: string

  @IsOptional()
  @IsString({ message: 'It is required to set a valid string value' })
  @IsIn(['http', 'https'])
  INFLUXDB_PROTOCOL?: 'http' | 'https'

  //#endregion
}
