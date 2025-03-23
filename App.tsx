import React, { useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import HomeScreen from './src/pages/Home';
import MyPageScreen from './src/pages/MyPage';
import OrderManagement from './src/components/Home/Order/OrderManagement';

import useLoginGuard from './src/hooks/useLoginGuard';
import HomeIcon from './src/assets/navbar/Home.svg';
import MyPageIcon from './src/assets/navbar/MyPage.svg';
import OrderManagementIcon from './src/assets/navbar/OrderManagement.svg';
import SignIn from './src/components/Auth/SignIn';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomBarProvider, useBottomBar } from './contexts/BottomBarContext';
import { LoginContext, LoginProvider, UserProvider } from './src/common/Context';
import SplashScreen from './src/common/SplashScreen';

import { getUserRole } from './src/common/storage';

export type StackProps = {
  Main: undefined;
  Signin: undefined;
};

const AppStack = createNativeStackNavigator<StackProps>(); // 최상위 스택. SignInStack에는 바텀바 안 뜸.

const GlobalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

export type TabProps = {
  UPCY: undefined;
  MY: undefined;
  주문관리: undefined;
};

const CustomTab = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const loginGuard = useLoginGuard();
  const { isVisible } = useBottomBar(); // 바텀바 보임/숨김 상태를 가져옴.

  if (!isVisible) {
    return null; // isVisible이 false일 경우 탭바를 렌더링하지 않음.
  }

  return (
    <View
      style={{
        height: 86,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
      }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index; // 한 번 더 눌렀을 때
        // TODO: 여기 부분 수정하면 같은 탭 또 안 눌러도 될듯?
        const onPress = () => {
          if (isFocused) {
            navigation.reset({
              routes: [{ name: route.name }],
            });
          } else {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={route.name === 'MY' ? loginGuard(onPress) : onPress}
            style={{
              width: '20%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {
              {
                UPCY: (
                  <HomeIcon color="#000000" opacity={isFocused ? 1 : 0.4} />
                ),
                주문관리: (
                  <OrderManagementIcon
                    color="#000000"
                    opacity={isFocused ? 1 : 0.4}
                  />
                ),
                MY: (
                  <MyPageIcon color="#000000" opacity={isFocused ? 1 : 0.4} />
                ),
              }[route.name]
            }

            <Text
              style={{
                color: '#000000',
                opacity: isFocused ? 1 : 0.4,
                marginVertical: 5,
                fontSize: 12,
              }}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Tab = createBottomTabNavigator<TabProps>();

// 하단 탭 네비게이터 정의
const MainTabNavigator = () => {
  const [userInfo, setUserInfo] = useState<string>('customer');
  const { isLogin } = useContext(LoginContext);
  useEffect(() => {
    const getUserRoleInfo = async () => {
      if (isLogin) {
        const userRole = await getUserRole();
        console.log('유저롤을 설정합니다:', userRole);
        setUserInfo(userRole || 'customer');
      } else {
        setUserInfo('customer'); // 로그인하지 않은 경우 기본값
      }
    };

    getUserRoleInfo();
  }, [isLogin]); // isLogin 변경 시 동작

  // userInfo가 null인 상태에서는 로딩 UI를 표시
  if (userInfo === null) {
    return null; // 혹은 로딩 스피너를 렌더링
  }

  return (
    <Tab.Navigator
      tabBar={props => <CustomTab {...props} />}
      initialRouteName="UPCY"
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="UPCY" component={HomeScreen} />
      {isLogin && userInfo === 'reformer' && (
        <Tab.Screen name="주문관리" component={OrderManagement} />
      )}
      <Tab.Screen name="MY" component={MyPageScreen} />
    </Tab.Navigator>
  );
};


function App(): React.JSX.Element {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  const finishSplash = () => {
    console.log('finished');
    setIsSplashFinished(true);
  };

  return (
    <BottomBarProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LoginProvider>
          <NavigationContainer theme={GlobalTheme}>
            {!isSplashFinished ? (
              <SplashScreen onFinish={finishSplash} />
            ) : (
              <UserProvider>
                <AppStack.Navigator screenOptions={{ headerShown: false }}>
                  <AppStack.Screen name="Main" component={MainTabNavigator} />
                  <AppStack.Screen name="Signin" component={SignIn} />
                </AppStack.Navigator>
              </UserProvider>
            )}
          </NavigationContainer>
        </LoginProvider>
      </GestureHandlerRootView>
    </BottomBarProvider>
  );
}


export default App;