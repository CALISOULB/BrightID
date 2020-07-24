// @flow

import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  FlatList,
  Text,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TabBar, TabView, SceneMap } from 'react-native-tab-view';
import {
  INVITE_ACTIVE,
  ORANGE,
  CONNECTIONS_TYPE,
  GROUPS_TYPE,
  MISC_TYPE,
} from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
import EmptyList from '@/components/Helpers/EmptyList';
import NotificationCard from './NotificationCard';
import InviteCard from './InviteCard';

let thecount = 0;

const useRefresh = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchUserInfo());
      setRefreshing(false);
    } catch (err) {
      console.log(err.message);
      setRefreshing(false);
    }
  };
  return [refreshing, onRefresh];
};

const ConnectionsList = ({ route }) => {
  const [refreshing, onRefresh] = useRefresh();
  // const pendingConnections = useSelector(
  //   (state) => state.notifications.pendingConnections,
  //   shallowEqual,
  // );

  const pendingConnections = [];

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      data={pendingConnections}
      // keyExtractor={({ inviteId, msg }, index) => index}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyList
          title="Nothing here, come back later.."
          iconType="bell-off-outline"
        />
      }
      renderItem={({ item }) => <InviteCard invite={item} />}
    />
  );
};

const InviteList = ({ route }) => {
  const [refreshing, onRefresh] = useRefresh();
  const invites = useSelector(
    (state) =>
      state.groups.invites.filter(({ state }) => state === INVITE_ACTIVE),
    shallowEqual,
  );
  thecount++;
  console.log('Rendering Invite List', thecount);

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      data={invites}
      keyExtractor={({ inviteId }, index) => inviteId + index}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyList
          title="Nothing here, come back later.."
          iconType="bell-off-outline"
        />
      }
      renderItem={({ item }) => <InviteCard invite={item} />}
    />
  );
};

const MiscList = ({ route }) => {
  const navigation = useNavigation();
  const [refreshing, onRefresh] = useRefresh();
  const data = route.backupPending
    ? [{ msg: 'Backup Pending', icon: 'star' }]
    : [];

  console.log('rendering Misc List');
  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      data={data}
      keyExtractor={({ msg }, index) => msg + index}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyList
          title="Nothing here, come back later.."
          iconType="bell-off-outline"
        />
      }
      renderItem={({ item }) => (
        <NotificationCard
          navigation={navigation}
          msg={item.msg}
          icon={item.icon}
        />
      )}
    />
  );
};

const initialLayout = { width: Dimensions.get('window').width };

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: '#ED7A5D' }}
    style={{ backgroundColor: '#fff' }}
    labelStyle={{}}
    renderLabel={({ route, focused, color }) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {route.badge && <View style={styles.badge} />}
        <Text
          style={{
            fontFamily: 'Poppins',
            fontWeight: '500',
            fontSize: 12,
            color,
            margin: 8,
          }}
        >
          {route.title}
        </Text>
      </View>
    )}
    inactiveColor="#C4C4C4"
    activeColor="#000"
  />
);

export const NotificationsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  // const pendingConnections = useSelector(
  //   (state) => state.notifications.pendingConnections.length,
  // );

  const pendingConnections = 0;
  const invites = useSelector(
    (state) =>
      state.groups.invites.filter(({ state }) => state === INVITE_ACTIVE)
        .length,
  );
  const backupPending = useSelector(
    (state) => state.notifications.backupPending,
  );

  const [index, setIndex] = React.useState(0);
  const routes = [
    {
      key: CONNECTIONS_TYPE,
      title: 'connections',
      badge: !!pendingConnections,
    },
    { key: GROUPS_TYPE, title: 'groups', badge: !!invites },
    {
      key: MISC_TYPE,
      title: 'miscellaneous',
      badge: backupPending,
      backupPending,
    },
  ];

  const renderScene = SceneMap({
    [CONNECTIONS_TYPE]: ConnectionsList,
    [GROUPS_TYPE]: InviteList,
    [MISC_TYPE]: MiscList,
  });

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUserInfo());

      const displayRoute = routes.find(({ badge }) => badge);

      switch (route.params?.type || displayRoute?.key) {
        case CONNECTIONS_TYPE: {
          setIndex(0);
          break;
        }
        case GROUPS_TYPE: {
          setIndex(1);
          break;
        }
        case MISC_TYPE: {
          setIndex(2);
          break;
        }
      }
    }, [dispatch, route.params]),
  );

  console.log('renderingNotificationScreen');

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  badge: {
    backgroundColor: '#ED1B24',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default NotificationsScreen;
