import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, FlatList, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { OrderStackParams } from './OrderManagement.tsx';
import Request from '../../../common/requests';
import { getAccessToken } from '../../../common/storage.js';

interface OrderInfoType {
  order_uuid: string;
  service_info: {
    service_title: string;
    basic_price: number;
  };
  orderer_information: {
    orderer_name: string;
  };
  order_date: string;
  transaction: {
    transaction_option: string;
  };
  images: { image_type: string; image: string }[];
}

const NewOrders = ({ navigation, route }: StackScreenProps<OrderStackParams, 'NewOrders'>) => {
  const [orders, setOrders] = useState<OrderInfoType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const request = Request();

  // API 호출: reformer 주문 목록 불러오기
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        Alert.alert('❌ 오류', '로그인이 필요합니다.');
        return;
      }

      const response = await request.get('/api/orders?type=reformer&status=pending', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setOrders(response.data);
        console.log('✅ 주문 목록:', response.data);
      } else {
        Alert.alert('❌ 주문 목록을 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('❌ 주문 목록 API 호출 실패:', error);
      Alert.alert('❌ 주문 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스 시 주문 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 20 }} />
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.order_uuid}
          renderItem={({ item: order }) => {
            const orderImage = order.images?.find(img => img.image_type === "order")?.image || '';
            return (
              <OrderInfoBox>
                <TopSection>
                  <OrderDate>{order.order_date}</OrderDate>
                  <ContentRow>
                    <ImageContainer source={{ uri: orderImage }} />
                    <TextContainer>
                      <Title>{order.service_info.service_title || '서비스명 없음'}</Title>
                      <OrderText>예상 결제 금액: {order.service_info.basic_price.toLocaleString()}원</OrderText>
                      <OrderText>주문자: {order.orderer_information.orderer_name || '익명'}</OrderText>
                      <OrderText>거래 방식: {order.transaction.transaction_option === '비대면' ? '비대면' : '대면'}</OrderText>
                    </TextContainer>
                  </ContentRow>
                </TopSection>
                <BottomSection>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('QuotationConfirm', { order })}
                  >
                    <ConfirmText>주문서 확인</ConfirmText>
                  </TouchableOpacity>
                </BottomSection>
              </OrderInfoBox>
            );
          }}
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>새 주문이 없습니다.</Text>
      )}
    </SafeAreaView>
  );
};

// 스타일 정의
const OrderInfoBox = styled.View`
  flex-direction: column;
  border-radius: 12px;
  border-width: 1px;
  border-color: #ddd;
  margin: 10px;
  background-color: #fff;
`;

const TopSection = styled.View`
  padding: 15px;
`;

const BottomSection = styled.View`
  padding: 10px;
  border-top-width: 1px;
  border-color: #ddd;
  align-items: center;
`;

const OrderDate = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const ContentRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ImageContainer = styled.Image`
  width: 108px;
  height: 108px;
  border-radius: 8px;
  margin-right: 15px;
`;

const TextContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

const OrderText = styled.Text`
  font-size: 14px;
  color: #333;
`;

const ConfirmText = styled.Text`
  font-size: 16px;
  color: #6200EE;
  font-weight: bold;
`;

export default NewOrders;
