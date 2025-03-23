import React, { useState , useEffect, useCallback} from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Body14R, Subtitle16B } from '../../../styles/GlobalText';
import { PURPLE, LIGHTGRAY } from '../../../styles/GlobalColor.tsx';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Request from '../../../common/requests';
import { getAccessToken } from '../../../common/storage'



const CompletedOrders = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all'); //초기 필터값 all
  const [open, setOpen] = useState(false); //dropdown 열림 상태
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([
    { label: '전체', value: 'all' },
    { label: '거래 완료', value: 'completed' },
    { label: '거절한 주문', value: 'rejected' },
    { label: '중단된 주문', value: 'suspended' },
  ]);



  const fetchOrders = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        Alert.alert('❌ 오류', '로그인이 필요합니다.');
        return;
      }

      const statuses = ['end', 'rejected'];
      const request = Request();

      const requests = statuses.map(status =>
        request.get(`/api/orders?type=reformer&status=${status}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(err => {
          console.error(`❌ ${status} 주문 조회 실패`, err.response?.data || err.message);
          return null;
        })
      );

      const responses = await Promise.all(requests);

      const allOrders = responses
        .filter(res => res && res.status === 200 && Array.isArray(res.data))
        .flatMap(res => res.data);

      console.log('📦 완료/거절 주문:', allOrders);

      setOrders(allOrders);
    } catch (error) {
      console.error('❌ 주문 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 포커스 시마다 데이터 fetch
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // 필터링된 데이터
    const filteredOrders = orders.filter((order: any) => {
      if (filter === 'all') return true;
      if (filter === 'completed') return order.order_status?.[0]?.status === 'end';
      if (filter === 'rejected') return order.order_status?.[0]?.status === 'rejected';
      if (filter === 'suspended') return order.order_status?.[0]?.status === 'suspended';
      return false;
    });



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHTGRAY }}>
      {/* 필터 영역 */}
      <FilterContainer style={{ zIndex: 10 }}>
        <DropDownPicker
          open={open}
          value={filter}
          items={items}
          setOpen={setOpen}
          setValue={setFilter}
          setItems={setItems}
          placeholder="필터 선택"
          style={{
            borderColor: PURPLE,
            borderWidth: 1,
            borderRadius: 30,
            alignSelf: 'flex-start',
            maxWidth: 130,
            maxHeight: 30,
            paddingVertical: 0,
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          containerStyle={{
            height: 36,
          }}
          dropDownContainerStyle={{
            borderColor: PURPLE,
            alignSelf: 'flex-start',
            minWidth: 100,
            maxWidth: 130,
            margin: 0,

          }}
          textStyle={{
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 30,

          }}
        />
      </FilterContainer>

      {/* orderinfobox 영역 */}
      <View style={{ zIndex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={PURPLE} style={{ marginTop: 20 }} />
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order: any) => (
            <OrderInfoBox key={order.order_uuid}>
              <TopSection>
                <TopRow>
                  <OrderDate>
                  {order.order_date}
                  </OrderDate>
                  <OrderStatus status={order.status}>
                        {order.order_status?.[0]?.status === 'end' ? '거래 완료' : '거절한 주문'}
                  </OrderStatus>
                </TopRow>
                <ContentRow>
                  <ImageContainer source={{ uri: order.images?.[0]?.image || '' }} />
                  <TextContainer>
                    <Subtitle16B>{order.service_info?.service_title || '제목 없음'}</Subtitle16B>
                    <Body14R>결제 금액: {order.total_price?.toLocaleString() || '0'}원</Body14R>
                    <Body14R>주문자: {order.orderer_information?.orderer_name || '익명'}</Body14R>
                    <Body14R>주문 번호: {order.order_uuid}</Body14R>
                  </TextContainer>
                </ContentRow>
              </TopSection>
              <BottomSection>
                <TouchableOpacity onPress={() => navigation.navigate('QuotationReview', { order })}>
                  <CheckOrderText>주문서 확인</CheckOrderText>
                </TouchableOpacity>
              </BottomSection>
            </OrderInfoBox>
          ))
        ) : (
          <Text style={{ margin: 20 }}>표시할 주문이 없습니다.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};


const FilterContainer = styled.View`
  padding: 10px;
  border-bottom-width: 1px;
  border-color: ${LIGHTGRAY};
`;

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

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
`;

const OrderStatus = styled.Text`
  font-size: 14px;
  font-weight: 400;
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

const CheckOrderText = styled.Text`
  font-size: 16px;
  color: #000;
`;

export default CompletedOrders;
