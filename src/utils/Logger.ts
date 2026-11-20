import { LoggerService, Logger as MuTsLogger } from '@mu-ts/logger';

export abstract class Logger {
  private static logger: MuTsLogger = LoggerService.named('Router');

  private constructor() {}

  public static trace(...args: any[]): void {
    this.logger.trace(...args);
  }

  public static debug(...args: any[]): void {
    this.logger.debug(...args);
  }

  public static info(...args: any[]): void {
    this.logger.info(...args);
  }

  public static warn(...args: any[]): void {
    this.logger.warn(...args);
  }

  public static error(...args: any[]): void {
    this.logger.error(...args);
  }

  public static fatal(...args: any[]): void {
    this.logger.fatal(...args);
  }

  public static timeStart(timer: string): void {
    this.logger.start(timer);
  }

  public static timeStamp(timer: string): void {
  }

  public static timeEnd(timer: string): void {
    this.logger.stop(timer);
  }
}
