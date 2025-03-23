import { Fragment, useState, useLayoutEffect, useEffect } from 'react';

import { SafeAreaView, Text, View, Alert } from 'react-native';
import styled from 'styled-components/native';
import {
  StackScreenProps,
  createStackNavigator,
} from '@react-navigation/stack';
import { TabProps } from '../../App';
import { ScrollView } from 'react-native-gesture-handler';

// TODO: 나중에 CustomHeader2 사용
// import CustomHeader from '../common/CustomHeader';
import CustomHeader2 from '../common/CustomHeader2';
import HomeTabView, { SelectedOptionProps } from '../components/Home/HomeMain';
import MarketTabView from '../components/Home/Market/MarketTabView';
import QuotationForm, { QuotationFormProps } from '../components/Home/Quotation/QuotationForm';
import QuotationPage, {
  QuotationProps,
} from '../components/Home/Quotation/QuotationPage';
import SentQuotation from '../components/Home/Quotation/SentQuotation';
import QuotationReview from '../components/Home/Quotation/QuotationReview';
import ServiceRegistrationPage from '../components/Home/Market/ServiceRegistration';
import ServiceDetailPageScreen from '../components/Home/Market/ServiceDetailPage';
import GoodsDetailPageScreen from '../components/Home/Market/GoodsDetailPage';
import GoodsRegistrationPage from '../components/Home/Market/GoodsRegistration';
import TempStorageEdit from '../components/Home/Market/TempStorageEdit';
//import WriteDetailPage from '../components/Home/Market/WriteDetailPage';
import AddPortfolio from '../components/Home/Portfolio/AddPortfolio';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import InputInfo from '../components/Home/Quotation/InputInfo';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
//import ComponentsTest from './ComponentsTest';
import { PURPLE } from '../styles/GlobalColor';
//import ReformerMarket from '../components/Home/Market/ReformerMarket';
import Service, { MaterialDetail } from '../components/Home/Market/Service';
// import { PhotoType } from '../hooks/useImagePicker';
import { stylesList } from '../components/Home/HomeMain';
import SearchPage from './SearchPage';
import { ServiceDetailOption } from '../components/Home/Market/Service';
import ReportPage from './ReportPage';
import { PhotoResultProps } from '../common/PhotoOptions';
import ServiceDetailPageMainScreen from '../components/Home/Market/ServiceDetailPage';
import ReformerMarket from '../components/Home/Market/ReformerMarket';

export type HomeStackParams = {
  Home: { searchTerm?: string };
  ServiceDetailPage: {
    id: number;
    serviceName: string;
    introduce: string;
    reformerArea: string;
    reformerLink: string;
    reformerName: string;
    basicPrice: number;
    maxPrice: number;
    tags: string[];
    reviewNum: number;
    imageUris: any[];
    profileImageUri?: string;
    servicePeriod: number;
    serviceMaterials: MaterialDetail[];
    serviceContent: string;
    serviceOptions: ServiceDetailOption[];
    serviceCategory: string;
    marketUuid: string;
    serviceUuid: string;
    education: any[];
    certification: any[];
    awards: any[];
    career: any[];
    freelancer: any[];
  };
  GoodsDetailPage: undefined;
  QuotationForm: QuotationFormProps;
  QuotationPage: QuotationProps;
  SentQuotation: undefined;
  // ServiceRegistrationPage: { inputText?: string; detailphoto?: PhotoType[] };
  GoodsRegistrationPage: undefined;
  TempStorageEdit: undefined;
  // WriteDetailPage: { inputText: string; detailphoto?: PhotoType[] };
  AddPortfolio: undefined;
  InputInfo: {
    photos: PhotoResultProps[];
    materials: string[];
    transactionMethod: string;
    options: any[]; // TODO: fix
    additionalRequest: { text: string, photos: PhotoResultProps[] };
  };
  ReformerMarket: undefined;
  TestComponents: undefined;
  MarketTabView: {
    reformerName: string;
    introduce: string;
    reformerArea: string;
    reformerLink: string;
    id: number;
    marketUuid: string;
    profileImageUri?: string;
    education: any[];
    certification: any[];
    awards: any[];
    career: any[];
    freelancer: any[];
  };
  SearchPage: {
    navigation: any;
  };
  ReportPage: undefined;
};

const HomeStack = createStackNavigator<HomeStackParams>();

