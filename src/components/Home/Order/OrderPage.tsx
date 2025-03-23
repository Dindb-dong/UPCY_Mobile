import React, { useState, useEffect , useCallback} from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Dimensions, Modal, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import styled from 'styled-components/native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

import { BLACK, LIGHTGRAY, PURPLE, GREEN } from '../../../styles/GlobalColor';

import { Title20B, Body14R, Body16B, Caption11M } from '../../../styles/GlobalText.tsx';
import { useNavigation } from '@react-navigation/native';

import { OrderProps } from './OrderManagement.tsx';
import Request from '../../../common/requests';
import { getAccessToken } from '../../../common/storage.js';
import { StackScreenProps } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';

interface OrderInfoProps {
  name: string;
  reformer: string;
  estimated_price: string;
  is_delivery: boolean;
  navigation: any;
}
type OrderNavigationProp = StackNavigationProp<OrderStackParams, 'OrderPage'>;
type OrderPageProps = StackScreenProps<OrderStackParams, 'OrderPage'>;

const OrderInfo = ({ name, reformer, estimated_price, is_delivery , navigation, order}: OrderInfoProps) => {
   return (
  <InfoContainer>
    <Text style={{ color: 'black', fontSize: 15, marginBottom: 4 }}> </Text>
    <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{name}</Text>
    <Text style={{ color: 'grey', fontSize: 15, marginBottom: 4 }}>리포머: {reformer}</Text>
    <Text style={{ color: 'black', fontSize: 15, marginBottom: 4 }}>예상 결제 금액: {estimated_price}</Text>
    <Text style={{ color: 'black', fontSize: 15 }}>거래 방식: {is_delivery ? '비대면' : '대면'}</Text>
    <TouchableOpacity style={{ marginTop: 10, alignSelf: 'flex-end' }}
        onPress={() => {
            console.log("전달되는 주문 데이터:", order);
            navigation.navigate('QuotationReview', {order});
            }}
    >
      <Text style={{ color: 'gray', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }}>주문서 확인</Text>
    </TouchableOpacity>
  </InfoContainer>
  );
};





const OrderStatusLabel = ({ order_status }: any) =>  {
//console.log('🔍 order_status 데이터:', order_status);
  const status = Array.isArray(order_status) && order_status.length > 0
    ? order_status[0]?.status : '';
   switch (status) {
       case 'pending':
         return <StatusText style={{ color: PURPLE }}>수락 대기중</StatusText>;
       case 'accepted':
         return <StatusText style={{ color: PURPLE }}>제작중(수락)</StatusText>;
       case 'rejected':
         return <StatusText style={{ color: 'black' }}>거절됨</StatusText>;
       case 'received':
         return <StatusText style={{ color: PURPLE }}>제작중(재료 수령)</StatusText>;
       case 'produced':
         return <StatusText style={{ color: PURPLE }}>제작중(제작 완료)</StatusText>;
       case 'deliver':
         return <StatusText style={{ color: PURPLE }}>배송중</StatusText>;
       case 'end':
         return <StatusText style={{ color: 'black' }}>거래 완료</StatusText>;
       default:
         return <StatusText style={{ color: BLACK }}>상태 없음</StatusText>;
         //중단된 주문 추가해야됨
  }
};

const OrderActionButtons = ({
  status,
  isDelivery,
  navigation,
  onPressCompleted,
  reformerLink,
  onPressRejected
}: {
  status: string;
  isDelivery: boolean;
  navigation: any;
  onPressCompleted: () => void;
  reformerLink: string;
  onPressRejected: () => void;
}) => {
  return (
    <ButtonContainer>
      {(status === 'accepted' || status === 'received' || status === 'produced' || status === 'deliver') && (
        <>
          <ActionButton onPress={() => {
            if (reformerLink) {
              Linking.openURL(reformerLink);  // ✅ 오픈채팅 링크로 연결
            } else {
              Alert.alert('오픈채팅 링크가 없습니다.');
            }
          }}>
            <ActionText>오픈채팅</ActionText>
          </ActionButton>
        </>
      )}

      {/* 비대면은 'deliver'에서 거래 완료 버튼 */}
      {isDelivery && status === 'deliver' && (
        <ActionButton onPress={onPressCompleted}>
          <ActionText style={{ color: PURPLE }}>거래 완료하기</ActionText>
        </ActionButton>
      )}

      {/* 대면은 'produced'에서 거래 완료 버튼 */}
      {!isDelivery && status === 'produced' && (
        <ActionButton onPress={onPressCompleted}>
          <ActionText style={{ color: PURPLE }}>거래 완료하기</ActionText>
        </ActionButton>
      )}


      {/* 거절 상태일 때 거절 사유 버튼 */}
      {(status === 'rejected') && (
        <ActionButton onPress={onPressRejected}>
          <ActionText>거절 사유 확인하기</ActionText>
        </ActionButton>
      )}
    </ButtonContainer>
  );
};



