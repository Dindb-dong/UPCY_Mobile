import { UPCY_API_URL } from 'react-native-dotenv';
import axios from 'axios';
import { Alert } from 'react-native';
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  setAccessToken,
} from './storage';

export default function Request() {
  const defaultRequest = async (path, body) => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    // upcy temp api url:  http://52.78.43.6:8000/
    // upcy domain: http://upcy.co.kr:8000/

    // const url = 'https://upcy.co.kr' + path;
    const baseUrl = 'https://api.sullung.site';
    const url = 'https://api.sullung.site' + path;

    let headerValue;

    if (
      accessToken === null ||
      accessToken === undefined ||
      accessToken === false
    ) {
      headerValue = 'No Auth';
    } else {
      headerValue = `Bearer ${accessToken}`;
    }

    // console.log(headerValue);

    try {
      const response = await body(url, headerValue);
      return response;
    } catch (err) {
      if (err.response === undefined) {
        // 백엔드와 통신 자체가 실패(ERR_CONNECTION_REFUSED)
        console.log(err);
        Alert.alert('ERR_CONNECTION_REFUSED' + ': ' + url);
        console.warn(url);
        throw err;
      } else if (err.response.status === 401) {
        console.log('Access Token is not valid')
        // access 토큰이 만료된 경우 또는 로그인이 필요한 기능의 경우
        // 만료된 토큰 : "Given token not valid for any token type"
        // 없는 토큰 : "자격 인증데이터(authentication credentials)가 제공되지 않았습니다."
        removeAccessToken(); // 기존 access token 삭제
        // refresh 토큰을 통해 access 토큰 재발급
        try {
          const response = await axios.post(
            `${baseUrl}/api/user/token/refresh`,
            {
              refresh: refreshToken,
            },
            {}
            // {
            //   headers: {
            //     Authorization: 'No Auth',
            //   },
            // },
          );
          if (response.status === 200) {
            setAccessToken(response.data.access);
          console.warn('new access token', response.data.access);
          headerValue = `Bearer ${response.data.access}`;
          } else {
            console.log(response);
            return;
          }
        } catch (error) {
          // refresh 토큰이 유효하지 않은 모든 경우(토큰 만료, 토큰 없음 등)
          console.error(error);
          return;
        }
        console.log('==============');
        // 새로운 access 토큰으로 API 요청 재수행
        const response = await body(url, headerValue);
        console.log('data?', response);
        return response;
      } else {
        // 백엔드와 통신 자체는 성공, status code가 정상 값 범위 외
        console.log(err);
        return err.response;
      }
    }
  };

  const get = async (path, params, headers) => {
    return await defaultRequest(path, async (url, headerValue) => {
      const response = await axios.get(url, {
        params: params,

        headers: {
          Authorization: headerValue,
          ...headers,
        },
      });
      // console.log('request test => ', response);
      return response;
    });
  };

  const post = async (path, data, headers) => {
    return await defaultRequest(path, async (url, headerValue) => {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: headerValue,
          ...headers,
        },
      });
      // console.log('headers', {
      //   Authorization: headerValue,
      //   ...headers,
      // });
      // console.log('request test => ', response);
      return response;
    });
  };

  const put = async (path, data, headers) => {
    return await defaultRequest(path, async (url, headerValue) => {
      const response = await axios.put(url, data, {
        headers: {
          Authorization: headerValue,
          ...headers,
        },
      });
      // console.log('request test => ', response);
      return response;
    });
  };

  const del = async (path, data, headers) => {
    return await defaultRequest(path, async (url, headerValue) => {
      const response = await axios.delete(url, {
        data: data,
        headers: {
          Authorization: headerValue,
          ...headers,
        },
      });
      //console.log('request test => ', response);
      return response;
    });
  };

  const patch = async (path, data, headers) => {
    return await defaultRequest(path, async (url, headerValue) => {
      const response = await axios.patch(url, data, {
        headers: {
          Authorization: headerValue,
          ...headers,
          
        },
      });
      // console.log('request test => ', response);
      return response;
    });
  };

  return { get, post, put, del, patch };
}
