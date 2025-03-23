import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, Modal, Alert, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { getStatusBarHeight } from 'react-native-safearea-height';
import { StackScreenProps } from '@react-navigation/stack';

import Arrow from '../../../assets/common/Arrow.svg';
import { BLACK, GREEN, PURPLE } from '../../../styles/GlobalColor';
import { Body14R, Body14B, Body16M, Caption11M, Caption12M, Caption14M, Filter14M, Subtitle18B, Subtitle16B, Subtitle16M, Subtitle18M, Title20B } from '../../../styles/GlobalText';


import { OrderStackParams } from '../Order/OrderManagement';

const statusBarHeight = getStatusBarHeight(true);

const QuotationReview = ({ navigation, route }: StackScreenProps<OrderStackParams, 'QuotationReview'>) => {
  const order = route.params?.order;

  if (!order) {
    console.error('QuotationReview: order 데이터가 전달되지 않았습니다.', route.params);
    Alert.alert('오류', '주문 정보를 불러올 수 없습니다.');
    return null;
  }

//데이터 변환: order 데이터를 QuotationPage 구조로 변환
// 주문서 이미지 (order)
const orderImages = order.images
  ?.filter(img => img.image_type === "order")
  .map(img => ({ uri: img.image })) || [];

// 추가 요청 이미지 (additional)
const additionalImages = order.images
  ?.filter(img => img.image_type === "additional")
  .map(img => ({ uri: img.image })) || [];

const transformedData = {
  serviceTitle: order.service_title,
  email: order.orderer_information?.orderer_email || '',
  photos: order.images?.map((img) => ({ uri: img.image })) || [],
  materialsList: order.materials || [],
  selectedMaterialNames: order.materials?.map((mat) => mat.material_name) || [],
  extraMaterial: order.extra_material || '',
  transactionMethod: order.transaction?.transaction_option || '',
  options: order.additional_options || [],
  additionalRequest: {
    text: order.additional_request || '',
    photos: order.images?.map((img) => ({ uri: img.image })) || []
  },
  name: order.orderer_information?.orderer_name || '',
  tel: order.orderer_information?.orderer_phone_number || '',
  address: order.orderer_information?.orderer_address || '',
  basicPrice: order.service_price || 0,
  optionAdditionalPrice: order.option_price || 0,
  totalPrice: order.total_price || 0,};

// 재질 목록 (기본 재질 + 추가 재질 포함)
const finalMaterials = [
  ...(transformedData.selectedMaterialNames || []),
  transformedData.extraMaterial
].filter(Boolean).join(', ');

// 옵션 데이터
const options = order.additional_options?.map(option => ({
  option_name: option.option_name || '옵션명 없음',
  option_price: option.option_price ? `${option.option_price.toLocaleString()}원` : '0원',
  option_content: option.option_content || '내용 없음',
  service_option_image: option.service_option_images?.[0] || '',
})) || [];


  // 전체 주소
  const fullAddress = transformedData.address.trim();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [additionalModalVisible, setAdditionalModalVisible] = useState(false);

  return (
    <ScrollView>
      <BackButton onPress={() => navigation.goBack()}>
        <Arrow color={BLACK} />
      </BackButton>

      <Title20B style={{ marginTop: 5, marginBottom: 15, color: 'black', textAlign: 'center' }}>
        주문서 확인
      </Title20B>

      <View style={{ backgroundColor: 'white', marginHorizontal: 10 }}>
        <View style={{ marginHorizontal: 20, paddingVertical: 10, alignItems: 'center' }}>
          <Subtitle16B style={{ color: 'black' }}>주문서</Subtitle16B>
          <View style={styles.divider} />
          <Subtitle18B style={{ color: 'black', marginBottom: 5 }}>{transformedData.serviceTitle}</Subtitle18B>
        </View>

    <Subtitle18B style={{ color: 'black', marginTop: 20 ,marginHorizontal:10}}>의뢰한 의류 정보</Subtitle18B>
        {transformedData.photos.length > 0 && (
          <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={{ uri: transformedData.photos[0].uri }}
                style={{ width: 200, height: 150, borderRadius: 10 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}

        <Subtitle18B style={{ color: 'black', marginTop: 10, marginHorizontal:10  }}>재질</Subtitle18B>
          <Body14R style={{ color: 'black', marginTop: 10, marginHorizontal:10 }}> {finalMaterials || '없음'} </Body14R>




<View style={{ backgroundColor: 'white', marginHorizontal: 10, paddingVertical: 20 }}>
  <Subtitle18B style={{ color: 'black', marginBottom: 10 }}>추가한 옵션</Subtitle18B>

      {/* 옵션이 있을 경우 */}
      {options.length > 0 ? (
        options.map((option, index) => (
          <View key={index} style={styles.optionCard}>
            <Subtitle16M style={{ color: PURPLE }}>{option.option_name}</Subtitle16M>

            <View style={styles.optionHeader}>
              <Subtitle16M style={{ color: BLACK }}>{option.option_name}</Subtitle16M>
              <Body16M style={{ color: BLACK, textAlign: 'right' }}>{option.option_price}</Body16M>
            </View>

            <View style={styles.optionContent}>

              {option.service_option_image ? (
                <Image source={{ uri: option.service_option_image }} style={styles.optionImage} />
              ) : null}
            </View>
          </View>
        ))
      ) : (
        // 옵션이 없을 경우
        <Body16M style={{ color: '#888', textAlign: 'center' }}>추가한 옵션이 없습니다.</Body16M>
      )}
    </View>


    {   /* 추가 요청사항 */}
    <Subtitle18B style={{ color: 'black', marginTop: 20,marginHorizontal:10 }}>추가 요청사항</Subtitle18B>
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <View
        style={{
          backgroundColor: '#E9EBF8',
          width: '90%',
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Body14R style={{ color: 'black', marginBottom: 10 }}>
          {transformedData.additionalRequest.text || '없음'}
        </Body14R>

        {transformedData.additionalRequest.photos?.length > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: '#CEBFFA',
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setAdditionalModalVisible(true)}
          >
            <Body14R style={{ color: 'white' }}>참고 사진 보기</Body14R>
          </TouchableOpacity>
        )}
      </View>

      {/* 추가 요청사항 사진 모달 */}
      <Modal visible={additionalModalVisible} transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setAdditionalModalVisible(false)}>
              <Text style={{ fontSize: 18, color: 'black' }}>X</Text>
            </TouchableOpacity>
            <ScrollView>
              {transformedData.additionalRequest.photos?.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>


        <View style={{ marginTop: 30, marginBottom: 40 }}>
          <TextBox>
            <Subtitle16M style={{ flex: 1 }}>서비스 금액</Subtitle16M>
            <Body14R style={{ flex: 1.5, textAlign: 'right' }}>
              {transformedData.basicPrice.toLocaleString()}원
            </Body14R>
          </TextBox>

          <TextBox>
            <Subtitle16M style={{ flex: 1 }}>옵션 추가 금액</Subtitle16M>
            <Body14R style={{ flex: 1.5, textAlign: 'right' }}>
              {transformedData.optionAdditionalPrice.toLocaleString()}원
            </Body14R>
          </TextBox>

          <View
            style={{
              height: 1,
              backgroundColor: BLACK,
              width: '100%',
              paddingHorizontal: 40,
              marginVertical: 10,
            }}
          />

          <TextBox>
            <Subtitle16B style={{ flex: 1 }}>예상 결제 금액</Subtitle16B>
            <Subtitle16B style={{ flex: 1.5, textAlign: 'right' }}>
              {transformedData.totalPrice.toLocaleString()}원
            </Subtitle16B>
          </TextBox>
        </View>


        {/*주문 정보 */}


        <TextBox>
          <Subtitle16B style={{ flex: 1 }}>이름</Subtitle16B>
          <Body14R style={{ flex: 1.5, textAlign: 'right' }}>
            {transformedData.name || '없음'}
          </Body14R>
        </TextBox>

        <TextBox>
          <Subtitle16B style={{ flex: 1 }}>연락처</Subtitle16B>
          <Body14R style={{ flex: 1.5, textAlign: 'right' }}>
            {transformedData.tel || '없음'}
          </Body14R>
        </TextBox>

        <TextBox>
          <Subtitle16B style={{ flex: 1 }}>주소</Subtitle16B>
          <Body14R style={{ flex: 1.5, textAlign: 'right' }}>
            {fullAddress || '없음'}
          </Body14R>
        </TextBox>

          <View style={{ backgroundColor: "#F4F4F4", marginHorizontal: 10, alignItems: 'center', paddingVertical: 15 }}>

            <View
              style={{ paddingHorizontal: 30, alignSelf: 'center', marginVertical: 5 }}>
              <Text style={{ paddingHorizontal: 30, textAlign: 'center', color: BLACK }}>
                   해당 주문의 결과물 이미지는 업씨러가 사용에 동의하였습니다.
              </Text>
            </View>
          </View>

                    {/* 전체보기 모달 */}
                  <Modal visible={modalVisible} transparent={true}>
                    <View style={styles.modalBackground}>
                      <View style={styles.modalContent}>
                        <TouchableOpacity
                          //style={styles.closeButton}
                          onPress={() => setModalVisible(false)}
                        >
                          <Text style={{ fontSize: 18, color: 'black' }}>X</Text>
                        </TouchableOpacity>
                        <ScrollView>
                          {transformedData.photos?.map((photo, index) => (
                            <Image
                              key={index}
                              source={{ uri: photo.uri }}
                              style={styles.modalImage}
                              resizeMode="contain"
                            />
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>




      </View>
    </ScrollView>
  );
};

//스타일 정의
const BackButton = styled.TouchableOpacity`
  padding: 10px;
  position: absolute;
  left: 0px;
  top: ${statusBarHeight - 10}px;
  z-index: 1;
`;

const TextBox = styled.View`
  flex-direction: row;
  padding: 8px 25px;
  justify-content: space-between;
`;

const InfoBox = styled.View`
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 10px;
  margin-top: 10px;
`;

const styles = StyleSheet.create({
  divider: {
    height: 2.5,
    backgroundColor: PURPLE,
    width: '100%',
    marginTop: 5,
    marginBottom: 20
  },
  viewPhotosButton: {
    backgroundColor: '#CEBFFA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 250,
    marginBottom: 10,
    borderRadius: 10
  },
    optionCard: {
      borderColor: PURPLE,
      borderWidth: 1,
      padding: 10,
      marginVertical: 10,
      borderRadius: 10,
      backgroundColor: 'white'
    },
    optionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10
    },
    optionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10
    },
    optionDescription: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#F0F0F0',
      borderRadius: 8,
    },
    optionImage: {
      width: 70,
      height: 70,
      borderRadius: 5,
      backgroundColor: '#f0f0f0', // 이미지가 없을 때 회색 배경
    }
});

export default QuotationReview;