interface FilterProps {
  selectedFilter: any;
  setSelectedFilter: any;
}


// DropdownSection 컴포넌트 정의
const DropdownSection = ({ selectedFilter, setSelectedFilter }: FilterProps) => {
  const screenWidth = Dimensions.get('window').width

  return (
    <View style={{ paddingVertical: 10, paddingHorizontal: 10, borderBottomColor: LIGHTGRAY, borderBottomWidth: 0 }}>
      <PickerContainer screenWidth={screenWidth}>
        <Picker
          selectedValue={selectedFilter}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
          style={{ height: 50, width: '100%', color: 'white', justifyContent: 'center', textAlignVertical: 'center', }}
        >
          <Picker.Item label="전체" value="전체" style={{ fontSize: 13 }} />
          <Picker.Item label="거래 전" value="거래 전" style={{ fontSize: 13 }} />
          <Picker.Item label="거래 중" value="거래 중" style={{ fontSize: 13 }} />
          <Picker.Item label="거래 완료" value="거래 완료" style={{ fontSize: 13 }} />
          <Picker.Item label="거절된 주문" value="거절된 주문ㅐㅑㅐㅑ" style={{ fontSize: 13 }} />
        </Picker>
      </PickerContainer>
    </View>
  );
};





// OrderInfoContainer 스타일 정의
const OrderInfoContainer = styled.View`
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid white;
`;

// 업씨러가 마이페이지에서 보는 주문관리 탭


