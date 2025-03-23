import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  StackScreenProps,
  createStackNavigator,
} from '@react-navigation/stack';
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeNickname,
  removeRefreshToken,
  setUserRole,
} from '../../../common/storage';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LoginContext } from '../../../common/Context';
import DetailScreenHeader from '../../../components/Home/components/DetailScreenHeader';
import { Title20B } from '../../../styles/GlobalText';
import TextToggle from '../../../common/TextToggle';
import { BLACK } from '../../../styles/GlobalColor';
import { MaterialTabBar, Tabs } from 'react-native-collapsible-tab-view';
// import ReviewPage from '../../../components/Home/Market/ReviewPage';
// import ScrollToTopButton from '../../../common/ScrollToTopButtonFlat';
import FixMyPage from '../../../pages/FixMyPage';
import Login from '../../../components/Auth/Login';

import Request from '../../../common/requests';
import OrderPage from '../../../components/Home/Order/OrderPage';
import OrderManagement from '../../../components/Home/Order/OrderManagement';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { print } from '@gorhom/bottom-sheet/lib/typescript/utilities/logger';
import { TabProps } from '../../../../App';
import { PhotoType } from '../../../hooks/useImagePicker';
import { MyPageStackParams, MypageStackProps } from '../../../pages/MyPage';
import DeleteModal from '../DeleteModal';
import { OrderStackParams } from '../Order/OrderManagement';

