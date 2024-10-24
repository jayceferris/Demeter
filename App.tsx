/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import HomeScreen from './screens/HomeScreen';
import AddItem from './screens/AddItem';
import { Provider } from 'react-redux';
import { persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './Redux/store';
import ModifyItem from './screens/ModifyItem';
import SearchScreen from './Archive/SearchScreen';
import * as Keychain from 'react-native-keychain';
import UUID from 'react-native-uuid'


type SectionProps = PropsWithChildren<{
  title: string;
}>;
const Stack = createNativeStackNavigator();
const UUID_KEY = 'user_uuid';

function App(): React.JSX.Element {
  const[uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    const initializeUuid = async () => {
      try {
        const credentials = await Keychain.getGenericPassword({
          service: UUID_KEY,
        })

        let storedUuid;

        if (credentials) {
          storedUuid = credentials.password;
        } else {
          storedUuid = UUID.v4() as string;

          await Keychain.setGenericPassword(UUID_KEY, storedUuid, {
            service: UUID_KEY,
          });
        }

        setUuid(storedUuid)
      } catch(error){
        console.error('Error initializing UUid', error)
      }
    }

    initializeUuid();
  }, [])
  console.log(uuid)

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen}/>
          <Stack.Screen name="AddItem" component={AddItem}/>
          <Stack.Screen name="Modify" component={ModifyItem}/>
          <Stack.Screen name="Search" component={SearchScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