const OrderPage = ( ) => {

  const navigation = useNavigation<OrderNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [orderList, setOrderList] = useState([]); // API에서 받은 주문목록
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectedReason, setRejectedReason] = useState('');
  const [isRejectedModalVisible, setIsRejectedModalVisible] = useState(false);

  const request = Request();





    //주문 데이터, 서비스 데이터 정보 api 요청 (병렬처리)
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const accessToken = await getAccessToken();
        console.log("📌 Access Token:", accessToken);

        if (!accessToken) {
          console.error('❌ Access token not found.');
          return;
        }
        console.log('📌 Access Token:', accessToken);

        // 사용자 정보 가져오기
        const userResponse = await request.get('/api/user', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("📌 사용자 역할:", userResponse.data.role);


        if (userResponse.status !== 200 || !userResponse.data.email) {
          console.error('❌ Failed to fetch user email.');
          return;
        }

        const userEmail = userResponse.data.email;
        //console.log('User Email:', userEmail);

        if (!userEmail) {
          console.error('❌ Email is missing!');
          return;
        }

        // 주문 목록 가져오기
        const orderResponse = await request.get(`/api/orders?email=${userEmail}&type=customer`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        //로그로 주문 데이터 확인
        console.log('서버 응답 주문 데이터:', orderResponse.data);
        const orders = Array.isArray(orderResponse.data) ? orderResponse.data : [];

        if (orderResponse.status === 200) {
          console.log('✅ 주문 데이터:', orderResponse.data);
        } else {
          Alert.alert('주문 목록을 불러오는 데 실패했습니다.');
        }





    //각 주문의 order_status 확인
      orders.forEach((order, index) => {
        console.log(`------ ${index + 1}번째 주문의 order_status ------`);
        console.log(JSON.stringify(order.order_status, null, 2));
      });




        // 모든 `market_uuid`와 `service_uuid` 쌍을 수집 (중복 제거)
        const servicePairs = [
          ...new Set(
            orders
              .map((order) => {
                const marketUuid = order.service_info?.market_uuid;
                const serviceUuid = order.service_info?.service_uuid;
                return marketUuid && serviceUuid ? `${marketUuid},${serviceUuid}` : null;
              })
              .filter(Boolean)
          ),
        ];

        // 병렬 API 요청으로 각 서비스의 닉네임 가져오기
        const serviceResponses = await Promise.all(
          servicePairs.map(async (pair) => {
            const [marketUuid, serviceUuid] = pair.split(',');
            try {
              const response = await request.get(`/api/market/${marketUuid}/service/${serviceUuid}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (response.status === 200) {
                return {
                  marketUuid,
                  serviceUuid,
                  service_title: response.data.service_title ?? '서비스명 없음',
                  reformer_name: response.data.reformer_info?.user_info?.nickname ?? '익명 리포머',
                };
              }
            } catch (error) {
              console.error(`❌ Failed to fetch service info for marketUuid: ${marketUuid}, serviceUuid: ${serviceUuid}`, error);
            }
            return null;
          })
        );

        // 응답 데이터를 Map으로 변환 (빠른 조회)
        const serviceInfoMap = serviceResponses.reduce((acc, data) => {
          if (data) acc[`${data.marketUuid},${data.serviceUuid}`] = data;
          return acc;
        }, {});

        // 주문 목록에 서비스 정보 추가
        const updatedOrders = orders.map((order) => {
          const marketUuid = order.service_info?.market_uuid;
          const serviceUuid = order.service_info?.service_uuid;
          const serviceKey = `${marketUuid},${serviceUuid}`;

          return {
            ...order,
            service_title: serviceInfoMap[serviceKey]?.service_title || '서비스명 없음',
            reformer_name: serviceInfoMap[serviceKey]?.reformer_name || '익명 리포머',
          };
        });



        //주문 날짜 기준 내림차순 정렬
        updatedOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

        setOrderList(updatedOrders);
      } catch (error) {
        console.error('❌ 주문 데이터 불러오기 실패:', error);
        Alert.alert('주문 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };




    // 화면이 포커스될 때마다 주문 목록을 새로고침
    useFocusEffect(
      useCallback(() => {
        fetchOrders();
      }, [])
    );

const fetchRejectedReason = async (order_uuid: string) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      Alert.alert('❌ 오류', '로그인이 필요합니다.');
      return;
    }

    const response = await request.get(`/api/orders/${order_uuid}/status?filter=rejected`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('📌 거절 사유 API 응답:', response.data);

    if (response.status === 200) {
      const status = response.data.status;
      if (status === 'rejected') {
        const reason = response.data.rejected_reason || '거절 사유가 없습니다.';
        setRejectedReason(reason);
        setIsRejectedModalVisible(true);
      } else {
        Alert.alert('알림', '해당 주문은 거절된 주문이 아닙니다.');
      }
    } else {
      Alert.alert('❌ 오류', '거절 사유를 불러오는 데 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ 거절 사유 불러오기 실패:', error?.response?.data || error.message);
    Alert.alert('❌ 오류', `거절 사유 조회 중 오류 발생\n${error?.response?.data?.message || error.message}`);
  }
};


    if (loading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      );
    }

    if (!loading && (!orderList || orderList.length === 0)) {
      return (
        <View style={styles.centeredView}>
          <Body16B>주문 내역이 없습니다.</Body16B>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeButton}>
            <Text style={{ color: 'white', fontSize: 16 }}>홈으로 가기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 필터링된 주문 목록
    const filteredOrders = orderList.filter((order) => {
      const status = order.order_status?.[0]?.status || ''; // order_status에서 상태 값 추출
        if (selectedFilter === '전체') return true;
        if (selectedFilter === '거래 전') return status === 'pending';
        if (selectedFilter === '거래 중') return status === 'accepted' || status === 'received' || status === 'produced' || status ==='deliver';
        if (selectedFilter === '거래 완료') return  status ==='end';
        if (selectedFilter === '거절된 주문') return status === 'rejected';

    });

    const updateOrderStatus = async (order_uuid: string, newStatus: string, setOrderList: any) => {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          Alert.alert('❌ 오류', '로그인이 필요합니다.');
          return;
        }

        const url = `/api/orders/${order_uuid}/status`;
        console.log(`📌 주문 상태 업데이트 요청: ${url}, 새로운 상태: ${newStatus}`);

        const data = { status: newStatus };

        const response = await Request().patch(url, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },


        });

        if (response.status === 200) {
          console.log(`✅ 주문 상태 변경 완료: ${newStatus}`);

          // 주문 상태 업데이트 (로컬 상태에서도 반영)
          setOrderList((prevOrders: any) =>
            prevOrders.map((order: any) =>
              order.order_uuid === order_uuid
                ? { ...order, order_status: [{ status: newStatus }] }
                : order
            )
          );
        } else {
          Alert.alert('❌ 오류', `주문 상태 업데이트 실패: 서버 응답 ${response.status}`);
        }
      } catch (error) {
        console.error('❌ 주문 상태 업데이트 실패:', error?.response?.data || error.message);
        Alert.alert(
          '❌ 오류',
          `주문 상태 업데이트 중 오류 발생\n${error?.response?.data?.message || error.message}`
        );
      }
    };

  // 거래 완료 버튼 클릭 핸들러
  const handleCompletedPress = (order:any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  // 모달에서 "거래 완료" 클릭 핸들러
    const handleConfirmCompleted = async () => {
      setIsModalVisible(false);

      if (!selectedOrder) {
        console.error('❌ 오류: 선택된 주문이 없습니다.다시 시도해주세요');
        return;
      }

      console.log('📌 거래 완료 처리 중:', selectedOrder.order_uuid);

      // 주문 상태를 "end"로 변경
      await updateOrderStatus(selectedOrder.order_uuid, 'end', setOrderList);

      // 완료된 주문 화면으로 이동
      navigation.navigate('CompletedOrderPop');
    };

  // 모달에서 "나중에" 클릭 핸들러
  const handleCancel = () => {
    setIsModalVisible(false);
    console.log('나중에 선택');
  };


/*
//** 예시 하드코딩 주문 데이터
  const [orderlist, setOrderList] = useState([
    {
      id: '00001',
      name: '청바지 서비스',
      customer: '###',
      orderDate: '2024-05-22',
      estimated_price: '25000원',
      is_online: true,
      photoUri: 'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp',
      status: 'progress',
    },

  */



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      {loading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : (

      <Tabs.FlatList
        bounces={false}
        overScrollMode="never"
        data={filteredOrders}
        ListHeaderComponent={() => (
          <DropdownSection selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
        )}
        renderItem={({ item: order }: any) => {
            const orderDate = order.order_date ?? "날짜 없음";
            // 첫 번째 order 이미지 가져오기 (현재는 임시, service_image로 대체 필요)
            const orderImage = order.images?.find(img => img.image_type === "order")?.image || "";
          return(
          <View>
          <Text style={{ color: 'black', fontSize: 15, fontWeight:'bold', marginBottom: 2, marginLeft:10 }}> {orderDate}</Text>

          <OrderInfoBox>
            <View style={{ marginTop: 15 }} />
            <View style={{ flexDirection: 'row' }}>
              <ImageContainer source={{ uri: orderImage || '' }} />
              <OrderInfo
                name={order.service_info?.service_title || '알 수 없음'}
                reformer={order.reformer_name || '익명 리포머'}
                estimated_price={`${order.total_price.toLocaleString()}원`}
                is_delivery={order.transaction?.transaction_option === 'delivery'}
                navigation={navigation}
                order ={order}
              />
            </View>
            <OrderIDText>{order.order_uuid}</OrderIDText>
            <OrderStatusLabel order_status={order.order_status} />
            <OrderActionButtons
              status={order.order_status?.[0]?.status || ''}
              isDelivery={order.transaction?.transaction_option === 'delivery'}
              navigation={navigation}
              onPressCompleted={() => handleCompletedPress(order)}  // 거래 완료만 이 함수 실행
              reformerLink={order.service_info?.reformer_info?.reformer_link}
              onPressRejected={() => {
                console.log('거절 사유 조회 order_uuid:', order.order_uuid);
                  setSelectedOrder(order);
                fetchRejectedReason(order.order_uuid);
                }}
            />

            </OrderInfoBox>
          </View>
        )}}
        keyExtractor={(item: any) => item.order_uuid}
        style={{ marginBottom: 60 }}
      />
      )}

      <Modal transparent={true} visible={isModalVisible} onRequestClose={handleCancel}>
        <ModalContainer>
          <ModalBox>
            <Body14R style={{ color: BLACK, textAlign: 'center', marginBottom: 10 }}>
              거래 완료된 상품의 경우 반품/교환 요청이 {'\n'} 불가능하므로 신중히 결정해주세요.
            </Body14R>
            <ButtonContainer>
              <TouchableOpacity onPress={handleCancel} style={styles.laterButton}>
                <Body16B style={{ color: 'white', textAlign: 'center' }}>나중에</Body16B>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmCompleted} style={styles.completeButton}>
                <Body16B style={{ color: PURPLE, textAlign: 'center' }}>거래 완료</Body16B>
              </TouchableOpacity>
            </ButtonContainer>
          </ModalBox>
        </ModalContainer>
      </Modal>


        <Modal
          transparent={true}
          visible={isRejectedModalVisible}
          onRequestClose={() => setIsRejectedModalVisible(false)}
        >
          <ModalContainer>
            <ModalBox>

              <Body16B style={{ color: BLACK, textAlign: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: PURPLE, paddingBottom: 10 }}>
                주문서 거절 안내
              </Body16B>


              <Body16B style={{ color: BLACK, textAlign: 'center', marginBottom: 30,fontWeight: 'bold' }}>
                '{selectedOrder?.reformer_name || selectedOrder?.service_info?.reformer_info?.user_info?.nickname || '익명 리포머'}'님께 전송한 주문서가{'\n'}
                다음과 같은 사유로 거절되었습니다.
              </Body16B>


              {/* 거절 사유 안내 */}
              <Body16B style={{ color: BLACK, marginBottom: 8 }}>거절 사유 안내</Body16B>
              <View style={{ backgroundColor: '#F4F4F4', borderRadius: 8, padding: 12 }}>
                <Body14R style={{ color: PURPLE }}>{rejectedReason}</Body14R>
              </View>

              {/* 버튼 */}
              <TouchableOpacity
                onPress={() => setIsRejectedModalVisible(false)}
                style={[styles.confirmButton, { marginTop: 40 }]}
              >
                <Body16B style={{ color: 'white', textAlign: 'center' }}>확인</Body16B>
              </TouchableOpacity>
            </ModalBox>
          </ModalContainer>
        </Modal>


    </SafeAreaView>
  );
};

// 스타일 정의
const OrderInfoBox = styled.View`
  flex-direction: column;
  border-radius: 14px;
  border-width: 1px;
  padding: 19px;
  margin: 10px;
  justify-content: space-between;
  background-color: white;
`;

const StatusText = styled.Text`
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 14px;
  font-weight: bold;
`;

const OrderIDText = styled.Text`
  position: absolute;
  margin-left: 20px;
  top: 10px;
  font-size: 14px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 15px;
  width: '100%';
`;

const ActionText = styled.Text`
  color: ${BLACK};
  font-size: 14px;
  font-weight: bold;
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  padding: 10px;
  margin: 5px;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${LIGHTGRAY};
  background-color: white;
  align-items: center;
  justify-content: center;
`;

const ImageContainer = styled.Image`
  width: 130px;
  height: 130px;
  border-radius: 8px;
`;

const InfoContainer = styled.View`
  flex: 1;
  padding-left: 10px;
`;

const PickerContainer = styled.View`
  width: ${(props: any) => props.screenWidth * 0.3};
  height: 40px;
  border-radius: 25px;
  background-color: ${PURPLE};
  justify-content: center;

`;


const ModalBox = styled.View`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
`;


const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const styles = StyleSheet.create({

  laterButton: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },


  completeButton: {
    backgroundColor: '#CCFF90',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },

confirmButton: {
  backgroundColor: PURPLE,
  padding:10,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 20,
},

});



export default OrderPage;
