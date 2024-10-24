import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { selectItems, selectPremium } from '../Redux/itemReducer';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { addItem } from '../Redux/itemReducer';
import { store } from '../Redux/store';
import nfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager'
import foodData from '../foodItems.json'

const Form = () => {
    function addDays(date, days){
        const result = new Date(date);
        result.setDate(result.getDate() + Number(days))
        return result
    }
    const data = useSelector(selectItems)
    const premium = useSelector(selectPremium)
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [itemName, setItemName] = useState('');
    const [time, setTime] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [container, setContainer] = useState('00000000')
    const [style, setStyle] = useState({})
    const [textStyle, setTextStyle] = useState({})
    const [uniqueContainer, setUniqueContainer] = useState(true)
    
    const [modalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
        setModalVisible(!modalVisible)
    }

    const [premiumModalVisible, setPremiumModalVisible] = useState(false);
    const togglePremiumModal = () => {
        setPremiumModalVisible(!premiumModalVisible)
    }

    const handleSearch = (text) => {
        setItemName(text);
        if (text) {
            const results = foodData.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(results);
        } else {
            setFilteredData([]);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setTime(item.expiration.toString());
        setFilteredData([]);
        setItemName(item.name);
    };

    const getBackgroundStyle = (twoDigitString) => {
        const number = parseInt(twoDigitString, 10); 
      
        const styles = {
          1: { backgroundColor: '#d64646'},
          2: { backgroundColor: '#2a7ca8' },
          3: { backgroundColor: '#2aa84f' },
          4: { backgroundColor: 'yellow' },
          5: { backgroundColor: 'purple' },
          6: { backgroundColor: 'orange' },
          7: { backgroundColor: 'pink' },
          8: { backgroundColor: 'brown' },
          9: { backgroundColor: 'grey' },
          10: { backgroundColor: 'cyan' },
        };
      
        // Return the corresponding style or a default style if the number is out of range
        return styles[number] || { backgroundColor: 'white' };
      };
    const generateUniqueId = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let uniqueId = '';
        for (let i = 0; i < 6; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          uniqueId += characters[randomIndex];
        }
        return uniqueId;
      };
      function clearContainer() {
        setContainer('00000000')
        setStyle({ backgroundColor: 'white' })
        return
      }

      const checkUniqueContainer = (numberToCheck) => {
        console.log(numberToCheck)
          if(numberToCheck === '00000000'){
            return
          }
          else{
            const unique = !data.some(item => item.container === numberToCheck); 
            setUniqueContainer(unique)
            return
          }
        }
      
      const handlePremium = () => {
        if(premium){
          handleAddTask();
        }
        else{
          if(data.length > 3){
            togglePremiumModal();
          }
          else {
            handleAddTask();
          }
        }
      }
      
      const handleContainer = () => {
        if(container === '00000000'){
          handlePremium();
          return
        }
        const unique = !data.some(item => item.container === container);
        if(unique === true) {
            handlePremium();
            return
        }
        else{
            clearContainer();
            toggleModal();
            return
        }
      }

      async function readNdef() {
        try {
          await nfcManager.requestTechnology(NfcTech.Ndef);
          const tag = await nfcManager.getTag();
          console.log('tag found')
          setContainer(String.fromCharCode(...(tag.ndefMessage[0].payload.slice(5))))
          setStyle(getBackgroundStyle(String.fromCharCode(...(tag.ndefMessage[0].payload.slice(3))).substring(0,2)))
        }
        catch(ex) {
          console.warn('oops!', ex)
        } finally {
          nfcManager.cancelTechnologyRequest();
        }
      }
    const handleTextStyle = () => {
        if(container === '0000000000'){
            return;
        }
        else{
            setTextStyle({color: 'white'})
            return
        }
    }
    const handleAddTask = () => {
        const currDate = new Date()
        const expirationDate = addDays(currDate, time)
        const itemID = generateUniqueId();
        handleTextStyle();
        const newItem = {
            name: itemName,
            id: itemID,
            dateAdded: currDate, 
            expirationDate: expirationDate,
            container: container,
            style: style,
            textStyle: textStyle
          };
        dispatch(addItem(newItem))  
        navigation.goBack();
        }
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Food Item Name"
            placeholderTextColor="darkgrey"
            value={itemName}
            onChangeText={handleSearch}
          />
          {filteredData.length > 0 && (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectItem(item)}>
                            <Text style={styles.listItem}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    style={styles.flatList}
                />
            )}
          <TextInput
            style={styles.input}
            placeholder="Expiration (in days) "
            placeholderTextColor="darkgrey"
            keyboardType="numeric"
            value={time}
            onChangeText={setTime}
          />
          <TouchableOpacity style={styles.button} onPress={readNdef}><Text style={styles.buttonText}>Add Container</Text></TouchableOpacity>
          <View style={[styles.colorShow, style]}/>
      </View>
          <TouchableOpacity onPress={handleContainer} style={styles.button}><Text style={styles.buttonText}>Add Item</Text></TouchableOpacity>
            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={toggleModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>This container is already in use. Please use a different container.</Text>
                        <TouchableOpacity onPress={() => toggleModal()} style={styles.closeButton}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType='fade'
                transparent={true}
                visible={premiumModalVisible}
                onRequestClose={togglePremiumModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>You have reached the max items you can add</Text>
                        <TouchableOpacity onPress={() => togglePremiumModal()} style={styles.closeButton}>
                            <Text style={styles.buttonText}>Subscribe to Premium</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => togglePremiumModal()} style={styles.closeButton}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
    </View>
    
  )
}

export default Form

const styles = StyleSheet.create({
      container: {
        alignItems: 'center',
      },
      inputContainer: {
        paddingTop: 100,
        paddingBottom: 20,
        alignItems: 'center'
      },
      textInputContainer: {
        paddingBottom: 5
      },
      input: {
        borderRadius: 10,
        fontSize: 20,
        padding: 10,
        backgroundColor: '#e2e2e2',
        marginBottom: 10,
        width: 200,
        zIndex: 1
      },
      flatList: {
        position: 'absolute',
        top: 145, // Adjust based on the position of the first TextInput
        left: 5, // Adjust based on your container's padding
        right: 5, // Adjust based on your container's padding
        backgroundColor: 'white',
        zIndex: 2, // Ensures FlatList is shown above TextInput
        maxHeight: 150, // Adjust based on how many items you want visible at once
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
      },
      listItem: {
        padding: 10,
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    }, 
      button: {
        borderRadius: 10,
        backgroundColor: 'black', 
        textAlign: 'center',
        padding: 10
        },
      buttonText: {
        color: 'white',
        textAlign: 'center',
        padding: 5,
        fontSize: 20
      },
      colorShow: {
        width: 50,
        height: 50,
        margin: 10,
        borderRadius: 10,
        borderWidth: 1
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
        marginBottom: 20,
        fontColor: 'white'
      },
      closeButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
      },
})