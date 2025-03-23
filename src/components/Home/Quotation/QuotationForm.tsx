import { SetStateAction, useState, Dispatch, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert, Image } from 'react-native';
import styled from 'styled-components/native';
import { Picker } from '@react-native-picker/picker';
import { BLACK, LIGHTGRAY, PURPLE } from '../../../styles/GlobalColor';
import { Body16M, Caption11M, Caption12M, Body14R, Subtitle16B, Subtitle16M, Subtitle18M, Title20B } from '../../../styles/GlobalText';
import { getStatusBarHeight } from 'react-native-safearea-height';
import CheckBox from '@react-native-community/checkbox';
import { getAccessToken } from '../../../common/storage.js';

import InputBox from '../../../common/InputBox';
import BottomButton from '../../../common/BottomButton';

import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParams } from '../../../pages/Home';

import Arrow from '../../../assets/common/Arrow.svg';
import Search from '../../../assets/common/Search.svg';
import PhotoOptions, { PhotoResultProps } from '../../../common/PhotoOptions';
import Carousel from '../../../common/Carousel';
import Request from '../../../common/requests';
import { MaterialDetail, ServiceDetailOption } from '../Market/Service';
// 서비스 디테일에서 Footer 누르면 연결되는 주문서 보내기 페이지(1)
const statusBarHeight = getStatusBarHeight(true);

interface FilterSectionProps {
  label: string;
  items: any[];
  showDuplicate: boolean;
  onMaterialSelect: (selectedItems: string[]) => void;
}

export type QuotationFormProps = {
  serviceUuid: string;
  marketUuid: string;
}

interface FilterProps {
  value: string;
  onPress: () => void;
  isSelected?: boolean; // 선택된 아이템을 표시하기 위한 prop
}

const Filter = ({ value, onPress, isSelected }: FilterProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected ? styles.selectedFilterButton : null,
      ]}
      onPress={onPress}
    >
      <Text style={[isSelected ? styles.selectedText : null]}>{value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PURPLE,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterButton: {
    backgroundColor: PURPLE,
  },
  selectedFilterButton2: {
    borderColor: PURPLE,
    backgroundColor: '#F0F0FF',
  },

  selectedText: {
    color: 'white', // 선택된 경우의 텍스트색
  },
  optionBox: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderColor: '#D9D9D9',
    borderWidth: 0.5,
  },

  optionText: {
    fontSize: 14,
    color: '#666',
  },
  grayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: LIGHTGRAY,
    borderRadius: 6,
    marginBottom: 20,
    paddingVertical: 6,
  },
  buttonText: {
    marginLeft: 10,
    color: BLACK,
  },
  optionCard: {
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: PURPLE,
    backgroundColor: '#fff',
    flex: 1,
  },
  selectedOptionCard: {
    backgroundColor: '#EDE7F6',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    backgroundColor: '#f0f0f0', // 이미지가 없을 때 회색 배경
  },
  selectedOptionText: {
    color: PURPLE,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionDescription: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    flex: 0.9,
  },
});


const toggleSelection = <T,>(
  selectedItems: T[],
  setSelectedItems: Dispatch<SetStateAction<T[]>>,
  item: T
) => {
  setSelectedItems((prevSelectedItems) => {
    if (prevSelectedItems.includes(item)) {
      return prevSelectedItems.filter((selectedItem) => selectedItem !== item);
    } else {
      return [...prevSelectedItems, item];
    }
  });
};



const handlePhotoUpdate = (
  photos: PhotoResultProps[],
  setPhotos: Dispatch<SetStateAction<PhotoResultProps[]>>,
  newPhotos: PhotoResultProps[]
) => {
  setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
};


const FilterSection = ({ label, items, showDuplicate = true, onMaterialSelect }: FilterSectionProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectItem = (item: string) => {
    toggleSelection(selectedItems, setSelectedItems, item);

  };

  useEffect(() => {

    if (selectedItems.length > 0) {
      onMaterialSelect(selectedItems);
    }
  }, [selectedItems])

  return (
    <FilterContainer>
      <FilterBox style={{ marginBottom: 5, justifyContent: 'space-between' }}>
        <Subtitle18M>{label}</Subtitle18M>
        {showDuplicate && <Caption11M style={{ color: PURPLE }}>• 중복 가능</Caption11M>}
      </FilterBox>
      <FilterBox>
        {items.map((item, index) => (
          <Filter
            key={index}
            value={item}
            isSelected={selectedItems.includes(item)}
            onPress={() => handleSelectItem(item)}
          />
        ))}
      </FilterBox>
    </FilterContainer>
  );
};






