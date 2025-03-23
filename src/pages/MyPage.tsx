import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LoginContext } from '../common/Context';
import Lock from '../assets/common/Lock.svg';
import { ReformerMyPageScreen } from '../components/Auth/Reformer/ReformerMyPage.tsx';
import { UpcyerMyPageMainScreen } from '../components/Auth/Upcyer/UpcyerMyPage.tsx';
import Login from '../components/Auth/Login';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabProps } from '../../App.tsx';
import { getAccessToken } from '../common/storage.js';
import TempStorage from '../components/Home/Market/TempStorage.tsx';
import ServiceRegistrationPage from '../components/Home/Market/ServiceRegistration.tsx';
import WriteDetailPage from '../components/Home/Market/WriteDetailPage.tsx';
import { PhotoType } from '../hooks/useImagePicker.ts';
import FixMyPage from './FixMyPage.tsx';
import Request from '../common/requests.js';
import { useFocusEffect } from '@react-navigation/native';
import { Body16B } from '../styles/GlobalText.tsx';
import BottomButton from '../common/BottomButton.tsx';
import TempStorageEdit from '../components/Home/Market/TempStorageEdit.tsx';
import CompletedOrderPop from '../components/Home/Order/CompletedOrderPop.tsx';
import QuotationPage from '../components/Home/Quotation/QuotationPage.tsx';

export type MyPageStackParams = {
  MyPage: { userInfo?: any | undefined };
  FixMyPage: { userInfo?: any, reformerInfo?: any };
  Login: undefined;
  ReformerMyPageScreen: undefined;
  UpcyerMyPageMainScreen: { navigation: any; route: any };
  TempStorage: undefined;
  TempStorageEdit: undefined;
  ServiceRegistrationPage: { inputText?: string; detailPhoto?: PhotoType[]; serviceData?: any; fix?: boolean; };
  WriteDetailPage: { inputText: string; detailPhoto?: PhotoType[]; serviceData: any; };
};

export interface MypageStackProps {
  navigation: any;
  route: any;
}

const MyPageStack = createStackNavigator<MyPageStackParams>();
const MyPageScreen = ({
  // navigation,
  // route,
}: BottomTabScreenProps<TabProps, 'MY'>) => {
  return (
    <MyPageStack.Navigator initialRouteName="MyPage">
      <MyPageStack.Screen
        name="MyPage"
        component={MyPageMainScreen}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="ReformerMyPageScreen"
        component={ReformerMyPageScreen}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="UpcyerMyPageMainScreen"
        component={UpcyerMyPageMainScreen}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="TempStorage"
        component={TempStorage}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="TempStorageEdit"
        component={TempStorageEdit}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="ServiceRegistrationPage"
        component={ServiceRegistrationPage}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="WriteDetailPage"
        component={WriteDetailPage}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="FixMyPage"
        component={FixMyPage}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <MyPageStack.Screen
        name="CompletedOrderPop"
        component={CompletedOrderPop}
        options={{ headerShown: false }}
      />

      <MyPageStack.Screen
        name="QuotationPage"
        component={QuotationPage}
        options={{ headerShown: false }}
      />

    </MyPageStack.Navigator>
  );
};

const MyPageMainScreen = ({ navigation, route }: MypageStackProps) => {
  const request = Request();
  const { isLogin, setLogin } = useContext(LoginContext);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | false>('');
  const [userInfo, setUserInfo] = useState({
    nickname: route.params?.userInfo?.nickname || '',
    backgroundphoto:
      route.params?.userInfo?.backgroundphoto ||
      'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
    profile_image:
      route.params?.userInfo?.profile_image ||
      'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
    introduce: route.params?.userInfo?.introduce || '',
  });

  useEffect(() => {
    if (route.params?.userInfo) {
      setUserInfo(route.params.userInfo);
    }
  }, [route.params?.userInfo]);

  const getProfile = async () => {
    // 유저 프로필 가져오기-> setUserInfo로 관리
    const accessToken = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    try {
      const response = await request.get(`/api/user`, {}, headers);
      const encodedUrl = encodeURI(response.data.profile_image_url);
      const decodedUri = decodeURIComponent(encodedUrl);
      const profileImage: PhotoType = {
        fileName: response.data.profile_image_url ? 'profile.jpg' : undefined,
        width: undefined, // width는 알 수 없으므로 undefined로 설정
        height: undefined, // height는 알 수 없으므로 undefined로 설정
        uri:
          decodedUri ||
          'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
      };
      if (response.status === 200) {
        setUserInfo({
          nickname: response.data.nickname,
          // 우선 기본이미지
          backgroundphoto:
            'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
          profile_image: profileImage,
          introduce:
            response.data.introduce ||
            '나는야 업씨러 이하늘 환경을 사랑하지요 눈누난나',
        });
        setRole(response.data.role);
        return response.data;
      } else {
        console.log('Failed to fetch user data:', response);
        return null;
      }
    } catch (error) {
      // 에러 처리
      console.error('Error fetching user data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isLogin) {
        getProfile(); // 로그인 상태일 때 프로필을 가져옴
      }
    }, [isLogin]),
  );
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5e008d" />
      </View>
    );
  }

  if (!loading && userInfo.nickname === '' || userInfo.nickname === null) {
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <Lock />
        <Body16B>{''}</Body16B>
        <Body16B style={{ color: '#612FEF' }}>
          리폼러 프로필 등록을 완료해야
        </Body16B>
        <Body16B style={{ color: '#612FEF' }}>
          나의 서비스를 제공할 수 있습니다.
        </Body16B>
        <BottomButton
          disable={false}
          value="리폼러 프로필 등록하기"
          pressed={false}
          onPress={() => {
            navigation.navigate('Signin', { screen: 'Reformer' }); // 최상위 스택에 접근
          }}
          style={{
            width: '90%',
            alignSelf: 'center',
            marginTop: 'auto',
            marginBottom: 20,
            position: 'absolute',
            bottom: 0,
          }}
        />
      </View>
    );
  } else {
    if (!loading && role === 'reformer') {
      return <ReformerMyPageScreen navigation={navigation} route={route} />;
    } else if (role === 'customer') {
      return <UpcyerMyPageMainScreen navigation={navigation} route={route} />;
    } else if (!loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Role not assigned or data missing</Text>
        </View>
      );
    }
  }
};

export default MyPageScreen;
