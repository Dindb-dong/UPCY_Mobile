import React, { useState } from 'react';
import { FlatList, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, View, Modal, Text, Alert } from 'react-native';
import styled from 'styled-components/native';
import { getStatusBarHeight } from 'react-native-safearea-height';
import { Body14R, Subtitle18B, Subtitle16M, Subtitle16B, Title20B } from '../../../styles/GlobalText';
import { BLACK, LIGHTGRAY, PURPLE } from '../../../styles/GlobalColor';
import Arrow from '../../../assets/common/Arrow.svg';
import InputBox from '../../../common/InputBox';
import BottomButton from '../../../common/BottomButton';
import { StackScreenProps } from '@react-navigation/stack';
import { OrderStackParams } from '../Order/OrderManagement';
import Request from '../../../common/requests.js';
import { getAccessToken } from '../../../common/storage.js';

interface RejectionProps extends StackScreenProps<OrderStackParams, 'Rejection'> {
  onClose?: () => void;
}

const statusBarHeight = getStatusBarHeight(true);

// 거절 사유 데이터
const data = [
  { id: 1, text: "요청하신 리폼을 할 수 없는 소재" },
  { id: 2, text: "요청하신 리폼을 할 수 없는 원단 크기" },
  { id: 3, text: "서비스 주문량 폭증으로 수락 불가" },
  { id: 4, text: "제작하기 어려운 요청 사항" },
  { id: 5, text: "기타" },
];

const Rejection = ({ navigation, route, onClose }: RejectionProps) => {
  const order = route.params?.order;
  const orderUuid = order?.order_uuid;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handlePress = (id: number) => {
    setSelectedId(id);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 🔹 서버로 주문 거절 요청 보내기
  const handleConfirmRejection = async () => {
    if (!orderUuid) {
      Alert.alert('오류', '주문 UUID를 찾을 수 없습니다.');
      return;
    }

    const selectedReasonText = data.find(item => item.id === selectedId)?.text || '';
    const finalReason = selectedId === 5 ? customReason.trim() : selectedReasonText;

    if (!selectedId || !finalReason) {
      Alert.alert('오류', '거절 사유를 선택하거나 입력해 주세요.');
      return;
    }

    try {
      const request = Request();
      const accessToken = await getAccessToken();

      const url = `/api/orders/${orderUuid}/status`;
      const payload = {
        status: "rejected",
        rejected_reason: finalReason,
      };

      console.log("보낼 데이터:", payload);
          console.log("주문 상태:", payload.status);
          console.log("거절 사유:", payload.rejected_reason);

      const response = await request.patch(url, payload, {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      });

      if (response && response.status === 200) {
        Alert.alert('성공', '주문이 거절되었습니다.');
        navigation.navigate('SentRejection');
      } else {
        console.error('거절 실패:', response.data);
        Alert.alert('실패', '주문 거절 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('API 요청 오류:', error.response || error.message);
      Alert.alert('에러', '서버 통신 중 오류가 발생했습니다.');
    }

    setIsModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <BackButton onPress={onClose}>
        <Arrow color={BLACK} />
      </BackButton>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View style={{ marginTop: 30 }}>
          <Title20B style={{ textAlign: 'center' }}>주문서 거절 사유</Title20B>
          <View style={{ padding: 20, marginVertical: 15, alignItems: 'center' }}>
            <Subtitle18B>주문서를 거절한 이유가 무엇인가요?</Subtitle18B>
            <View style={{ marginVertical: 3 }} />
            <Body14R>다음 주문서를 작성할 때 많은 도움이 돼요.</Body14R>
            <View style={{ marginVertical: 20 }} />
            <FlatList
              data={data}
              style={{ height: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    borderRadius: 8,
                    borderColor: PURPLE,
                    borderWidth: 1,
                    backgroundColor: item.id === selectedId ? PURPLE : 'white',
                    paddingHorizontal: 55,
                    paddingVertical: 15,
                    marginVertical: 5
                  }}
                  onPress={() => handlePress(item.id)}
                >
                  <Subtitle16M style={{ color: item.id === selectedId ? 'white' : PURPLE, textAlign: 'center' }}>
                    {item.text}
                  </Subtitle16M>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id.toString()}
            />

            {selectedId === 5 && (
              <View style={{ width: '100%', marginTop: 2 }}>
                <InputBox
                  placeholder='추가적인 의견이나 거절 사유가 있다면 작성해 주세요'
                  long
                  value={customReason}
                  onChangeText={setCustomReason}
                  style={{ width: '100%' }}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 모달: 거절 확인 */}
      <Modal transparent={true} visible={isModalVisible} onRequestClose={handleCancel}>
        <ModalContainer>
          <ModalBox>
            <Subtitle16B style={{ textAlign: 'center', marginBottom: 10 }}>
              해당 거래를 정말 거절하시겠어요?
            </Subtitle16B>
            <Text style={{ textAlign: 'center', marginBottom: 15 }}>
              거절 사유가 업씨러에게 전달됩니다
            </Text>

            <ButtonContainer>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity onPress={handleConfirmRejection} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </ButtonContainer>
          </ModalBox>
        </ModalContainer>
      </Modal>

      {/* 하단 버튼 */}
      <View style={{ position: 'absolute', width: '100%', bottom: 0, borderTopWidth: 8, borderColor: 'white', zIndex: 1, backgroundColor: 'white', paddingHorizontal: 10 }}>
        <View style={{ paddingHorizontal: 30, paddingVertical: 20 }}>
          <BottomButton value='주문 거절하기' pressed={false} onPress={() => setIsModalVisible(true)} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const BackButton = styled.TouchableOpacity`
  padding: 10px;
  position: absolute;
  left: 0px;
  top: ${statusBarHeight - 10}px;
  z-index: 1;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalBox = styled.View`
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  align-items: center;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  width: 100%;
`;

const styles = StyleSheet.create({
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: LIGHTGRAY,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    backgroundColor: PURPLE,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    width: 10,
  },
});

export default Rejection;
