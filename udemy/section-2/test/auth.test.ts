import { AuthService } from "./AuthService";

async function testAuth() {
  const service = new AuthService();
  const loginResult = await service.login("test", "Test123!");
  console.log(loginResult);
}

testAuth();
