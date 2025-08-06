import axios from 'axios';

export class SmsService {
  static async sendSMS(phone_number: string, otp: string) {
    const data = new FormData();
    data.append('mobile_phone', phone_number);
    data.append(
      'message',
      `INBOLA - Sizning tasdiqlash kodingiz: ${otp}. Kodni hech kimga bermang!`,
    );
    data.append('from', '4546');

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.SMS_SERVICE_URL,
      headers: {
        Authorization: `Bearer ${process.env.SMS_TOKEN}`,
      },
      data: data,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return { status: 500 };
    }
  }

  //   async refreshToken(token: Token) {
  //     try {
  //       const expire = JSON.parse(atob(token.token.split(".")[1])).exp * 1000; // Convert to milliseconds
  //       const currentTime = new Date().getTime();

  //       if (expire <= currentTime) {
  //         const refresh = await axios.patch(
  //           "https://notify.eskiz.uz/api/auth/refresh",
  //           {},
  //           { headers: { Authorization: `Bearer ${token.token}` } }
  //         );

  //         return {
  //           message: "Token updated",
  //           newToken: refresh.data,
  //         };
  //       }

  //       return { message: "Token is still valid" };
  //     } catch (error) {
  //       console.error("Error refreshing token:", error);
  //       return { message: "Failed to refresh token", error: error.message };
  //     }
  //   }

  //   async getToken(loginDto: SignInDto) {
  //     try {
  //       const response = await axios.post(
  //         "https://notify.eskiz.uz/api/auth/login",
  //         loginDto
  //       );
  //       const token = response.data.data.token;

  //       await this.prisma.token.create({ data: token });
  //       return response.data;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
}
