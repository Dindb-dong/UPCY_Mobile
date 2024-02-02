import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Filter14M, Subtitle16B } from '../styles/GlobalText';
import { BLACK, BLACK2, GRAY, PURPLE } from '../styles/GlobalColor';

interface HashtagProps {
  value: string;
  pressable?: boolean;
  pressed?: boolean;
  onPress?: () => void;
}

const Hashtag = ({value, pressable, pressed, onPress} : HashtagProps) => {
  return (
    <HashtagContainer pressed={pressed} onPress={onPress} disabled={!pressable}>
      <Subtitle16B style={{color: pressed ? 'white' : BLACK}}>{value}</Subtitle16B>
    </HashtagContainer>
  )
}

const HashtagContainer = styled.TouchableOpacity<{ pressed: boolean }>`
  display: flex;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  padding: 4px 16px;
  margin: 5px;
  background: ${(props: { pressed: boolean }) => props.pressed ? 'white' : "#dcdcdc"};
`

export default Hashtag;