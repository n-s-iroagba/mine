export class CodeHelper {
  static generateVerificationCode(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  static isCodeExpired(createdAt: Date, expirationMinutes: number = 15): boolean {
    const expirationTime = new Date(createdAt.getTime() + expirationMinutes * 60000);
    return new Date() > expirationTime;
  }
}