export const UpcyerMyPageMainScreen = ({ navigation, route }: MypageStackProps) => {
  const ProfileSection = ({
    nickname,
    backgroundphoto,
    profile_image,
    editProfile,
    introduce,
  }: {
    nickname: string;
    backgroundphoto: any;
    profile_image: PhotoType;
    editProfile: any;
    introduce: string;
  }) => {
    const { width, height } = Dimensions.get('screen');
    return (
      <View style={{ alignItems: 'center' }}>
        <DetailScreenHeader
          title=""
          leftButton="CustomBack"
          onPressLeft={() => { }}
          rightButton="Fix"
          onPressRight={openModal}
        />
        <View>
          <View style={{ width: width, height: height * 0.11, backgroundColor: '#E9EBF8' }} />
          {profile_image === undefined || profile_image.uri === undefined ? ( // 전자는 편집페이지에서 사진 삭제했을 경우, 후자는 가장 처음에 로딩될 경우
            <Image
              style={{
                alignSelf: 'center',
                width: width * 0.21,
                height: width * 0.21,
                borderRadius: 180,
                position: 'absolute',
                top: height * 0.06,
              }}
              source={{
                uri: 'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
              }}
            />
          ) : (
            <Image
              style={{
                alignSelf: 'center',
                width: width * 0.21,
                height: width * 0.21,
                borderRadius: 180,
                position: 'absolute',
                top: height * 0.06,
              }}
              source={
                profile_image
                  ? { uri: profile_image.uri } // 유효한 URL이면 그대로 사용
                  : {
                    uri: 'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
                  } // 기본 이미지 URL 사용
              }
              alt={profile_image.fileName}
            />
          )}
        </View>
        <Title20B style={{ marginTop: height * 0.06 }}>{nickname}</Title20B>
        <View style={{ backgroundColor: "#EAEAEA", borderRadius: 20, paddingVertical: height * 0.005, paddingHorizontal: height * 0.012, marginTop: height * 0.02 }}>
          <Text style={{ color: "#929292", fontSize: width * 0.03, fontWeight: "600" }}>업씨러</Text>
        </View>
      </View>
    );
  };

  const request = Request();
  const { isLogin, setLogin } = useContext(LoginContext);
  const [userInfo, setUserInfo] = useState({
    nickname: route.params?.nickname || '',
    backgroundphoto:
      'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
    profile_image:
      route.params?.profile_image ||
      'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
    introduce: route.params?.introduce || '',
    role: 'customer',
  });

  useEffect(() => {
    if (route.params?.userInfo) {
      setUserInfo(route.params.userInfo);
    }
  }, [route.params?.userInfo]);
    useEffect(() => {
  console.log(JSON.stringify(navigation.getState(), null, 2));
}, [navigation]);

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
        console.log('User data fetched successfully:', response.data);
        setUserInfo({
          nickname: response.data.nickname,
          // 우선 기본이미지
          backgroundphoto:
            'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
          profile_image: profileImage,
          introduce:
            response.data.introduce ||
            '나는야 업씨러 이하늘 환경을 사랑하지요 눈누난나',
          role: 'customer',
        });
        return response.data;
      } else {
        console.log('Failed to fetch user data:', response);
        return null;
      }
    } catch (error) {
      // 에러 처리
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isLogin) {
        getProfile(); // 로그인 상태일 때 프로필을 가져옴
      }
    }, [isLogin]),
  );

  const [routes] = useState([
    { key: 'order', title: '주문내역' },
    // { key: 'like', title: '좋아요' },
  ]);
  const flatListRef = useRef<FlatList>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleEdit = () => {
    closeModal();
    navigation.navigate('FixMyPage', { userInfo })
    console.log('수정 페이지로 이동')
  }

  const handleLogout = () => {
    closeModal();
    Alert.alert(
      "로그아웃 하시겠습니까?",
      "",
      [
        { text: "아니오", onPress: () => { }, style: "destructive" },
        { text: "네", onPress: Logout }
      ],
      { cancelable: false }
    );
  };

  const Logout = async () => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    const params = {
      refresh: refreshToken
    }
    const headers = {
      Authorization: `Bearer ${accessToken}`
    }
    try {
      const response = await request.post(`/api/user/logout`, params, headers)
      if (response && response.status === 200) {
        console.log('로그아웃 합니다.')
        removeAccessToken();
        removeRefreshToken();
        setLogin(false);
        setUserRole('customer');
        console.log('AccessToken: ', { accessToken }, '| RefreshToken: ', { refreshToken });
        navigation.dispatch(
          CommonActions.navigate({
            name: "Main",
            params: {
              screen: "UPCY", // MainTabNavigator의 홈 화면으로 이동
            },
          })
        );
      } else {
        console.log(response);
      }
    }
    catch (err) {
      console.error(err)
    }
  };

  const handleDeleteAccount = (password: string) => {
    closeModal();
    Alert.alert(
      "정말로 계정을 삭제 하시겠습니까? 되돌릴 수 없습니다.",
      "",
      [
        { text: "아니오", onPress: () => { }, style: "destructive" },
        { text: "네", onPress: () => handleDeleteAccountConfirm(password) } // 별도의 함수 호출
      ],
      { cancelable: false }
    );
  };

  // 비동기 작업을 수행하는 함수
  const handleDeleteAccountConfirm = async (password: string) => {
    try {
      await DeleteAccount(password);
    } catch (error) {
      console.error('계정 삭제 실패:', error);
    }
  };

  const DeleteAccount = async (password: string) => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      RefreshToken: refreshToken,
    };
    console.log(password);
    try {
      const response = await request.del(`/api/user`, { password: password }, headers);
      if (response && response.status === 200) {
        removeAccessToken();
        removeRefreshToken();
        setLogin(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'UPCY' } }],
          })
        );
        console.log('계정 삭제 성공');
      } else {
        console.log('계정 삭제 실패:', response.data);
        Alert.alert('계정 삭제 실패', '비밀번호를 다시 확인해주세요.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('오류', '계정 삭제에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs.Container
        renderHeader={props => (
          <View>
            <ProfileSection
              nickname={userInfo.nickname}
              backgroundphoto={userInfo.backgroundphoto}
              profile_image={userInfo.profile_image}
              editProfile={() => navigation.navigate('FixMyPage', { userInfo })}
              introduce={userInfo.introduce}
            />
          </View>
        )}
        headerContainerStyle={{
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderColor: '#D9D9D9',
        }}
        renderTabBar={props => (
          <MaterialTabBar
            {...props}
            indicatorStyle={{
              backgroundColor: '#BDBDBD',
              height: 2,
            }}
            style={{
              backgroundColor: 'white',
            }}
            labelStyle={{
              color: BLACK,
              fontWeight: '700',
              fontSize: 16,
            }}
          //onTabPress={() => Alert.alert('준비중입니다!ㅠㅠ')}
          // 룩북, 좋아요 모아보기 기능 구현되면 위의 onTapPress는 삭제할 것
          />
        )}>
        {routes.map(route_ => (
          <Tabs.Tab key={route_.key} name={route_.title}>
            {route_.key === 'order' && <OrderPage />}
            {/* {route.key === 'like' &&
                 <View>
                     <ReviewPage flatListRef={flatListRef} />
                     <ScrollToTopButton flatListRef={flatListRef} />
                     </View>}
                 </View>} */}
          </Tabs.Tab>)
        )}
      </Tabs.Container>
      <DeleteModal
        visible={modalVisible}
        onClose={closeModal}
        onEdit={handleEdit}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    </SafeAreaView>
  );
};