import React, { useContext, useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { PURPLE } from '../styles/GlobalColor';
import Logo from '../assets/common/Logo.svg';
import { LoginContext } from './Context.tsx';
import { getAccessToken, getNickname, removeAccessToken, removeMarketUUID, removeNickname, removeRefreshToken } from './storage.js';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const { width, height } = Dimensions.get('screen');
  const [nickname, setNickname] = useState('user');
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const n_name = await getNickname();
        if (n_name) {
          setNickname(n_name);
          console.log('닉네임 존재');
        } else {
          removeAccessToken();
          removeNickname();
          removeMarketUUID();
          removeRefreshToken();
          console.log('비정상적 접근 감지');
          Alert.alert('로그인 후, 저희 업씨와 함께해주세요!')
        }
      } catch (error) {
        console.error('Error fetching nickname:', error);
      }
    };

    fetchNickname();
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // 2초 후 실행

    return () => clearTimeout(timer); // 컴포넌트가 언마운트될 때 타이머 정리
  }, []);
  const { isLogin } = useContext(LoginContext);
  return (
    <View
      style={{
        height: height,
        width: width,
        backgroundColor: PURPLE,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Logo
        color="#fff"
        width="90px"
        height="40px"
      />
      {isLogin &&
        <View style={{ flexDirection: 'row', marginTop: 60 }}>
          <Text>환영합니다 </Text>
          <Text>{nickname}님!</Text>
        </View>
      }
    </View>
  );
};

const TextStyles = StyleSheet.create({
  inText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
});

export default SplashScreen;
