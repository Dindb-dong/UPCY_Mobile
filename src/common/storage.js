import * as Keychain from 'react-native-keychain';
import axios from 'axios';

async function getSecureValue(key) {
  const result = await Keychain.getInternetCredentials(key);
  if (result) {
    return result.password;
  }
  return false;
}

// function setSecureValue(key, value) {
//   // second key can be a random string
//   Keychain.setInternetCredentials(key, key, value);
// }

function setSecureValue(key, value) {
  // key와 value가 존재하는지 확인 후 기본값 설정
  const username = key ;
  const password = value ;

  Keychain.setInternetCredentials(key, username, password)
    .then(() => {
      console.log("Credentials saved successfully");
    })
    .catch(error => {
      console.error("Failed to save credentials:", error);
    });
}

function removeSecureValue(key) {
  Keychain.resetInternetCredentials(key);
}

const nicknameKeyName = 'nickname';
const accessTokenKeyName = 'accessToken';
const refreshTokenKeyName = 'refreshToken';
const userRole = 'customer';
// reformer, admin 

export async function getNickname() {
  return await getSecureValue(nicknameKeyName);
}

export function setNickname(nickname) {
  const sanitizedNickname = nickname || ""; // 기본값 설정
  setSecureValue(nicknameKeyName, sanitizedNickname);
  console.log('User Nickname saved successfully');
}

export function removeNickname() {
  removeSecureValue(nicknameKeyName);
  console.log("nickname removed successfully");
}

export async function getAccessToken() {
  const token = await getSecureValue(accessTokenKeyName);
  // console.log("Access Token: ", token); 
  return token;
}

export function setAccessToken(token) {
  setSecureValue(accessTokenKeyName, token);
}

export function removeAccessToken() {
  removeSecureValue(accessTokenKeyName);
  console.log("accessToken removed successfully");
}

export async function getRefreshToken() {
  const token = await getSecureValue(refreshTokenKeyName); // refreshToken을 token으로 받아옴
  // console.log("Refresh Token: ", token);
  return token;
}

export function setRefreshToken(token) {
  setSecureValue(refreshTokenKeyName, token);
}

export function removeRefreshToken() {
  removeSecureValue(refreshTokenKeyName);
  console.log("refreshToken removed successfully");
}

export async function getUserRole() {
  const role = await getSecureValue(userRole);
  return role;
}

export function setUserRole(role) {
  const username = userRole; // key 이름
  const password = role; // 저장할 market_uuid 값
  
  Keychain.setInternetCredentials(userRole, username, password)
    .then(() => {
      console.log("userRole saved successfully");
    })
    .catch(error => {
      console.error("Failed to save userRole:", error);
    });
}

const marketUUIDKeyName = 'marketUUID';

// market_uuid 저장 함수
export function setMarketUUID(marketUUID) {
  const username = marketUUIDKeyName; // key 이름
  const password = marketUUID; // 저장할 market_uuid 값
  
  Keychain.setInternetCredentials(marketUUIDKeyName, username, password)
    .then(() => {
      console.log("Market UUID saved successfully");
    })
    .catch(error => {
      console.error("Failed to save Market UUID:", error);
    });
}

// market_uuid 불러오기 함수
export async function getMarketUUID() {
  const result = await Keychain.getInternetCredentials(marketUUIDKeyName);
  if (result) {
    console.log("Market UUID retrieved:", result.password);
    return result.password; // password 필드에 market_uuid 값이 저장됨
  }
  console.log("Market UUID not found");
  return null;
}

// market_uuid 삭제 함수
export function removeMarketUUID() {
  Keychain.resetInternetCredentials(marketUUIDKeyName)
    .then(() => {
      console.log("Market UUID removed successfully");
    })
    .catch(error => {
      console.error("Failed to remove Market UUID:", error);
    });
}

// market_uuid 사용법: 
// setMarketUUID(response?.data.market_uuid);

// const fetchedMarketUUID = await getMarketUUID();
// console.log("Fetched Market UUID:", fetchedMarketUUID);
// fe779c3c-a4aa-4b80-8765-a7a561c71465