const HomeScreen = ({
  //   navigation,
  //   route,
}: BottomTabScreenProps<TabProps, 'UPCY'>) => {
  // useLayoutEffect(() => {
  //   const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home'; // 기본값 설정
  //   console.log('🎯 현재 포커스된 페이지:', routeName);

  //   if (routeName === 'AddPortfolio') {
  //     navigation.setOptions({ tabBarStyle: { display: 'none' } });
  //   } else {
  //     navigation.setOptions({ tabBarStyle: { display: 'flex' } });
  //   }
  // }, [navigation, route]);
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={() => ({
        headerShown: false,
      })}>
      <HomeStack.Screen name="Home" component={HomeMainScreen} />
      <HomeStack.Screen name="MarketTabView" component={MarketTabView} />
      <HomeStack.Screen
        name="ServiceDetailPage"
        component={ServiceDetailPageMainScreen}
      />
      <HomeStack.Screen name="QuotationForm" component={QuotationForm} />
      <HomeStack.Screen name="QuotationPage" component={QuotationPage} />
      <HomeStack.Screen name="SentQuotation" component={SentQuotation} />
      <HomeStack.Screen
        name="GoodsDetailPage"
        component={GoodsDetailPageScreen}
      />
      <HomeStack.Screen
        name="GoodsRegistrationPage"
        component={GoodsRegistrationPage}
      />
      <HomeStack.Screen name="TempStorageEdit" component={TempStorageEdit} />
      {/* <HomeStack.Screen name="WriteDetailPage" component={WriteDetailPage} /> */}
      <HomeStack.Screen name="AddPortfolio" component={AddPortfolio} />
      <HomeStack.Screen name="InputInfo" component={InputInfo} />
      <HomeStack.Screen name="QuotationReview" component={QuotationReview} />
      {/* <HomeStack.Screen name="TestComponents" component={ComponentsTest} /> */}
      <HomeStack.Screen name="ReformerMarket" component={ReformerMarket} />
      <HomeStack.Screen name="SearchPage" component={SearchPage} />
      <HomeStack.Screen name="ReportPage" component={ReportPage} />
    </HomeStack.Navigator>
  );
};

const HomeMainScreen = ({
  navigation,
  route,
}: StackScreenProps<HomeStackParams, 'Home'>) => {

  const { searchTerm } = route.params || {};
  const [selectedTab, setSelectedTab] = useState<'Goods' | 'Market' | 'temp'>(
    'Goods',
  );

  const handlePopupButtonPress = () => {
    Alert.alert(
      '알림', // 팝업제목
      '주문서가 들어왔어요. \n 확인해보시겠어요?',
      [
        {
          text: '네',
          onPress: () => {
            console.log('네 선택');

          },
        },
        {
          text: '나중에요',
          onPress: () => console.log('나중에요 선택'),
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  // const handleTabChange = (tab: 'Goods' | 'Market' | 'temp') => {
  //   setSelectedTab(tab);
  // };

  const [selectedFilterOption, setSelectedFilterOption] = useState<
    SelectedOptionProps | undefined
  >('최신순');

  const [selectedStylesList, setSelectedStylesList] =
    useState<string[]>(stylesList);

  return (
    <Fragment>
      <SafeAreaView style={{ flex: 0, backgroundColor: PURPLE }} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* TODO: 나중에 CustomHeader2 사용 */}
        {/* <CustomHeader onSearch={() => {}} onTabChange={handleTabChange} /> */}
        <CustomHeader2 navigation={navigation} />
        <BottomSheetModalProvider>
          <HomeTabView
            selectedTab={selectedTab}
            setSelectedFilterOption={setSelectedFilterOption}
            selectedStylesList={selectedStylesList}
            setSelectedStylesList={setSelectedStylesList}
          />
          {selectedTab === 'Goods' && (
            <View>
              <Service
                selectedStylesList={selectedStylesList}
                selectedFilterOption={selectedFilterOption}
                searchTerm={searchTerm}
                navigation={navigation}
              />
            </View>
          )}
          {selectedTab === 'Market' &&
            <ReformerMarket />
          }
          {selectedTab === 'temp' && (
            <ScrollView>
              <Button onPress={handlePopupButtonPress}>
                <ButtonText>팝업 표시</ButtonText>
              </Button>
              {/* <Button onPress={() => navigation.navigate('QuotationForm')}>
                <Text>주문서</Text>
              </Button> */}
              <Button onPress={() => navigation.navigate('QuotationPage', {})}>
                <Text>주문서 확인</Text>
              </Button>
              <Button onPress={() => navigation.navigate('GoodsDetailPage')}>
                <Text>상품 디테일</Text>
              </Button>
              <Button
                onPress={() => navigation.navigate('GoodsRegistrationPage')}>
                <Text>상품등록</Text>
              </Button>
              <Button onPress={() => navigation.navigate('AddPortfolio')}>
                <Text>포트폴리오 등록</Text>
              </Button>
              <Button onPress={() => navigation.navigate('TestComponents')}>
                <Text>공통 컴포넌트 테스트</Text>
              </Button>
            </ScrollView>
          )}
        </BottomSheetModalProvider>
      </SafeAreaView>
    </Fragment>
  );
};

const Button = styled.TouchableOpacity`
  background-color: white;
  padding: 10px;
  margin-top: 10px;
  margin-left: 15px;
  margin-right: 15px;
  border: #612fef;
  border-radius: 14px;
  position: relative;
  z-index: -1;
`;

const ButtonText = styled.Text`
  color: #612fef;
  font-weight: bold;
`;

export default HomeScreen;