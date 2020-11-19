// @flow

import React from 'react';
import { TouchableOpacity } from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

type TaskStateProps = {
  complete: boolean,
  onClick: ?() => any,
};

export const TaskState = ({ complete, onClick }: TaskStateProps) => {
  return (
    <TouchableOpacity onPress={onClick}>
      <IonIcons
        style={{ alignSelf: 'center' }}
        size={DEVICE_LARGE ? 48 : 42}
        name={
          complete ? 'checkmark-circle-outline' : 'radio-button-off-outline'
        }
        color={complete ? '#5DEC9A' : '#707070'}
      />
    </TouchableOpacity>
  );
};