const QuotationForm = ({ navigation, route }: StackScreenProps<HomeStackParams, 'QuotationForm'>) => {
    const {serviceUuid,marketUuid} = route.params;
    const [email, setEmail] = useState<string>(''); // 주문자 이메일 추가
    const [serviceInfo, setServiceInfo] = useState<{
      market_name: string;
      reformer_name: string;
      reformer_introduce: string;
      service_image: string;
      basic_price: number;
    } | null>(null);
    const defaultImageUri = 'https://image.made-in-china.com/2f0j00efRbSJMtHgqG/Denim-Bag-Youth-Fashion-Casual-Small-Mini-Square-Ladies-Shoulder-Bag-Women-Wash-Bags.webp';

     const [materials, setMaterials] = useState<MaterialDetail[]>([]);
     const [options, setOptions] = useState<ServiceDetailOption[]>([]);
     const [materialsList, setMaterialsList] = useState<{ material_uuid: string; material_name: string }[]>([]);
     const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
     const [selectedMaterialNames, setSelectedMaterialNames] = useState<string[]>([]); // 선택된 재질 name으로 전달
     const [extraMaterial, setExtraMaterial] = useState<string>(''); // 기타 재질
     const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const request =Request();

     useEffect(() => {

    // 서비스별 데이터 가져오기
        const fetchData = async () => {
          try {
            console.log(`Fetching data for serviceUuid: ${serviceUuid}`); //확인용

            const accessToken = await getAccessToken();

    //api 요청 병렬 처리
        const [infoResponse, materialResponse, optionResponse, ordererResponse] = await Promise.all([
          request.get(`/api/market/${marketUuid}/service/${serviceUuid}`),
          request.get(`/api/market/${marketUuid}/service/${serviceUuid}/material`),
          request.get(`/api/market/${marketUuid}/service/${serviceUuid}/option`),
          request.get(`/api/user`, {}, { headers: { Authorization: `Bearer ${accessToken}` } })
        ]);


          //마켓 데이터 가져오기
          if (infoResponse.status === 200) {
            console.log('✅ Service Info Response:', infoResponse.data);

         // const firstImage = infoResponse.data.service_image?.[0]?.image || defaultImageUri;

          setServiceInfo({
            service_title: infoResponse.data.service_title,
            reformer_name: infoResponse.data.reformer_info?.user_info?.nickname ?? '이름 없음',
            reformer_introduce: infoResponse.data.reformer_info?.user_info?.introduce ?? '소개글 없음',
            service_image: infoResponse.data.service_image?.[0]?.image || defaultImageUri,
            basic_price: infoResponse.data.basic_price??0,  });
          } else {
          console.error('❌ Service API response error:', infoResponse ?? 'No Response');
          }




            //Material 데이터 가져오기

        if (materialResponse.status === 200 && Array.isArray(materialResponse.data)) {
          setMaterialsList(materialResponse.data);
        } else {
          console.error("❌ Material API response error:", materialResponse.data);
        }

            // Option 데이터 가져오기

            if (optionResponse.status === 200 && Array.isArray(optionResponse.data)) {
                      setOptions(optionResponse.data);
           } else {
            console.error('❌ Option API response error:', optionResponse ?? 'No Response');
           }

       // orderer email 가져오기
        if (ordererResponse.status === 200 && ordererResponse.data.email) {
          setEmail(ordererResponse.data.email);
          console.log('✅ 사용자 이메일:', ordererResponse.data.email);
        } else {
          console.error("❌ Orderer API response error:", ordererResponse.data);
        }


          } catch (error) {
            console.error('Error fetching materials or options(api error):', error);
            Alert.alert('데이터를 가져오는 중 문제가 발생했습니다.(api error)');
          }
        };

        fetchData();
      }, [serviceUuid, marketUuid]);

       //option 선택 상태 관리 (선택된 옵션의 인덱스 저장/해제)
      const handleOptionPress = (uuid: string) => {
        setSelectedOptions((prev) => {
          if (prev.includes(uuid)) {
            return prev.filter((item) => item !== uuid);
          }
          return [...prev, uuid];
        });
      };


  const meet = ['대면', '비대면'];




  const [showDuplicate] = useState(true);
  const [text, setText] = useState<string>('');
  const [materialInput, setMaterialInput] = useState<string>(''); // 재질 선택 Input
  //const [finalSelectedMaterials, setFinalSelectedMaterials] = useState<string[]>([]);
  const [additionalRequestInput, setAdditionalRequestInput] = useState<string>(''); //추가요청사항 input
  const [photos, setPhotos] = useState<PhotoResultProps[]>([]);
  const [refPhotos, setRefPhotos] = useState<PhotoResultProps[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string[]>([]);
 // const [selectedOptions, setSelectedOptions] = useState<number[]>([]); //옵션 상세
  const [selectedFilter, setSelectedFilter] = useState<string>(''); // 거래 방식
  const [faceToFaceRegion, setFaceToFaceRegion] = useState<string>(''); // 대면 지역
  const [deliveryType, setDeliveryType] = useState<string>('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);





  const splitArrayIntoPairs = (arr: any[], pairSize: number) => {
    return arr.reduce((result, item, index) => {
      if (index % pairSize === 0) {
        result.push([]);
      }
      result[result.length - 1].push(item);
      return result;
    }, []);
  };

  const splitPhotos = splitArrayIntoPairs(photos, 2);
  const splitRefPhotos = splitArrayIntoPairs(refPhotos, 2);

  const handleOnePress = (value: string) => {
    if (selectedFilter && selectedFilter !== value) {
      Alert.alert('한 개만 선택해주세요');
      return;
    } else if (selectedFilter === value) {
      setSelectedFilter('');
    } else {
      setSelectedFilter(value);
    }
  };
/*
  const handleOptionPress = (index: number) => {
    toggleSelection(selectedOptions, setSelectedOptions, index);
  };
*/
  const handleFilterSelection = (filterType: string) => {
    setSelectedFilter(filterType);
  };

useEffect(() => {

      // 선택된 material name 저장
    const handleMaterialSelect = (selected: string) => {
        setSelectedMaterialNames((prev) =>
          prev.includes(selected) ? prev.filter((item) => item !== selected) : [...prev, selected]
        );
      };

  setExtraMaterial(materialInput || '');
    }, [selectedMaterials, materialInput]);


/*
  setFinalSelectedMaterials([...new Set([...selectedMaterials, materialInput].filter(Boolean))]);
}, [selectedMaterials, materialInput]);
 */

    const handleNextPress = () => {
      if (!selectedFilter) {
        Alert.alert('거래 방식을 선택해주세요');
        return;
      }

      const selectedOptionDetails = selectedOptions.map((uuid) =>
        options.find((option) => option.option_uuid === uuid)
      );

      const navigationTarget = selectedFilter === '대면' ? 'QuotationPage' : 'InputInfo';

      navigation.navigate(navigationTarget, {
        serviceUuid,
        serviceTitle: serviceInfo?.service_title ?? '마켓명 없음',
        orderer_email: email,
        basicPrice: serviceInfo?.basic_price ?? 0,
        photos,
        materialsList,
        selectedMaterialNames,
        extraMaterial,
        transactionMethod: selectedFilter, // 거래 방식 ('대면' 또는 '비대면')
        options: selectedOptionDetails,
        additionalRequest: { text: additionalRequestInput, photos: refPhotos },
      });
    };



  return (
    <ScrollView>
      <BackButton onPress={() => navigation.goBack()}>
        <Arrow color={'white'} />
      </BackButton>
      <SearchButton>
        <Search />
      </SearchButton>
      <ImageBackground
        source={{ uri: serviceInfo?.service_image || defaultImageUri }}
        style={{ width: '100%', height: 210 }}
      >
        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: BLACK, opacity: 0.7 }} />
        <View style={{ paddingTop: 100, paddingLeft: 50 }}>
          <Title20B style={{ color: 'white', marginBottom: 3 }}>
           {serviceInfo?.service_title ?? '마켓명 없음'}
          </Title20B>
          <Caption12M style={{ color: 'white', marginBottom: 18 }}>
            {serviceInfo?.reformer_name ?? '리폼러 닉네임 없음'}
           </Caption12M>
          <Body16M style={{ color: 'white' }}>
           {serviceInfo?.reformer_introduce ?? '마켓 소개글 없음'}
          </Body16M>
        </View>
      </ImageBackground>
      <View style={{ justifyContent: 'center' }}>
        <Subtitle18M style={{ textAlign: 'center', fontWeight: 'bold', paddingVertical: 10 }}>주문서 작성</Subtitle18M>
        {photos.length > 0 &&
          <Carousel
            data={splitPhotos}
            renderItem={({ item, index }: any) => {
              return (
                <View style={{ flexDirection: 'row' }} key={`photo-row-${index}`}>
                  {item.map((subItem: any, subIndex: number) => (
                    <View style={{ width: '50%', paddingHorizontal: 20 }} key={`photo-${subItem.id || subIndex}`}>
                      <ImageBackground
                        source={{ uri: subItem.uri }}
                        style={{ width: '100%', height: 170 }}
                        alt={subItem.fileName}
                      />
                    </View>
                  ))}
                </View>
              );
            }}
            slider
          />
        }
        <View style={{ marginTop: 10, marginLeft: 120, marginRight: 120 }}>
          <PhotoOptions
            style={Object.assign({}, styles.grayButton, { marginright: 5, marginBottom: 5 })}
            max={4}
            setPhoto={(newPhotos) => handlePhotoUpdate(photos, setPhotos, newPhotos)}
            buttonLabel='의뢰할 의류 사진 첨부  '
          />
        </View>
      </View>
      <View style={{ height: 8, backgroundColor: 'white' }} />
      <FilterSection
        label='재질 선택'
        items={materialsList.map(material => material.material_name)}
        showDuplicate={true}
         onMaterialSelect={(selected) => {
           setSelectedMaterialNames(selected);
         }}
     />
      <Subtitle16M style={{ paddingHorizontal: 15, marginBottom: 5 }}>기타 재질</Subtitle16M>
      <View style={{ paddingHorizontal: 10, flex: 1 }}>
        <InputBox
          value={materialInput}
          setValue={setMaterialInput}
          placeholder='의뢰하시는 소재가 상단에 없는 경우 작성해주세요'
          long
          style={{ height: 50, flex: 1 }}
        />
      </View>

      <View style={{ height: 32, backgroundColor: 'white' }} />
      <View style={{ borderBottomWidth: 5, borderColor: '#D9D9D9' }} />

    <View style={styles.optionBox}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Subtitle18M style={{ paddingHorizontal: 15 }}>옵션 상세</Subtitle18M>
        {showDuplicate && <Caption11M style={{ color: PURPLE }}>• 중복 가능</Caption11M>}
      </View>

      {/* options가 존재하고 배열일 경우만 map 실행 */}
      {Array.isArray(options) && options.length > 0 ? (
        options.map((option) => (
          <View key={option.option_uuid} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CheckBox
              value={selectedOptions.includes(option.option_uuid)}
              onValueChange={() => handleOptionPress(option.option_uuid)}
              tintColors={{ true: PURPLE, false: '#D9D9D9' }}
            />
            <TouchableOpacity
              key={option.option_uuid}
              style={[styles.optionCard, selectedOptions.includes(option.option_uuid) && styles.selectedOptionCard]}
              onPress={() => handleOptionPress(option.option_uuid)}
            >
              <Subtitle16M style={selectedOptions.includes(option.option_uuid) ? styles.selectedOptionText : { color: PURPLE }}>
                {option.option_name}
              </Subtitle16M>

              <View style={styles.optionHeader}>
                <Subtitle16M style={selectedOptions.includes(option.option_uuid) ? styles.selectedOptionText : { color: BLACK }}>
                  {option.option_name}
                </Subtitle16M>
                <Body16M style={selectedOptions.includes(option.option_uuid) ? styles.selectedOptionText : { color: BLACK, textAlign: 'right' }}>
                  {option.option_price}
                </Body16M>
              </View>

              <View style={styles.optionContent}>
                <View style={styles.optionDescription}>
                  <Body14R style={{ color: BLACK }}>{option.option_content}</Body14R>
                </View>
                <View style={styles.optionImage}>
                  <Image source={{ uri: option.service_option_image }} style={styles.optionImage} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        // options가 없을 때 표시할 메시지
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Body16M style={{ color: '#888' }}>옵션이 없습니다.</Body16M>
        </View>
      )}
    </View>



      <View style={{ paddingVertical: 20, borderBottomWidth: 5, borderColor: '#D9D9D9', backgroundColor: '#FFFFFF', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Subtitle18M style={{ paddingHorizontal: 15 }}>추가 요청사항</Subtitle18M>
          {<Caption11M style={{ color: PURPLE }}>* 최대 2장 (PNG,JPG) </Caption11M>}
        </View>

        {refPhotos.length > 0 &&
          <Carousel
            data={splitRefPhotos}
            renderItem={({ item, index }: any) => {
              return (
                <View style={{ flexDirection: 'row' }} key={`ref-row-${index}`}>
                  {item.map((subItem: any, subIndex: number) => (
                    <View style={{ width: '50%', paddingHorizontal: 20 }} key={`ref-${subItem.id || subIndex}`}>
                      <ImageBackground
                        source={{ uri: subItem.uri }}
                        style={{ width: '100%', height: 170 }}
                        alt={subItem.fileName}
                      />
                    </View>
                  ))}
                </View>
              );
            }}
            slider
          />
        }
        <View style={{ paddingHorizontal: 13, marginTop: 15 }}>
          <PhotoOptions
            style={Object.assign({}, styles.grayButton, { margin: 5, marginBottom: 5 })}
            max={4}
            setPhoto={(newPhotos) => handlePhotoUpdate(refPhotos, setRefPhotos, newPhotos)}
            buttonLabel='참고 이미지 첨부'
          />
          <InputBox value={additionalRequestInput} setValue={setAdditionalRequestInput} placeholder='예) 16인치 파우치로 만들고 싶어요, 평소 상의 55 사이즈를 입어요' long />
        </View>
      </View>




      <View style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#FFFFFF' }}>
        <Subtitle18M style={{ marginBottom: 10 }}>거래 방식 선택</Subtitle18M>


        {/* 비대면 버튼 */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === '비대면' && styles.selectedFilterButton2,
          ]}
          onPress={() => handleFilterSelection('비대면')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>📦</Text>
            <Text>비대면</Text>
          </View>
          <Text>택배로 리폼된 옷을 받아보세요!</Text>
        </TouchableOpacity>

        {/* 대면 버튼 */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === '대면' && styles.selectedFilterButton2,
          ]}
          onPress={() => handleFilterSelection('대면')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>📍</Text>
            <Text>대면</Text>
          </View>
          <Text>오픈채팅에서 리폼과 약속을 잡아보세요!</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 45, paddingVertical: 20 }}>
        <BottomButton value='다음' pressed={false} onPress={handleNextPress} />
      </View>
    </ScrollView>
  );
};

const BackButton = styled.TouchableOpacity`
  padding: 10px;
  position: absolute;
  left: 0px;
  top: ${statusBarHeight - 10}px;
  z-index: 1;
`;

const SearchButton = styled.TouchableOpacity`
  padding: 10px;
  position: absolute;
  right: 7px;
  top: ${statusBarHeight - 10}px;
  z-index: 1;
`;

const FilterContainer = styled.View`
  padding: 20px 15px;
  border-bottom-width: 0px;
  border-color: #D9D9D9;
  background-color: #FFFFFF;
  margin-bottom: 20px;
`;

const FilterBox = styled.View`
  display: flex;
  flex-direction: row;
  border-color: ${PURPLE};
  flex-wrap: wrap;
  align-items: center;
  background-color:'white';
`;

export default QuotationForm;