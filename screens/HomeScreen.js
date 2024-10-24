import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import nfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager'
import { useNavigation } from '@react-navigation/native';
import { store } from '../Redux/store';
import ItemList from '../Components/ItemList';
import { useDispatch, useSelector } from 'react-redux';
import { selectItems, removeItem } from '../Redux/itemReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [hasNFC, setHasNFC] = useState(null);
  const [style, setStyle] = useState({});
  const [identifier, setIdentifier] = useState('');
  const [data, setData] = useState('');
  const [id, setId] = useState('0000000000')
  const [modalVisible, setModalVisible] = useState(false)
  const [uniqueModalVisible, setUniqueModalVisible] = useState(false)
  const [tagScanned, setTagScanned] = useState()
  const [item, setItem] = useState()

  const navigation = useNavigation();
  const info = useSelector(selectItems)
  const dispatch = useDispatch()
  
  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }

  const toggleUniqueModal = () => {
    setUniqueModalVisible(!uniqueModalVisible)
  }

  useEffect(() => {
    const checkIsSupport = async () => {
      const deviceIsSupported = await nfcManager.isSupported()

      setHasNFC(deviceIsSupported)
      if (deviceIsSupported) {
        await nfcManager.start()
      }
    }

    checkIsSupport()
  }, [])


  useEffect(() => {
    nfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
      console.log('tag found')
    })

    return () => {
      nfcManager.setEventListener(NfcEvents.DiscoverTag, null)
    }
  }, [])

  const handleTag = (tagScan) => {
    setItem(info.find(obj => obj.container === tagScan))
    handleContainer(tagScan)

  }

  const handleContainer = (tagScan) => {
    const unique = !info.some(item => item.container === tagScan)
    if(unique === true) {
        toggleUniqueModal()
    }
    else{
        toggleModal()
        return
    }
  }

  const handleEdit = () => {
    toggleModal();
    navigation.navigate('Modify', { item })
  }

  const handleDelete = () => {
    const id = item.id
    toggleModal()
    dispatch(removeItem(id))

  }

  async function readNdef() {
    try {
      await nfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await nfcManager.getTag();
      console.log('tag found')
      const tagScan = String.fromCharCode(...(tag.ndefMessage[0].payload.slice(5)))
      handleTag(tagScan)
    }
    catch(ex) {
      console.warn('oops!', ex)
    } finally {
      nfcManager.cancelTechnologyRequest();
    }
  }

  const navigateAddTask = () => {
    navigation.navigate('AddItem')
  }

  const mogalNavigateAdd = () => {
    toggleUniqueModal()
    navigation.navigate('AddItem') 
  }


  if (hasNFC === null) return null;

  return (
    <View style={[styles.container]}>
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Title Here</Text>
        <TouchableOpacity onPress={navigateAddTask} style={styles.button}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
        <ItemList/>
    </SafeAreaView>
    <TouchableOpacity style={styles.containerButton} onPress={readNdef}><Text>Container</Text></TouchableOpacity>
    <Modal
      animationType='fade'
      transparent={true}
      visible={modalVisible}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalItems}>
            <TouchableOpacity onPress={() => handleEdit()} style={[styles.closeButton, {backgroundColor: 'lightblue', borderRadius: 10, margin: 15}]}>
              <Text style={styles.modalText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete()} style={[styles.closeButton, {backgroundColor: 'red', borderRadius: 10, margin: 15}]}>
              <Text style={styles.modalText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => toggleModal()} style={styles.closeButton}>
            <Text style={styles.modalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    <Modal
      animationType='fade'
      transparent={true}
      visible={uniqueModalVisible}
      onRequestClose={toggleUniqueModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text>There is no item associated with this container.</Text>
          <TouchableOpacity onPress={() => mogalNavigateAdd()} style={styles.closeButton}>
            <Text style={styles.modalText}>Add New Item</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleUniqueModal()} style={styles.closeButton}>
            <Text style={styles.modalText}>Close</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 5
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    textAlign: 'center',
    padding: 10,
    color: 'white'
  },
  button: {
    borderRadius: 10,
    backgroundColor: 'black', 
    width: 50,
    },
  title: {
    fontSize: 20,
    paddingTop: 5
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    padding: 20
  },
  modalItems: {
    flexDirection: 'row',
    marginHorizontal: 10
  },
  containerButton: {
    position: 'absolute',
    bottom: 20,
    margin: 20,
    marginHorizontal: 50,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2
  }
  

})