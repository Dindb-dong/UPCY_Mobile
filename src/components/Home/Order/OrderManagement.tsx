import React from 'react';
import { SafeAreaView, FlatList, } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import DetailScreenHeader from '../components/DetailScreenHeader.tsx';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabProps } from '../../../../App.tsx';
import OrderManagementTabs from './OrderManagementTabs';
import OrderPage from './OrderPage.tsx';
import QuotationPage, { QuotationProps } from '../Quotation/QuotationPage.tsx';
import CompletedOrderPop from './CompletedOrderPop.tsx';
import WriteReviewPage from '../Market/WriteReviewPage.tsx';
import SentQuotation from '../Quotation/SentQuotation.tsx';
import CompletedOrders from './CompletedOrders.tsx';
import InProgressOrders from './InProgressOrders.tsx';
import InputInfo, { InputInfoProps } from '../Quotation/InputInfo.tsx';
import QuotationConfirm from '../Quotation/QuotationConfirm.tsx';
import Rejection from '../Quotation/Rejection.tsx';
import SentRejection from '../Quotation/SentRejection.tsx';
import NewOrders from './NewOrders.tsx';
import QuotationForm from '../Quotation/QuotationForm.tsx';
import QuotationReview from '../Quotation/QuotationReview.tsx';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LoginContext } from '../../../common/Context';
import { getUserRole } from '../../../common/storage';

// type OrderInfoType = {
//   id: string;
//   name: string;
//   customer: string;
//   orderDate: string;
//   is_online: boolean;
//   navigation: any;
// }

export type OrderProps = {
  navigation: any;
  route: any;
  flatListRef?: React.RefObject<FlatList<any>>;
  QuotationReview: {order:any};
}

export type OrderStackParams = {
  OrderManagementTabs: undefined;
  OrderPage: undefined;
  NewOrders: undefined;
  InProgressOrders: undefined;
  CompletedOrderPop: undefined;
  CompletedOrders: undefined;
  QuotationPage: QuotationProps;
  QuotationForm: undefined;
  SentQuotation: undefined;
  WriteReviewPage: undefined;
  InputInfo: InputInfoProps;
  QuotationConfirm: QuotationProps;
  Rejection: undefined;
  SentRejection: undefined;
  QuotationReview: QuotationProps;
}

const OrderStack = createStackNavigator<OrderStackParams>();

// const OrderScreen = ({
//   navigation,
//   route,
// }: BottomTabScreenProps<TabProps, '주문관리'>) => {
//   return (
//     <OrderStack.Navigator>
//       <OrderStack.Screen name="OrderPage" component={OrderPage} />
//       <OrderStack.Screen name="CompletedOrderPop" component={CompletedOrderPop} />
//       <OrderStack.Screen name="CompletedOrders" component={CompletedOrders} />
//       <OrderStack.Screen name="QuotationPage" component={QuotationPage} />
//       <OrderStack.Screen name="SentQuotation" component={SentQuotation} />
//       <OrderStack.Screen name="WriteReviewPage" component={WriteReviewPage} />
//     </OrderStack.Navigator>
//   )
// }

const OrderManagement = ({
  // navigation, route
}: BottomTabScreenProps<TabProps, '주문관리'>) => {

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      <OrderStack.Navigator
        screenOptions={() => ({
          headerShown: false,
        })}>
        {/* OrderManagementTabs: 탭 네비게이션 */}
        <OrderStack.Screen
          name="OrderManagementTabs"
          component={OrderManagementTabs}
          options={{
            header: () => (
              <DetailScreenHeader
                title="주문 관리"
                leftButton="CustomBack"
                onPressLeft={() => { }}
                rightButton="None"
                onPressRight={() => { }}
              />
            ),
          }}
        />
        <OrderStack.Screen name="QuotationPage" component={QuotationPage} />
        <OrderStack.Screen name="QuotationForm" component={QuotationForm} />
        <OrderStack.Screen name="NewOrders" component={NewOrders} />
        <OrderStack.Screen name="InProgressOrders" component={InProgressOrders} />
        <OrderStack.Screen name="OrderPage" component={OrderPage} />
        <OrderStack.Screen name="CompletedOrderPop" component={CompletedOrderPop} />
        <OrderStack.Screen name="CompletedOrders" component={CompletedOrders} />
        <OrderStack.Screen name="SentQuotation" component={SentQuotation} />
        <OrderStack.Screen name="WriteReviewPage" component={WriteReviewPage} />
        <OrderStack.Screen name="InputInfo" component={InputInfo} />
        <OrderStack.Screen name="QuotationConfirm" component={QuotationConfirm} />
        <OrderStack.Screen name="Rejection" component={Rejection} />
        <OrderStack.Screen name="SentRejection" component={SentRejection} />
        <OrderStack.Screen name="QuotationReview" component={QuotationReview} />

      </OrderStack.Navigator>
    </SafeAreaView>
  );
};

export default OrderManagement;